const mongoose = require('mongoose');

/**
 * Enterprise Production MongoDB Connection with Connection Pooling & Resiliency
 */
const connectDB = async (retries = 5, delay = 2500) => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('[FATAL CONFIG] MONGO_URI is missing from environment variables.');
    process.exit(1);
  }

  // Modern Mongoose Production Options (clean, reliable, no deprecated family: 4 or eager minPoolSize)
  const mongooseOptions = {
    serverSelectionTimeoutMS: 15000, // 15s to allow Atlas multi-region / cold start negotiation
    socketTimeoutMS: 45000,
    maxPoolSize: process.env.MONGO_MAX_POOL_SIZE ? parseInt(process.env.MONGO_MAX_POOL_SIZE, 10) : 10,
    minPoolSize: 0, // Avoid eager pool creation on startup which triggers handshake errors on secondary shards
    autoIndex: process.env.NODE_ENV !== 'production' // Avoid runtime performance penalty in production
  };

  // Connection Lifecycle Listeners
  mongoose.connection.on('connected', () => {
    console.log('[MongoDB Production] Connection established successfully.');
  });

  mongoose.connection.on('error', (err) => {
    console.warn('[MongoDB Network Warning] Connection error encountered:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB Warning] Database disconnected. Reconnecting automatically...');
  });

  // Graceful shutdown handling
  const gracefulExit = async () => {
    try {
      await mongoose.connection.close();
      console.log('[MongoDB] Connection closed through app termination.');
      process.exit(0);
    } catch (err) {
      console.error('[MongoDB] Error during connection close:', err.message);
      process.exit(1);
    }
  };

  process.on('SIGINT', gracefulExit);
  process.on('SIGTERM', gracefulExit);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, mongooseOptions);
      return mongoose.connection;
    } catch (error) {
      console.error(`[MongoDB] Connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt === retries) {
        console.error('[FATAL] All MongoDB connection attempts exhausted.');
        process.exit(1);
      }
      console.log(`[MongoDB] Retrying connection in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = connectDB;