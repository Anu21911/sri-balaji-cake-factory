const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Settings = require('../models/Settings');
const { getIO } = require('../sockets/socketHandler');

// Helper to generate unique human-readable order number
function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `SBCF-${dateStr}-${randomSuffix}`;
}

// 1. CALCULATE ORDER AMOUNTS ON BACKEND (Strict validation)
async function calculateOrderTotals(items, deliveryDistanceKm = 5) {
  let cakeSubtotal = 0;
  let celebrationSubtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new Error(`Product with ID ${item.productId} was not found in our catalog.`);
    }

    if (!product.isAvailable) {
      throw new Error(`Item "${product.name}" is currently unavailable.`);
    }

    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    let unitPrice = product.basePrice;

    if (product.category === 'cake') {
      const selectedWeight = item.weight || '1 kg';
      if (selectedWeight === '2 kg') {
        unitPrice = product.basePrice * 2;
      } else if (selectedWeight === '3 kg') {
        unitPrice = product.basePrice * 3;
      } else {
        unitPrice = product.basePrice; // 1 kg
      }
      const itemTotal = unitPrice * qty;
      cakeSubtotal += itemTotal;

      verifiedItems.push({
        productId: String(product._id || product.id),
        name: product.name,
        category: 'cake',
        flavour: product.flavour,
        weight: selectedWeight,
        unitPrice,
        quantity: qty,
        total: itemTotal,
        cakeMessage: (item.cakeMessage || '').trim(),
        image: product.image
      });
    } else {
      // Celebration item
      if (product.variants && product.variants.length > 0 && item.selectedVariant) {
        const variantObj = product.variants.find(v => v.name === item.selectedVariant);
        if (variantObj) {
          unitPrice = variantObj.price;
        }
      }
      const itemTotal = unitPrice * qty;
      celebrationSubtotal += itemTotal;

      verifiedItems.push({
        productId: String(product._id || product.id),
        name: product.name,
        category: 'celebration',
        selectedVariant: item.selectedVariant || null,
        unitPrice,
        quantity: qty,
        total: itemTotal,
        image: product.image
      });
    }
  }

  const subtotal = cakeSubtotal + celebrationSubtotal;
  
  // Fetch settings for delivery fee per km (default ₹4/km)
  const settingsList = await Settings.find({});
  const settings = settingsList[0] || {};
  const ratePerKm = Number(settings.deliveryFeePerKm || 4);
  const distance = Math.max(1, Number(deliveryDistanceKm) || 5);
  const deliveryFee = distance * ratePerKm;

  const discount = 0;
  const totalAmount = subtotal + deliveryFee - discount;

  return {
    verifiedItems,
    cakeSubtotal,
    celebrationSubtotal,
    subtotal,
    deliveryDistanceKm: distance,
    deliveryFee,
    discount,
    totalAmount
  };
}

// Preview / Price Check Endpoint (Customer cart calculation)
exports.previewOrder = async (req, res) => {
  try {
    const { items, deliveryDistanceKm } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty.' });
    }

    const calc = await calculateOrderTotals(items, deliveryDistanceKm);
    res.json({
      success: true,
      calculation: calc
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// CREATE ORDER (Customer only)
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      deliveryDistanceKm,
      deliveryAddress,
      deliveryDate,
      timeSlot,
      instructions,
      paymentMethod
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Please add items to your cart before ordering.' });
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.contactNumber) {
      return res.status(400).json({ success: false, message: 'Complete delivery address and contact number are required.' });
    }

    if (!deliveryDate || !timeSlot) {
      return res.status(400).json({ success: false, message: 'Please select a delivery date and preferred time slot.' });
    }

    // Backend price enforcement
    const calc = await calculateOrderTotals(items, deliveryDistanceKm);

    const orderNumber = generateOrderNumber();

    const newOrder = await Order.create({
      orderNumber,
      customer: {
        id: req.customer.id,
        name: req.customer.name,
        mobile: req.customer.mobile,
        email: req.customer.email || ''
      },
      items: calc.verifiedItems,
      cakeSubtotal: calc.cakeSubtotal,
      celebrationSubtotal: calc.celebrationSubtotal,
      subtotal: calc.subtotal,
      deliveryDistanceKm: calc.deliveryDistanceKm,
      deliveryFee: calc.deliveryFee,
      discount: calc.discount,
      totalAmount: calc.totalAmount,
      paymentMethod: paymentMethod === 'ONLINE' ? 'ONLINE' : 'COD',
      paymentStatus: paymentMethod === 'ONLINE' ? 'verified' : 'pending',
      orderStatus: 'new',
      deliveryAddress: {
        street: deliveryAddress.street.trim(),
        landmark: (deliveryAddress.landmark || '').trim(),
        city: deliveryAddress.city || 'Narsapur',
        pincode: deliveryAddress.pincode || '',
        contactNumber: deliveryAddress.contactNumber.trim()
      },
      deliveryDate,
      timeSlot,
      instructions: (instructions || '').trim(),
      historyTimeline: [
        {
          status: 'new',
          timestamp: new Date(),
          note: 'Order submitted by customer. Awaiting owner review.'
        }
      ]
    });

    // Create persistent owner notification
    const notification = await Notification.create({
      recipientRole: 'owner',
      title: `🔔 New Order Received: ${orderNumber}`,
      message: `${req.customer.name} placed order ${orderNumber} for ₹${calc.totalAmount} (${deliveryDate}, ${timeSlot})`,
      type: 'new_order',
      link: `/owner/orders/new`,
      data: {
        orderId: String(newOrder._id || newOrder.id),
        orderNumber,
        customerName: req.customer.name,
        totalAmount: calc.totalAmount,
        orderTime: new Date()
      }
    });

    // Real-time Socket.IO emission to Owner Dashboard
    const io = getIO();
    if (io) {
      io.to('owner_room').emit('new_order_received', {
        order: newOrder,
        notification
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Sri Balaji Cake Factory owner is reviewing your order.',
      order: newOrder
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to place order.' });
  }
};

// GET CUSTOMER'S OWN ORDERS (Strictly customer only)
exports.getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'customer.id': req.customer.id });
    res.json({
      success: true,
      orders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch customer orders' });
  }
};

// GET SINGLE ORDER (Customer can see their own, Owner can see any)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // If customer, verify ownership
    if (req.customer && order.customer.id !== req.customer.id) {
      return res.status(403).json({ success: false, message: 'Access denied to this order.' });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching order' });
  }
};

