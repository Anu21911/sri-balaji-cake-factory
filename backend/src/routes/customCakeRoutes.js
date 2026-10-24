const express = require('express');
const router = express.Router();
const customCakeController = require('../controllers/customCakeController');
const authCustomer = require('../middleware/authCustomer');
const authOwner = require('../middleware/authOwner');
const upload = require('../middleware/upload');

// Customer Custom Cake Routes
router.post('/', authCustomer, upload.single('referenceImage'), customCakeController.submitCustomIdea);
router.get('/my-requests', authCustomer, customCakeController.getCustomerCustomRequests);
router.post('/:id/accept-quote', authCustomer, customCakeController.customerAcceptQuoteAndOrder);

// Owner Custom Cake Routes
router.get('/owner/all', authOwner, customCakeController.getOwnerCustomRequests);
router.post('/owner/:id/review', authOwner, customCakeController.ownerReviewCustomRequest);

module.exports = router;
