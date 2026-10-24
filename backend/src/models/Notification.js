const { createModel } = require('./modelAdapter');

const notificationSchemaDef = {
  recipientRole: { type: String, required: true, enum: ['owner', 'customer'] },
  recipientId: { type: String, default: null }, // Null for general owner notifications
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['new_order', 'custom_cake', 'order_status', 'order_cancelled', 'quote_received', 'general']
  },
  link: { type: String, default: '' },
  data: { type: Object, default: {} },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

const Notification = createModel('Notification', notificationSchemaDef, 'notifications');

module.exports = Notification;
