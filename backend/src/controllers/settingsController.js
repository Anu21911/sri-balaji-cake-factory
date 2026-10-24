const Settings = require('../models/Settings');
const AuditLog = require('../models/AuditLog');

// Get public settings (Contact, Location, Policies, Delivery fee)
exports.getSettings = async (req, res) => {
  try {
    const list = await Settings.find({});
    let settings = list[0];

    if (!settings) {
      settings = await Settings.create({});
    }

    res.json({
      success: true,
      settings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve settings' });
  }
};

// Owner: Update business settings (hours, delivery fee, policies, phone, etc.)
exports.updateSettings = async (req, res) => {
  try {
    const list = await Settings.find({});
    let settings = list[0];

    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      settings = await Settings.findByIdAndUpdate(settings._id || settings.id, {
        ...req.body,
        updatedAt: new Date()
      }, { new: true });
    }

    await AuditLog.create({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: String(settings._id || settings.id),
      performedBy: { role: 'owner', id: req.owner.id, name: req.owner.name },
      details: req.body
    });

    res.json({
      success: true,
      message: 'Business settings updated successfully.',
      settings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update business settings' });
  }
};
