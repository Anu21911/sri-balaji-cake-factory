const { createModel } = require('./modelAdapter');

const orderSchemaDef = {
  orderNumber: { type: String, required: true, unique: true },
  customer: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, default: '' }
  },
  items: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      category: { type: String, required: true },
      flavour: { type: String },
      weight: { type: String },
      selectedVariant: { type: String },
      unitPrice: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },
      total: { type: Number, required: true },
      cakeMessage: { type: String, default: '' },
      image: { type: String }
    }
  ],
  cakeSubtotal: { type: Number, default: 0 },
  celebrationSubtotal: { type: Number, default: 0 },
  subtotal: { type: Number, required: true },
  deliveryDistanceKm: { type: Number, default: 5 },
  deliveryFee: { type: Number, default: 20 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['COD', 'ONLINE'], default: 'COD' },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'verified', 'failed', 'refunded'], 
    default: 'pending' 
  },
  orderStatus: {
    type: String,
    enum: [
      'new',
      'accepted',
      'in_preparation',
      'ready_for_dispatch',
      'out_for_delivery',
      'completed',
      'rejected',
      'cancelled'
    ],
    default: 'new'
  },
  deliveryAddress: {
    street: { type: String, required: true },
    landmark: { type: String, default: '' },
    city: { type: String, default: 'Narsapur' },
    pincode: { type: String, default: '' },
    contactNumber: { type: String, required: true }
  },
  deliveryDate: { type: String, required: true },
  timeSlot: { type: String, required: true },
  instructions: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  cancellationReason: { type: String, default: '' },
  historyTimeline: [
    {
      status: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      note: { type: String, default: '' }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

const Order = createModel('Order', orderSchemaDef, 'orders');

module.exports = Order;
