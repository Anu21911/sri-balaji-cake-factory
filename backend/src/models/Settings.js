const { createModel } = require('./modelAdapter');

const settingsSchemaDef = {
  businessName: { type: String, default: 'Sri Balaji Cake Factory' },
  tagline: { type: String, default: 'Made with Love, Delivered with Care.' },
  subQuote: { type: String, default: 'Because your happiness matters to us more than anything.' },
  address: { type: String, default: 'SangaReddy Road, Narsapur' },
  phone: { type: String, default: '9963390327' },
  whatsapp: { type: String, default: '919963393270' },
  instagram: { type: String, default: '_rakhi_0206' },
  googleMapsQuery: { 
    type: String, 
    default: 'https://www.google.com/maps/search/?api=1&query=SangaReddy%20Road%2C%20Narsapur%2C%20Telangana%2C%20India' 
  },
  deliveryFeePerKm: { type: Number, default: 4 },
  baseDeliveryDistanceKm: { type: Number, default: 5 },
  businessHours: {
    weekdays: { type: String, default: '9:00 AM - 10:00 PM' },
    weekends: { type: String, default: '9:00 AM - 10:30 PM' }
  },
  policies: {
    privacy: { 
      type: String, 
      default: 'At Sri Balaji Cake Factory, we respect your privacy. Customer information such as name, mobile number, and delivery address is securely used solely to process your orders and deliver freshly handcrafted cakes.' 
    },
    delivery: { 
      type: String, 
      default: 'We deliver fresh handcrafted cakes across Narsapur and surrounding regions along SangaReddy Road at a transparent rate of ₹4 per kilometre. All orders are carefully packed in temperature-controlled bakery containers.' 
    },
    cancellation: { 
      type: String, 
      default: 'Orders can be cancelled before baking begins (status: New). Once preparation starts, cancellation may incur ingredient and preparation costs. For refunds on pre-paid orders, our verified payment workflow processes returns within 3-5 business days.' 
    },
    terms: { 
      type: String, 
      default: 'All cakes are freshly baked regular cakes with premium ingredients. Please place custom design requests at least 24 hours in advance for best craftsmanship.' 
    }
  },
  updatedAt: { type: Date, default: Date.now }
};

const Settings = createModel('Settings', settingsSchemaDef, 'settings');

module.exports = Settings;
