const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authCustomer = require('../middleware/authCustomer');
const authOwner = require('../middleware/authOwner');
const { ownerLoginLimiter, customerAuthLimiter } = require('../middleware/rateLimiter');

// Customer Auth Routes
router.post('/customer/register', customerAuthLimiter, authController.customerRegister);
router.post('/customer/login', customerAuthLimiter, authController.customerLogin);
router.get('/customer/me', authCustomer, authController.customerMe);
router.post('/customer/address', authCustomer, authController.customerSaveAddress);

// Dedicated Owner Auth Routes (Strictly Isolated)
router.post('/owner/login', ownerLoginLimiter, authController.ownerLogin);
router.post('/owner/change-password', authOwner, authController.ownerChangePassword);
router.get('/owner/me', authOwner, authController.ownerMe);

module.exports = router;
