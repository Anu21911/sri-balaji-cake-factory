const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sri_balaji_cake_factory';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500
    });
    isConnected = true;
    console.log(`[Database] Successfully connected to MongoDB at ${uri}`);
    const { initializeDatabase } = require('../utils/initDatabase');
    await initializeDatabase();
  } catch (err) {
    isConnected = false;
    console.warn(`[Database] MongoDB not reachable at ${uri} (${err.message}).`);
    console.log(`[Database] Seamlessly activated high-resilience local JSON store (data/db.json).`);
    const { initializeDatabase } = require('../utils/initDatabase');
    await initializeDatabase();
  }
}

function getDbStatus() {
  return {
    isConnected,
    mode: isConnected ? 'MongoDB' : 'LocalResilientStore'
  };
}

module.exports = {
  connectDB,
  getDbStatus
};
