const { createModel } = require('./modelAdapter');

const userSchemaDef = {
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  email: { type: String, trim: true, default: '' },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'customer' },
  addresses: [
    {
      id: { type: String },
      label: { type: String, default: 'Home' },
      street: { type: String, required: true },
      landmark: { type: String, default: '' },
      city: { type: String, default: 'Narsapur' },
      pincode: { type: String, default: '' },
      isDefault: { type: Boolean, default: false }
    }
  ],
  isVerified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

const User = createModel('User', userSchemaDef, 'users');

module.exports = User;
