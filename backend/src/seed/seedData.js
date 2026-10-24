require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/db');
const Owner = require('../models/Owner');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const AuditLog = require('../models/AuditLog');

async function seed() {
  console.log('[Seed] Initializing Sri Balaji Cake Factory seed process...');
  await connectDB();

  // 1. INITIALIZE SECURE OWNER ACCOUNT
  const ownerName = process.env.OWNER_NAME || 'RAKESH';
  const ownerMobile = process.env.OWNER_MOBILE || '9963390327';
  const initialPassword = process.env.OWNER_INITIAL_PASSWORD || 'R@khi1234';

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(initialPassword, salt);

  const existingOwner = await Owner.findOne({ mobile: ownerMobile });
  if (existingOwner) {
    console.log(`[Seed] Owner account already exists for ${ownerMobile}. Preserving existing owner.`);
  } else {
    const owner = await Owner.create({
      name: ownerName,
      mobile: ownerMobile,
      passwordHash,
      role: 'owner',
      mustChangePassword: true, // Required to change on first login
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log(`[Seed] Created initial Owner account: Name=${owner.name}, Mobile=${owner.mobile} (Hashed password stored, mustChangePassword=true)`);
  }

  // 2. INITIALIZE EXACT CAKE MENU & CELEBRATION PRODUCTS
  // Remove existing products to guarantee exact prices & specs
  await Product.deleteMany({});

  const cakes = [
    {
      name: 'Pineapple Cake',
      category: 'cake',
      flavour: 'Pineapple',
      basePrice: 280,
      weights: [
        { weight: '1 kg', price: 280 },
        { weight: '2 kg', price: 560 },
        { weight: '3 kg', price: 840 }
      ],
      image: '/images/products/pineapple-cake.jpg',
      description: 'Classic handcrafted bakery sponge soaked in rich pineapple syrup, layered with fresh whipped cream and juicy tropical pineapple chunks.',
      stock: 50,
      isAvailable: true,
      safeUseInstructions: 'Freshly baked regular cake. Best enjoyed within 24 hours. Store chilled in refrigerator.'
    },
    {
      name: 'Butterscotch Cake',
      category: 'cake',
      flavour: 'Butterscotch',
      basePrice: 280,
      weights: [
        { weight: '1 kg', price: 280 },
        { weight: '2 kg', price: 560 },
        { weight: '3 kg', price: 840 }
      ],
      image: '/images/products/butterscotch-cake.jpg',
      description: 'Crispy butterscotch praline crunches layered between rich vanilla sponge and golden caramel cream drizzle.',
      stock: 50,
      isAvailable: true,
      safeUseInstructions: 'Freshly baked regular cake. Keep in a cool dry place or refrigerate.'
    },
    {
      name: 'Chocolate Cake',
      category: 'cake',
      flavour: 'Chocolate',
      basePrice: 450,
      weights: [
        { weight: '1 kg', price: 450 },
        { weight: '2 kg', price: 900 },
        { weight: '3 kg', price: 1350 }
      ],
      image: '/images/products/chocolate-cake.jpg',
      description: 'Decadent, rich dark chocolate truffle cake layered with velvety chocolate ganache and premium cocoa swirls.',
      stock: 50,
      isAvailable: true,
      safeUseInstructions: 'Store refrigerated. Bring to room temperature 15 minutes before serving for maximum chocolate richness.'
    },
    {
      name: 'Vanilla Cake',
      category: 'cake',
      flavour: 'Vanilla',
      basePrice: 450,
      weights: [
        { weight: '1 kg', price: 450 },
        { weight: '2 kg', price: 900 },
        { weight: '3 kg', price: 1350 }
      ],
      image: '/images/products/vanilla-cake.jpg',
      description: 'Timeless aromatic pure vanilla bean sponge finished with silk smooth vanilla butter cream and delicate piping.',
      stock: 50,
      isAvailable: true,
      safeUseInstructions: 'Freshly baked regular cake. Chilled storage recommended.'
    },
    {
      name: 'Rasmalai Cake',
      category: 'cake',
      flavour: 'Rasmalai',
      basePrice: 700,
      weights: [
        { weight: '1 kg', price: 700 },
        { weight: '2 kg', price: 1400 },
        { weight: '3 kg', price: 2100 }
      ],
      image: '/images/products/rasmalai-cake.jpg',
      description: 'Exquisite Indian fusion masterpiece infused with aromatic saffron-cardamom milk, real rasmalai pieces, sliced pistachios, and dried rose petals.',
      stock: 40,
      isAvailable: true,
      safeUseInstructions: 'Handcrafted with fresh Indian dairy rasmalai. Keep refrigerated at all times.'
    }
  ];

  const celebrations = [
    {
      name: 'Sparkles',
      category: 'celebration',
      flavour: null,
      basePrice: 20,
      weights: [],
      variants: [],
      image: '/images/products/sparkles.jpg',
      description: 'Sparkling celebration sticks to brighten cake cutting ceremonies and festive moments.',
      stock: 200,
      isAvailable: true,
      safeUseInstructions: 'Safe Use Instructions: Hold away from eyes and flammable materials. Adult supervision required.'
    },
    {
      name: 'Snow Spray',
      category: 'celebration',
      flavour: null,
      basePrice: 50,
      weights: [],
      variants: [],
      image: '/images/products/snow-spray.jpg',
      description: 'Party snow foam spray can for joyous birthday and celebration celebrations.',
      stock: 150,
      isAvailable: true,
      safeUseInstructions: 'Safe Use Instructions: Aerosol spray. Do not spray into eyes or near open candle flame. Ventilate room.'
    },
    {
      name: 'Paper Shots',
      category: 'celebration',
      flavour: null,
      basePrice: 50,
      weights: [],
      variants: [
        { name: 'Standard Popper (₹50)', price: 50 },
        { name: 'Deluxe Party Cannon (₹80)', price: 80 }
      ],
      image: '/images/products/paper-shots.jpg',
      description: 'Colorful spring/compressed air confetti party popper streamers. Available in ₹50 standard and ₹80 deluxe sizes.',
      stock: 150,
      isAvailable: true,
      safeUseInstructions: 'Safe Use Instructions: Point upwards towards ceiling, away from faces and people before twisting base.'
    },
    {
      name: 'Shalvas (Celebration Shawl)',
      category: 'celebration',
      flavour: null,
      basePrice: 100,
      weights: [],
      variants: [],
      image: '/images/products/shalvas.jpg',
      description: 'Traditional celebration art silk felicitation shawl with zari border to honor and drape over the birthday star or VIP.',
      stock: 100,
      isAvailable: true,
      safeUseInstructions: 'Care Instructions: Dry clean or gentle hand wash.'
    },
    {
      name: 'Gun Coils',
      category: 'celebration',
      flavour: null,
      basePrice: 120,
      weights: [],
      variants: [],
      image: '/images/products/gun-coils.jpg',
      description: 'Festive toy celebration cap gun roll ammunition coils for exciting sound celebrations.',
      stock: 100,
      isAvailable: true,
      safeUseInstructions: 'Safe Use Instructions: Do not fire near ears or eyes. Recommended for outdoor party entertainment.'
    }
  ];

  await Product.insertMany([...cakes, ...celebrations]);
  console.log(`[Seed] Seeded ${cakes.length} cakes and ${celebrations.length} celebration products with exact prices.`);

  // 3. INITIALIZE SETTINGS
  await Settings.deleteMany({});
  await Settings.create({
    businessName: 'Sri Balaji Cake Factory',
    tagline: 'Made with Love, Delivered with Care.',
    subQuote: 'Because your happiness matters to us more than anything.',
    address: 'SangaReddy Road, Narsapur',
    phone: '9963390327',
    whatsapp: '919963393270',
    instagram: '_rakhi_0206',
    googleMapsQuery: 'https://www.google.com/maps/search/?api=1&query=SangaReddy%20Road%2C%20Narsapur%2C%20Telangana%2C%20India',
    deliveryFeePerKm: 4,
    baseDeliveryDistanceKm: 5,
    businessHours: {
      weekdays: '9:00 AM - 10:00 PM',
      weekends: '9:00 AM - 10:30 PM'
    }
  });
  console.log('[Seed] Seeded business settings & verified contacts.');

  console.log('[Seed] Database seeding completed successfully.');
  process.exit(0);
}

seed().catch(err => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
