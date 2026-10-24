const { createModel } = require('./modelAdapter');

const customCakeSchemaDef = {
  customer: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    mobile: { type: String, required: true }
  },
  cakeName: { type: String, required: true },
  description: { type: String, required: true },
  flavour: { 
    type: String, 
    required: true, 
    enum: ['Pineapple', 'Butterscotch', 'Chocolate', 'Vanilla', 'Rasmalai'] 
  },
  weight: { 
    type: String, 
    required: true, 
    enum: ['1 kg', '2 kg', '3 kg'] 
  },
  cakeMessage: { type: String, default: '' },
  referenceImage: { type: String, required: true },
  deliveryDate: { type: String, required: true },
  timeSlot: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  additionalInstructions: { type: String, default: '' },
  quotedPrice: { type: Number, default: null }, // Null until owner confirms
  status: { 
    type: String, 
    enum: ['pending_review', 'quoted', 'accepted', 'rejected', 'ordered'], 
    default: 'pending_review' 
  },
  ownerNotes: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  convertedOrderId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

const CustomCakeRequest = createModel('CustomCakeRequest', customCakeSchemaDef, 'customCakes');

module.exports = CustomCakeRequest;
