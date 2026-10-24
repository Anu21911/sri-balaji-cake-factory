const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authOwner = require('../middleware/authOwner');

// Public settings route
router.get('/', settingsController.getSettings);

// Owner update settings route
router.put('/', authOwner, settingsController.updateSettings);

module.exports = router;