// CUSTOMER CANCEL ORDER (Only if status is 'new')
exports.customerCancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.customer.id !== req.customer.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (order.orderStatus !== 'new') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled now as preparation has already commenced. Please contact the bakery at 9963390327.'
      });
    }

    const updatedTimeline = [
      ...(order.historyTimeline || []),
      {
        status: 'cancelled',
        timestamp: new Date(),
        note: `Cancelled by customer. Reason: ${reason || 'Customer requested cancellation.'}`
      }
    ];

    const updated = await Order.findByIdAndUpdate(order._id || order.id, {
      orderStatus: 'cancelled',
      cancellationReason: reason || 'Customer requested cancellation.',
      historyTimeline: updatedTimeline
    });

    // Notify Owner
    const notification = await Notification.create({
      recipientRole: 'owner',
      title: `Order Cancelled: ${order.orderNumber}`,
      message: `Customer ${order.customer.name} cancelled order ${order.orderNumber}. Reason: ${reason || 'None specified'}`,
      type: 'order_cancelled',
      data: { orderNumber: order.orderNumber, reason }
    });

    const io = getIO();
    if (io) {
      io.to('owner_room').emit('order_cancelled', { orderNumber: order.orderNumber, notification });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully.',
      order: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to cancel order' });
  }
};

// OWNER: GET ALL ORDERS WITH STATUS FILTERS & STATS
exports.getOwnerOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    let orders = await Order.find(query);

    if (search) {
      const term = search.toLowerCase();
      orders = orders.filter(o => 
        o.orderNumber.toLowerCase().includes(term) ||
        o.customer.name.toLowerCase().includes(term) ||
        o.customer.mobile.includes(term)
      );
    }

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    console.error('Get owner orders error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch owner orders' });
  }
};

