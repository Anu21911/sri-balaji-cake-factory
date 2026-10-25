const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');

// Get all products (public)
exports.getProducts = async (req, res) => {
  try {
    const { category, flavour, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (flavour) query.flavour = flavour;

    let products = await Product.find(query);

    if (search) {
      const term = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.flavour && p.flavour.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term))
      );
    }

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving product' });
  }
};

// Owner: Update product (price, stock, availability, safe-use instructions)
exports.updateProduct = async (req, res) => {
  try {
    const { basePrice, stock, isAvailable, description, safeUseInstructions, variants, image } = req.body;
    const productId = req.params.id;

    const existing = await Product.findById(productId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updates = {};
    if (basePrice !== undefined) {
      updates.basePrice = Number(basePrice);
      // If it's a cake, recalculate exact weight-based tiers (1kg, 2kg, 3kg)
      if (existing.category === 'cake') {
        updates.weights = [
          { weight: '1 kg', price: Number(basePrice) },
          { weight: '2 kg', price: Number(basePrice) * 2 },
          { weight: '3 kg', price: Number(basePrice) * 3 }
        ];
      }
    }
    if (stock !== undefined) updates.stock = Number(stock);
    if (isAvailable !== undefined) updates.isAvailable = Boolean(isAvailable);
    if (description !== undefined) updates.description = description;
    if (safeUseInstructions !== undefined) updates.safeUseInstructions = safeUseInstructions;
    if (variants !== undefined) updates.variants = variants;
    if (image) updates.image = image;

    const updated = await Product.findByIdAndUpdate(productId, updates, { new: true });

    await AuditLog.create({
      action: 'PRODUCT_UPDATE',
      entityType: 'product',
      entityId: String(productId),
      performedBy: { role: 'owner', id: req.owner.id, name: req.owner.name },
      details: { updates, previousPrice: existing.basePrice }
    });

    res.json({
      success: true,
      message: 'Product updated successfully.',
      product: updated
    });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

// Owner: Upload/Replace product photo
exports.uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const productId = req.params.id;

    if (productId && productId !== 'new') {
      await Product.findByIdAndUpdate(productId, { image: imageUrl });

      await AuditLog.create({
        action: 'PRODUCT_IMAGE_UPDATE',
        entityType: 'product',
        entityId: String(productId),
        performedBy: { role: 'owner', id: req.owner.id, name: req.owner.name },
        details: { newImage: imageUrl }
      });
    }

    res.json({
      success: true,
      message: 'Image uploaded successfully!',
      imageUrl
    });
  } catch (err) {
    console.error('Product image upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload product image.' });
  }
};

// Owner: Add new celebration or cake item if needed
exports.createProduct = async (req, res) => {
  try {
    const { name, category, flavour, basePrice, description, safeUseInstructions, variants, image, stock } = req.body;

    if (!name || !category || basePrice === undefined) {
      return res.status(400).json({ success: false, message: 'Name, category, and price are required.' });
    }

    let weights = [];
    if (category === 'cake') {
      weights = [
        { weight: '1 kg', price: Number(basePrice) },
        { weight: '2 kg', price: Number(basePrice) * 2 },
        { weight: '3 kg', price: Number(basePrice) * 3 }
      ];
    }

    const newProd = await Product.create({
      name: name.trim(),
      category,
      flavour: flavour || null,
      basePrice: Number(basePrice),
      weights,
      variants: variants || [],
      image: image || '/images/products/fallback.jpg',
      description: description || '',
      stock: stock !== undefined ? Number(stock) : 50,
      isAvailable: true,
      safeUseInstructions: safeUseInstructions || ''
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product: newProd
    });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

// Controlled Initialization: Populate approved catalogue if empty
exports.initCatalogue = async (req, res) => {
  try {
    const { initializeDatabase } = require('../utils/initDatabase');
    await initializeDatabase();
    const products = await Product.find({});
    res.json({
      success: true,
      message: 'Approved catalogue verified/initialized successfully.',
      count: products.length,
      products
    });
  } catch (err) {
    console.error('Init catalogue error:', err);
    res.status(500).json({ success: false, message: 'Failed to initialize catalogue' });
  }
};
