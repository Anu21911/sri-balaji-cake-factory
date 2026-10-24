const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authCustomer = require('../middleware/authCustomer');
const authOwner = require('../middleware/authOwner');

// Customer / Public Order Calculation
router.post('/preview', orderController.previewOrder);

// Customer Order Operations
router.post('/', authCustomer, orderController.createOrder);
router.get('/my-orders', authCustomer, orderController.getCustomerOrders);
router.post('/:id/cancel', authCustomer, orderController.customerCancelOrder);

// Owner Order Operations
router.get('/owner/all', authOwner, orderController.getOwnerOrders);
router.get('/owner/stats', authOwner, orderController.getDashboardStats);
router.post('/owner/:id/accept', authOwner, orderController.ownerAcceptOrder);
router.post('/owner/:id/reject', authOwner, orderController.ownerRejectOrder);
router.post('/owner/:id/status', authOwner, orderController.ownerUpdateOrderStatus);

// Single Order Lookup (Customer or Owner)
router.get('/:id', async (req, res, next) => {
  // Try customer auth, if fails try owner auth
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'sri_balaji_cake_factory_jwt_super_secret_2026_key';
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], secret);
    if (decoded.role === 'owner') {
      return authOwner(req, res, () => orderController.getOrderById(req, res));
    } else {
      return authCustomer(req, res, () => orderController.getOrderById(req, res));
    }
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

module.exports = router;
