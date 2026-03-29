const mongoose = require('mongoose');

const connectDB = async () => {
  // Skip if already connected (important for serverless warm instances)
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[DB] MONGODB_URI not set in environment variables');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      maxPoolSize: 10,
      minPoolSize: 1,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      bufferCommands: false, // fail immediately instead of buffering when not connected
    });
    console.log(`[DB] Connected to MongoDB: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('[DB] MongoDB connection error:', error.message);
    throw error;
  }
};

module.exports = connectDB;
