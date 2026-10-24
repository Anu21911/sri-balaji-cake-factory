const CustomCakeRequest = require('../models/CustomCakeRequest');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Settings = require('../models/Settings');
const { getIO } = require('../sockets/socketHandler');

// Helper for unique order number
function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `SBCF-CUSTOM-${dateStr}-${randomSuffix}`;
}

// CUSTOMER: SUBMIT CUSTOM CAKE IDEA
exports.submitCustomIdea = async (req, res) => {
  try {
    const {
      cakeName,
      description,
      flavour,
      weight,
      cakeMessage,
      deliveryDate,
      timeSlot,
      deliveryAddress,
      customerName,
      mobile,
      additionalInstructions
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a reference picture for your cake design.'
      });
    }

    if (!cakeName || !description || !flavour || !weight || !deliveryDate || !timeSlot || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields including cake theme, description, flavour, weight, delivery date, and address.'
      });
    }

    const validFlavours = ['Pineapple', 'Butterscotch', 'Chocolate', 'Vanilla', 'Rasmalai'];
    if (!validFlavours.includes(flavour)) {
      return res.status(400).json({
        success: false,
        message: `Please select from our available flavours: ${validFlavours.join(', ')}`
      });
    }

    const validWeights = ['1 kg', '2 kg', '3 kg'];
    if (!validWeights.includes(weight)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid weight: 1 kg, 2 kg, or 3 kg.'
      });
    }

    const referenceImageUrl = `/uploads/${req.file.filename}`;

    const newRequest = await CustomCakeRequest.create({
      customer: {
        id: req.customer.id,
        name: customerName || req.customer.name,
        mobile: mobile || req.customer.mobile
      },
      cakeName: cakeName.trim(),
      description: description.trim(),
      flavour,
      weight,
      cakeMessage: (cakeMessage || '').trim(),
      referenceImage: referenceImageUrl,
      deliveryDate,
      timeSlot,
      deliveryAddress: deliveryAddress.trim(),
      additionalInstructions: (additionalInstructions || '').trim(),
      quotedPrice: null, // Price awaiting owner confirmation
      status: 'pending_review'
    });

    // Persistent Owner notification
    const notification = await Notification.create({
      recipientRole: 'owner',
      title: `🎂 New Custom Cake Idea: ${cakeName}`,
      message: `${req.customer.name} uploaded a custom design idea (${flavour}, ${weight}). Awaiting feasibility and price quote.`,
      type: 'custom_cake',
      link: `/owner/custom-cakes`,
      data: {
        requestId: String(newRequest._id || newRequest.id),
        cakeName,
        customerName: req.customer.name,
        flavour,
        weight
      }
    });

    // Real-time socket notification to owner
    const io = getIO();
    if (io) {
      io.to('owner_room').emit('new_custom_cake_request', {
        request: newRequest,
        notification
      });
    }

    res.status(201).json({
      success: true,
      message: 'Your custom cake idea has been submitted! Our owner RAKESH will review your reference photo and provide a personalized price quote shortly.',
      request: newRequest
    });
  } catch (err) {
    console.error('Submit custom idea error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit custom cake idea.' });
  }
};

// CUSTOMER: GET OWN CUSTOM CAKE REQUESTS
exports.getCustomerCustomRequests = async (req, res) => {
  try {
    const requests = await CustomCakeRequest.find({ 'customer.id': req.customer.id });
    res.json({
      success: true,
      requests
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch custom requests' });
  }
};

// OWNER: GET ALL CUSTOM CAKE REQUESTS
exports.getOwnerCustomRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const requests = await CustomCakeRequest.find(query);
    res.json({
      success: true,
      requests
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch custom requests' });
  }
};

// OWNER: QUOTE PRICE AND ACCEPT/REJECT CUSTOM REQUEST
exports.ownerReviewCustomRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status, quotedPrice, ownerNotes, rejectionReason } = req.body;

    const request = await CustomCakeRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Custom cake request not found.' });
    }

    const updates = { updatedAt: new Date() };

    if (status === 'quoted') {
      if (!quotedPrice || Number(quotedPrice) <= 0) {
        return res.status(400).json({ success: false, message: 'Please provide a valid quoted price.' });
      }
      updates.status = 'quoted';
      updates.quotedPrice = Number(quotedPrice);
      updates.ownerNotes = ownerNotes || 'Custom cake design approved by owner. Ready for customer confirmation.';

      // Notify customer
      await Notification.create({
        recipientRole: 'customer',
        recipientId: request.customer.id,
        title: `Quote Ready: ${request.cakeName}`,
        message: `Owner quoted ₹${quotedPrice} for your custom cake idea "${request.cakeName}". Review and confirm your order now!`,
        type: 'quote_received',
        link: `/my-custom-requests`,
        data: { requestId, quotedPrice: Number(quotedPrice) }
      });

      const io = getIO();
      if (io) {
        io.to(`customer_${request.customer.id}`).emit('custom_cake_quote_ready', {
          requestId,
          quotedPrice: Number(quotedPrice),
          cakeName: request.cakeName
        });
      }
    } else if (status === 'rejected') {
      if (!rejectionReason || !rejectionReason.trim()) {
        return res.status(400).json({ success: false, message: 'Please provide a reason for rejecting this custom design.' });
      }
      updates.status = 'rejected';
      updates.rejectionReason = rejectionReason.trim();

      // Notify customer
      await Notification.create({
        recipientRole: 'customer',
        recipientId: request.customer.id,
        title: `Custom Design Update: ${request.cakeName}`,
        message: `Your custom cake idea could not be accepted. Note: ${rejectionReason.trim()}`,
        type: 'order_status',
        link: `/my-custom-requests`,
        data: { requestId, status: 'rejected', rejectionReason }
      });

      const io = getIO();
      if (io) {
        io.to(`customer_${request.customer.id}`).emit('custom_cake_rejected', {
          requestId,
          rejectionReason
        });
      }
    }

    const updated = await CustomCakeRequest.findByIdAndUpdate(requestId, updates);

    await AuditLog.create({
      action: `CUSTOM_CAKE_${status.toUpperCase()}`,
      entityType: 'custom_cake',
      entityId: String(requestId),
      performedBy: { role: 'owner', id: req.owner.id, name: req.owner.name },
      details: { status, quotedPrice, rejectionReason }
    });

    res.json({
      success: true,
      message: `Custom cake request updated to ${status}.`,
      request: updated
    });
  } catch (err) {
    console.error('Owner review custom request error:', err);
    res.status(500).json({ success: false, message: 'Failed to review custom request.' });
  }
};

