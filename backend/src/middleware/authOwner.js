const jwt = require('jsonwebtoken');
const Owner = require('../models/Owner');

async function authOwner(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Owner authentication required. Access denied.'
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'sri_balaji_cake_factory_jwt_super_secret_2026_key';
    const decoded = jwt.verify(token, secret);

    // Strictly verify role and isOwner marker
    if (decoded.role !== 'owner' || !decoded.isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Strict Security Violation: Access restricted exclusively to verified Sri Balaji Cake Factory Owner.'
      });
    }

    const owner = await Owner.findById(decoded.id);
    if (!owner) {
      return res.status(401).json({
        success: false,
        message: 'Owner record verification failed on server.'
      });
    }

    // Attach verified owner info to request
    req.owner = {
      id: owner._id || owner.id,
      name: owner.name,
      mobile: owner.mobile,
      role: 'owner',
      mustChangePassword: !!owner.mustChangePassword
    };

    // If owner still needs to change password on first login, allow /change-password, /me, and /profile
    const isAllowedAuthEndpoint = 
      req.path.includes('/change-password') || 
      req.path.includes('/me') || 
      req.path.includes('/profile') ||
      (req.originalUrl && (req.originalUrl.includes('/change-password') || req.originalUrl.includes('/me') || req.originalUrl.includes('/profile')));
    
    if (owner.mustChangePassword && !isAllowedAuthEndpoint) {
      return res.status(403).json({
        success: false,
        mustChangePassword: true,
        message: 'Security Policy: You must change your initial temporary password before continuing.'
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Owner session invalid or expired. Please log in again.'
    });
  }
}

module.exports = authOwner;
