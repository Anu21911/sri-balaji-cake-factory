const { createModel } = require('./modelAdapter');

const ownerSchemaDef = {
  name: { type: String, required: true, default: 'RAKESH' },
  mobile: { type: String, required: true, default: '9963390327' },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'owner' },
  mustChangePassword: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

const Owner = createModel('Owner', ownerSchemaDef, 'owners');

module.exports = Owner;
