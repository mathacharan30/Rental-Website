const mongoose = require('mongoose');

const connectDB = async () => {
  // Skip if already connected (important for Vercel serverless warm instances)
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    const msg = '[DB] MONGODB_URI not set in environment variables';
    console.error(msg);
    throw new Error(msg);
  }
  try {
    await mongoose.connect(uri);
    console.log(`[DB] Connected to MongoDB: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('[DB] MongoDB connection error:', error.message);
    throw error;
  }
};

module.exports = connectDB;
