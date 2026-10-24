const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Owner = require('../models/Owner');
const AuditLog = require('../models/AuditLog');

const JWT_SECRET = process.env.JWT_SECRET || 'sri_balaji_cake_factory_jwt_super_secret_2026_key';

// CUSTOMER SIGNUP
exports.customerRegister = async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;

    if (!name || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, mobile number, and password are required.'
      });
    }

    const cleanMobile = String(mobile).replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number.'
      });
    }

    const existingUser = await User.findOne({ mobile: cleanMobile });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this mobile number already exists. Please log in.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      mobile: cleanMobile,
      email: (email || '').trim().toLowerCase(),
      passwordHash,
      role: 'customer',
      isVerified: true,
      addresses: []
    });

    const token = jwt.sign(
      { id: newUser._id || newUser.id, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to Sri Balaji Cake Factory.',
      token,
      user: {
        id: newUser._id || newUser.id,
        name: newUser.name,
        mobile: newUser.mobile,
        email: newUser.email,
        addresses: newUser.addresses,
        role: 'customer'
      }
    });
  } catch (err) {
    console.error('Customer register error:', err);
    res.status(500).json({
      success: false,
      message: 'Registration failed due to server error. Please try again.'
    });
  }
};

// CUSTOMER LOGIN
exports.customerLogin = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both mobile number and password.'
      });
    }

    const cleanMobile = String(mobile).replace(/\D/g, '');
    const user = await User.findOne({ mobile: cleanMobile });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No customer account found with this mobile number.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify and try again.'
      });
    }

    const token = jwt.sign(
      { id: user._id || user.id, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        addresses: user.addresses || [],
        role: 'customer'
      }
    });
  } catch (err) {
    console.error('Customer login error:', err);
    res.status(500).json({
      success: false,
      message: 'Login failed due to server error.'
    });
  }
};

// CUSTOMER PROFILE
exports.customerMe = async (req, res) => {
  try {
    const user = await User.findById(req.customer.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        addresses: user.addresses || [],
        role: 'customer'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
};

// CUSTOMER ADD/UPDATE ADDRESS
exports.customerSaveAddress = async (req, res) => {
  try {
    const { street, landmark, city, pincode, label, isDefault } = req.body;
    if (!street) {
      return res.status(400).json({ success: false, message: 'Street address is required.' });
    }

    const user = await User.findById(req.customer.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const newAddress = {
      id: Date.now().toString(),
      label: label || 'Home',
      street: street.trim(),
      landmark: (landmark || '').trim(),
      city: city || 'Narsapur',
      pincode: pincode || '',
      isDefault: !!isDefault
    };

    let updatedAddresses = [...(user.addresses || [])];
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
    }
    updatedAddresses.push(newAddress);

    await User.findByIdAndUpdate(user._id || user.id, { addresses: updatedAddresses });

    res.json({
      success: true,
      message: 'Address saved successfully.',
      addresses: updatedAddresses
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error saving address' });
  }
};

// OWNER LOGIN
exports.ownerLogin = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Owner mobile and password are required.'
      });
    }

    const cleanMobile = String(mobile).replace(/\D/g, '');
    const owner = await Owner.findOne({ mobile: cleanMobile });

    if (!owner) {
      return res.status(401).json({
        success: false,
        message: 'Owner authentication failed. Unrecognized owner credentials.'
      });
    }

    const isMatch = await bcrypt.compare(password, owner.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid owner credentials.'
      });
    }

    const token = jwt.sign(
      { 
        id: owner._id || owner.id, 
        role: 'owner',
        isOwner: true 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login
    await Owner.findByIdAndUpdate(owner._id || owner.id, { lastLogin: new Date() });

    await AuditLog.create({
      action: 'OWNER_LOGIN',
      entityType: 'owner',
      entityId: String(owner._id || owner.id),
      performedBy: { role: 'owner', id: String(owner._id || owner.id), name: owner.name },
      details: { ip: req.ip, userAgent: req.headers['user-agent'] }
    });

    res.json({
      success: true,
      message: 'Owner authenticated successfully.',
      token,
      owner: {
        id: owner._id || owner.id,
        name: owner.name,
        mobile: owner.mobile,
        role: 'owner',
        mustChangePassword: !!owner.mustChangePassword
      }
    });
  } catch (err) {
    console.error('Owner login error:', err);
    res.status(500).json({
      success: false,
      message: 'Owner login failed due to server error.'
    });
  }
};

// OWNER CHANGE PASSWORD
exports.ownerChangePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const owner = await Owner.findById(req.owner.id);
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Owner record not found.' });
    }

    // If current password provided, verify it
    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, owner.passwordHash);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password does not match.'
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await Owner.findByIdAndUpdate(owner._id || owner.id, {
      passwordHash: newHash,
      mustChangePassword: false,
      updatedAt: new Date()
    });

    await AuditLog.create({
      action: 'OWNER_PASSWORD_CHANGE',
      entityType: 'owner',
      entityId: String(owner._id || owner.id),
      performedBy: { role: 'owner', id: String(owner._id || owner.id), name: owner.name },
      details: { message: 'Owner updated password and fulfilled security policy.' }
    });

    res.json({
      success: true,
      message: 'Password updated successfully! First-time security check fulfilled.'
    });
  } catch (err) {
    console.error('Owner change password error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update password.'
    });
  }
};

// OWNER ME / VERIFY
exports.ownerMe = async (req, res) => {
  try {
    const owner = await Owner.findById(req.owner.id);
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Owner not found' });
    }

    res.json({
      success: true,
      owner: {
        id: owner._id || owner.id,
        name: owner.name,
        mobile: owner.mobile,
        role: 'owner',
        mustChangePassword: !!owner.mustChangePassword
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving owner profile' });
  }
};