// OWNER: GET DASHBOARD STATS SUMMARY
exports.getDashboardStats = async (req, res) => {
  try {
    const allOrders = await Order.find({});
    const today = new Date().toISOString().slice(0, 10);

    const todayOrders = allOrders.filter(o => (o.createdAt || '').toString().slice(0, 10) === today);

    const stats = {
      todayCount: todayOrders.length,
      todayRevenue: todayOrders
        .filter(o => o.orderStatus !== 'rejected' && o.orderStatus !== 'cancelled')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      totalIncoming: allOrders.filter(o => o.orderStatus === 'new').length,
      totalAccepted: allOrders.filter(o => o.orderStatus === 'accepted').length,
      totalInPreparation: allOrders.filter(o => o.orderStatus === 'in_preparation').length,
      totalReadyForDispatch: allOrders.filter(o => o.orderStatus === 'ready_for_dispatch' || o.orderStatus === 'out_for_delivery').length,
      totalCompleted: allOrders.filter(o => o.orderStatus === 'completed').length,
      totalRejected: allOrders.filter(o => o.orderStatus === 'rejected').length,
      totalCancelled: allOrders.filter(o => o.orderStatus === 'cancelled').length,
      totalOrdersCount: allOrders.length,
      totalRevenue: allOrders
        .filter(o => o.orderStatus === 'completed')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    };

    // Check low stock products
    const products = await Product.find({});
    const lowStockProducts = products.filter(p => p.stock <= 10);

    res.json({
      success: true,
      stats,
      lowStockProducts
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
};

// OWNER: ACCEPT ORDER
exports.ownerAcceptOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { note } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const updatedTimeline = [
      ...(order.historyTimeline || []),
      {
        status: 'accepted',
        timestamp: new Date(),
        note: note || 'Order accepted by Sri Balaji Cake Factory owner RAKESH.'
      }
    ];

    const updated = await Order.findByIdAndUpdate(orderId, {
      orderStatus: 'accepted',
      historyTimeline: updatedTimeline
    });

    await AuditLog.create({
      action: 'ORDER_ACCEPTED',
      entityType: 'order',
      entityId: String(orderId),
      performedBy: { role: 'owner', id: req.owner.id, name: req.owner.name },
      details: { orderNumber: order.orderNumber, note }
    });

    // Notify customer
    await Notification.create({
      recipientRole: 'customer',
      recipientId: order.customer.id,
      title: `Order Accepted: ${order.orderNumber}`,
      message: `Your order ${order.orderNumber} has been accepted by the bakery! Baking will begin shortly.`,
      type: 'order_status',
      link: `/my-orders`,
      data: { orderId, orderNumber: order.orderNumber, status: 'accepted' }
    });

    const io = getIO();
    if (io) {
      io.to(`customer_${order.customer.id}`).emit('order_status_updated', {
        orderId,
        orderNumber: order.orderNumber,
        status: 'accepted',
        message: 'Your order was accepted by the bakery!'
      });
    }

    res.json({
      success: true,
      message: `Order ${order.orderNumber} successfully accepted!`,
      order: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to accept order' });
  }
};

// OWNER: REJECT ORDER (Reason mandatory!)
exports.ownerRejectOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is mandatory to explain to the customer.'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const updatedTimeline = [
      ...(order.historyTimeline || []),
      {
        status: 'rejected',
        timestamp: new Date(),
        note: `Order rejected. Reason: ${reason.trim()}`
      }
    ];

    const updates = {
      orderStatus: 'rejected',
      rejectionReason: reason.trim(),
      historyTimeline: updatedTimeline
    };

    // If customer paid online, mark payment refunded
    if (order.paymentMethod === 'ONLINE' && order.paymentStatus === 'verified') {
      updates.paymentStatus = 'refunded';
    }

    const updated = await Order.findByIdAndUpdate(orderId, updates);

    await AuditLog.create({
      action: 'ORDER_REJECTED',
      entityType: 'order',
      entityId: String(orderId),
      performedBy: { role: 'owner', id: req.owner.id, name: req.owner.name },
      details: { orderNumber: order.orderNumber, reason }
    });

    // Notify customer with rejection reason
    await Notification.create({
      recipientRole: 'customer',
      recipientId: order.customer.id,
      title: `Order Update: ${order.orderNumber}`,
      message: `Your order could not be fulfilled. Reason: ${reason.trim()}. If charged, refund has been initiated.`,
      type: 'order_status',
      link: `/my-orders`,
      data: { orderId, orderNumber: order.orderNumber, status: 'rejected', reason }
    });

    const io = getIO();
    if (io) {
      io.to(`customer_${order.customer.id}`).emit('order_status_updated', {
        orderId,
        orderNumber: order.orderNumber,
        status: 'rejected',
        reason: reason.trim()
      });
    }

    res.json({
      success: true,
      message: `Order ${order.orderNumber} has been rejected with recorded reason.`,
      order: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reject order' });
  }
};

// OWNER: UPDATE WORKFLOW STATUS (in_preparation, ready_for_dispatch, out_for_delivery, completed)
exports.ownerUpdateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, note } = req.body;

    const allowed = ['in_preparation', 'ready_for_dispatch', 'out_for_delivery', 'completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid workflow status.' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const statusLabels = {
      in_preparation: 'Order is being freshly baked and decorated in our bakery kitchen.',
      ready_for_dispatch: 'Cake is packaged securely in bakery box, ready for dispatch.',
      out_for_delivery: 'Cake is out for delivery with our delivery executive.',
      completed: 'Order successfully delivered to customer!'
    };

    const updatedTimeline = [
      ...(order.historyTimeline || []),
      {
        status,
        timestamp: new Date(),
        note: note || statusLabels[status]
      }
    ];

    const updates = {
      orderStatus: status,
      historyTimeline: updatedTimeline
    };

    if (status === 'completed' && order.paymentMethod === 'COD') {
      updates.paymentStatus = 'verified';
    }

    const updated = await Order.findByIdAndUpdate(orderId, updates);

    await AuditLog.create({
      action: `ORDER_STATUS_${status.toUpperCase()}`,
      entityType: 'order',
      entityId: String(orderId),
      performedBy: { role: 'owner', id: req.owner.id, name: req.owner.name },
      details: { orderNumber: order.orderNumber, newStatus: status, note }
    });

    // Notify Customer
    await Notification.create({
      recipientRole: 'customer',
      recipientId: order.customer.id,
      title: `Order Status: ${order.orderNumber}`,
      message: statusLabels[status],
      type: 'order_status',
      link: `/my-orders`,
      data: { orderId, orderNumber: order.orderNumber, status }
    });

    const io = getIO();
    if (io) {
      io.to(`customer_${order.customer.id}`).emit('order_status_updated', {
        orderId,
        orderNumber: order.orderNumber,
        status,
        message: statusLabels[status]
      });
    }

    res.json({
      success: true,
      message: `Order status moved to "${status}".`,
      order: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};
