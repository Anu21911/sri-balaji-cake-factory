const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authOwner = require('../middleware/authOwner');
const authCustomer = require('../middleware/authCustomer');

// Owner notifications
router.get('/owner', authOwner, notificationController.getOwnerNotifications);
router.put('/owner/:id/read', authOwner, notificationController.markAsRead);

// Customer notifications
router.get('/customer', authCustomer, notificationController.getCustomerNotifications);

module.exports = router;
