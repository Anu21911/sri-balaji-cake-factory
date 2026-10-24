const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authCustomer(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in as a customer.'
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'sri_balaji_cake_factory_jwt_super_secret_2026_key';
    const decoded = jwt.verify(token, secret);

    if (decoded.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Access restricted to customer accounts.'
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Customer account not found. Please log in again.'
      });
    }

    req.customer = {
      id: user._id || user.id,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      role: 'customer'
    };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.'
    });
  }
}

module.exports = authCustomer;
