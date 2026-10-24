const Notification = require('../models/Notification');

// OWNER: GET NOTIFICATIONS
exports.getOwnerNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientRole: 'owner' });
    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch owner notifications' });
  }
};

// OWNER: MARK NOTIFICATION AS READ
exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    if (notificationId === 'all') {
      const allOwner = await Notification.find({ recipientRole: 'owner' });
      for (const n of allOwner) {
        await Notification.findByIdAndUpdate(n._id || n.id, { isRead: true });
      }
      return res.json({ success: true, message: 'All notifications marked as read.' });
    }

    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark notification read' });
  }
};

// CUSTOMER: GET NOTIFICATIONS
exports.getCustomerNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientRole: 'customer',
      recipientId: req.customer.id
    });
    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch customer notifications' });
  }
};
