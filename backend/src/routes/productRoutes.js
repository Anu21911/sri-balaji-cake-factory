const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authOwner = require('../middleware/authOwner');
const upload = require('../middleware/upload');

// Public Product Routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Owner Product Management Routes
router.post('/', authOwner, productController.createProduct);
router.put('/:id', authOwner, productController.updateProduct);
router.post('/:id/upload', authOwner, upload.single('image'), productController.uploadProductImage);

module.exports = router;
