const User = require('../models/User');
const Order = require('../models/Order');

// Owner only: Get searchable, filterable customer database
exports.getCustomerDatabase = async (req, res) => {
  try {
    const { search, filter } = req.query;

    const allUsers = await User.find({ role: 'customer' });
    const allOrders = await Order.find({});

    let customerRecords = allUsers.map(user => {
      const userId = String(user._id || user.id);
      const userOrders = allOrders.filter(o => o.customer.id === userId || o.customer.mobile === user.mobile);

      const completedOrders = userOrders.filter(o => o.orderStatus === 'completed').length;
      const pendingOrders = userOrders.filter(o => ['new', 'accepted', 'in_preparation', 'ready_for_dispatch', 'out_for_delivery'].includes(o.orderStatus)).length;
      const cancelledOrRejected = userOrders.filter(o => ['cancelled', 'rejected'].includes(o.orderStatus)).length;
      const totalSpend = userOrders
        .filter(o => o.orderStatus === 'completed')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      return {
        id: userId,
        name: user.name,
        mobile: user.mobile,
        email: user.email || '—',
        savedAddresses: user.addresses || [],
        registeredAt: user.createdAt,
        totalOrders: userOrders.length,
        completedOrders,
        pendingOrders,
        cancelledOrRejected,
        totalSpend
      };
    });

    if (search) {
      const term = search.toLowerCase();
      customerRecords = customerRecords.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.mobile.includes(term) ||
        c.email.toLowerCase().includes(term)
      );
    }

    if (filter === 'active') {
      customerRecords = customerRecords.filter(c => c.totalOrders > 0);
    } else if (filter === 'pending') {
      customerRecords = customerRecords.filter(c => c.pendingOrders > 0);
    }

    res.json({
      success: true,
      count: customerRecords.length,
      customers: customerRecords
    });
  } catch (err) {
    console.error('Customer DB fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve customer database.' });
  }
};

// Owner only: Get individual customer details with complete order history
exports.getCustomerDetails = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const allOrders = await Order.find({});
    const orders = allOrders.filter(o => o.customer.id === userId || o.customer.mobile === user.mobile);

    res.json({
      success: true,
      customer: {
        id: String(user._id || user.id),
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        savedAddresses: user.addresses || [],
        registeredAt: user.createdAt
      },
      orders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get customer details' });
  }
};

// Owner only: Export customer database to CSV
exports.exportCustomerCsv = async (req, res) => {
  try {
    const allUsers = await User.find({ role: 'customer' });
    const allOrders = await Order.find({});

    const headers = [
      'Customer ID',
      'Name',
      'Mobile Number',
      'Email',
      'Registration Date',
      'Total Orders',
      'Completed Orders',
      'Pending Orders',
      'Cancelled/Rejected',
      'Total Spent (INR)'
    ];

    const rows = allUsers.map(user => {
      const userId = String(user._id || user.id);
      const userOrders = allOrders.filter(o => o.customer.id === userId || o.customer.mobile === user.mobile);

      const completed = userOrders.filter(o => o.orderStatus === 'completed').length;
      const pending = userOrders.filter(o => ['new', 'accepted', 'in_preparation', 'ready_for_dispatch', 'out_for_delivery'].includes(o.orderStatus)).length;
      const rejectedOrCancelled = userOrders.filter(o => ['cancelled', 'rejected'].includes(o.orderStatus)).length;
      const totalSpend = userOrders.filter(o => o.orderStatus === 'completed').reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      const regDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A';

      return [
        `"${userId}"`,
        `"${user.name.replace(/"/g, '""')}"`,
        `"${user.mobile}"`,
        `"${(user.email || '').replace(/"/g, '""')}"`,
        `"${regDate}"`,
        userOrders.length,
        completed,
        pending,
        rejectedOrCancelled,
        totalSpend
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="sri_balaji_customers_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (err) {
    console.error('CSV export error:', err);
    res.status(500).json({ success: false, message: 'Failed to export customer CSV' });
  }
};
