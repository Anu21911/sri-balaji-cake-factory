const { createModel } = require('./modelAdapter');

const productSchemaDef = {
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ['cake', 'celebration'] },
  flavour: { 
    type: String, 
    enum: ['Pineapple', 'Butterscotch', 'Chocolate', 'Vanilla', 'Rasmalai', null],
    default: null 
  },
  basePrice: { type: Number, required: true },
  weights: [
    {
      weight: { type: String, required: true }, // '1 kg', '2 kg', '3 kg'
      price: { type: Number, required: true }
    }
  ],
  variants: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true }
    }
  ],
  image: { type: String, required: true },
  description: { type: String, default: '' },
  stock: { type: Number, default: 100 },
  isAvailable: { type: Boolean, default: true },
  safeUseInstructions: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

const Product = createModel('Product', productSchemaDef, 'products');

module.exports = Product;
