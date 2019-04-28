import mongoose from 'mongoose';
import { logger } from '../winston/log';

const dbURL = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

export const initializeDb = async () => {
  try {
    // https://mongoosejs.com/docs/connections.html
    // https://mongoosejs.com/docs/deprecations.html
    const connectOptions = {
      promiseLibrary: global.Promise,
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      autoIndex: false, // Don't build indexes
      reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
      reconnectInterval: 500, // Reconnect every 500ms
      poolSize: 10, // Maintain up to 10 socket connections
      // If not connected, return errors immediately rather than waiting for reconnect
      bufferMaxEntries: 0,
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    await mongoose.connect(dbURL, connectOptions);
    logger.info('db initialized');
  } catch (err) {
    logger.error('db initialization error %o', [err]);
    process.exit(1);
  }
};

/**
 * Validate Mongo Object Id
 * @param {string} id id to validate
 */
export const isValidObjectId = (id) => {
  return id && mongoose.Types.ObjectId.isValid(id);
};

/**
 * generate Mongo db object Id
 */
export const generateObjectId = () => {
  return new mongoose.Types.ObjectId();
};
