const mongoose = require('mongoose');

// Cache the in-flight connection promise so simultaneous cold-start requests
// all wait on the same connect() call instead of each starting their own.
let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return; // Already connected — fast path for warm instances
  }

  // If a connection attempt is already in flight, piggyback on it
  if (connectionPromise) {
    return await connectionPromise;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[DB] MONGODB_URI not set in environment variables');
    process.exit(1);
  }

  connectionPromise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    maxPoolSize: 10,
    minPoolSize: 1,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 15000,
  });

  try {
    await connectionPromise;
    console.log(`[DB] Connected to MongoDB: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('[DB] MongoDB connection error:', error.message);
    connectionPromise = null; // Allow a fresh retry on next request
    throw error;
  }
};

module.exports = connectDB;
