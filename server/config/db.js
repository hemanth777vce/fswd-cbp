const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/devpulse';

  try {
    // Attempt connecting to the configured URI with a short timeout
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Could not connect to primary URI (${mongoUri}): ${error.message}`);
    console.log('[MongoDB] Attempting fallback to in-memory MongoDB server...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const fallbackUri = memoryServer.getUri();

      const conn = await mongoose.connect(fallbackUri);
      console.log(`[MongoDB] Fallback connected to In-Memory MongoDB: ${fallbackUri}`);
      console.log('[MongoDB] NOTE: Data will persist in memory for this session. Set a valid MONGO_URI in .env for persistent storage.');
      return conn;
    } catch (fallbackError) {
      console.error(`[MongoDB] Fatal: Failed to initialize in-memory fallback: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
