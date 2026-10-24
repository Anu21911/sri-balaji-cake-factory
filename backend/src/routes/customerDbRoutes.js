const express = require('express');
const router = express.Router();
const customerDbController = require('../controllers/customerDbController');
const authOwner = require('../middleware/authOwner');

// Strictly Owner-Only Customer Database Routes
router.get('/', authOwner, customerDbController.getCustomerDatabase);
router.get('/export/csv', authOwner, customerDbController.exportCustomerCsv);
router.get('/:id', authOwner, customerDbController.getCustomerDetails);

module.exports = router;