// CUSTOMER: ACCEPT QUOTE & CONVERT TO REAL ORDER
exports.customerAcceptQuoteAndOrder = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { paymentMethod, instructions } = req.body;

    const request = await CustomCakeRequest.findById(requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

    if (request.customer.id !== req.customer.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (request.status !== 'quoted' || !request.quotedPrice) {
      return res.status(400).json({ success: false, message: 'Quote has not been set or request is not in quotable state.' });
    }

    // Settings for delivery rate
    const settingsList = await Settings.find({});
    const settings = settingsList[0] || {};
    const deliveryRate = Number(settings.deliveryFeePerKm || 4);
    const distanceKm = 5;
    const deliveryFee = distanceKm * deliveryRate;
    const totalAmount = Number(request.quotedPrice) + deliveryFee;

    const orderNumber = generateOrderNumber();

    const newOrder = await Order.create({
      orderNumber,
      customer: {
        id: req.customer.id,
        name: req.customer.name,
        mobile: req.customer.mobile,
        email: req.customer.email || ''
      },
      items: [
        {
          productId: `custom-${requestId}`,
          name: `Custom Idea: ${request.cakeName}`,
          category: 'cake',
          flavour: request.flavour,
          weight: request.weight,
          unitPrice: Number(request.quotedPrice),
          quantity: 1,
          total: Number(request.quotedPrice),
          cakeMessage: request.cakeMessage,
          image: request.referenceImage
        }
      ],
      cakeSubtotal: Number(request.quotedPrice),
      celebrationSubtotal: 0,
      subtotal: Number(request.quotedPrice),
      deliveryDistanceKm: distanceKm,
      deliveryFee,
      discount: 0,
      totalAmount,
      paymentMethod: paymentMethod === 'ONLINE' ? 'ONLINE' : 'COD',
      paymentStatus: paymentMethod === 'ONLINE' ? 'verified' : 'pending',
      orderStatus: 'accepted', // Since owner already approved quote!
      deliveryAddress: {
        street: request.deliveryAddress,
        landmark: '',
        city: 'Narsapur',
        pincode: '',
        contactNumber: request.customer.mobile
      },
      deliveryDate: request.deliveryDate,
      timeSlot: request.timeSlot,
      instructions: instructions || request.additionalInstructions || '',
      historyTimeline: [
        {
          status: 'accepted',
          timestamp: new Date(),
          note: `Custom cake quote accepted by customer for ₹${request.quotedPrice}. Order confirmed!`
        }
      ]
    });

    // Mark custom cake request as ordered
    await CustomCakeRequest.findByIdAndUpdate(requestId, {
      status: 'ordered',
      convertedOrderId: String(newOrder._id || newOrder.id)
    });

    // Notify owner
    const notification = await Notification.create({
      recipientRole: 'owner',
      title: `🎉 Custom Cake Order Confirmed: ${orderNumber}`,
      message: `${req.customer.name} accepted quote of ₹${request.quotedPrice} for custom cake "${request.cakeName}". Order ${orderNumber} is now active!`,
      type: 'new_order',
      link: `/owner/orders/accepted`,
      data: { orderId: String(newOrder._id || newOrder.id), orderNumber, totalAmount }
    });

    const io = getIO();
    if (io) {
      io.to('owner_room').emit('new_order_received', { order: newOrder, notification });
    }

    res.json({
      success: true,
      message: 'Custom cake order placed successfully! Baking will begin as scheduled.',
      order: newOrder
    });
  } catch (err) {
    console.error('Customer accept quote error:', err);
    res.status(500).json({ success: false, message: 'Failed to convert quote to order.' });
  }
};
