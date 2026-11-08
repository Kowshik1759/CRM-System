const mongoose = require('mongoose');
const config = require('./config');

let memoryServer = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    // Attempt connecting to specified MONGO_URI with short timeout
    const conn = await mongoose.connect(config.MONGO_URI, {
      serverSelectionTimeoutMS: 1500
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (primaryErr) {
    console.warn(`[MongoDB] Could not connect to primary URI (${config.MONGO_URI}): ${primaryErr.message}`);

    if (process.env.NODE_ENV === 'production' && process.env.MONGO_URI && !process.env.MONGO_URI.includes('127.0.0.1')) {
      throw primaryErr;
    }

    try {
      if (!memoryServer) {
        console.log('[MongoDB] Spinning up embedded in-memory MongoDB instance for development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
      }
      const memUri = memoryServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[MongoDB] In-Memory instance running and connected at ${memUri}`);
      return conn;
    } catch (memErr) {
      console.error('[MongoDB] In-Memory MongoDB startup error:', memErr);
      throw primaryErr;
    }
  }
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};

module.exports = { connectDB, disconnectDB };
