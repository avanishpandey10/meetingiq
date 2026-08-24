/**
 * MongoDB Database Configuration
 *
 * Connects to MongoDB with retry logic.
 */

import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Connect to MongoDB.
 *
 * Retries connection a limited number of times before
 * failing the application startup.
 */
export async function connectDatabase() {
  const maxRetries = 5;

  let retries = 0;

  while (retries < maxRetries) {
    try {
      if (!env.MONGODB_URI) {
        throw new Error(
          'MONGODB_URI is not configured.'
        );
      }

      console.log(
        `🔌 Connecting to MongoDB (attempt ${
          retries + 1
        }/${maxRetries})...`
      );

      await mongoose.connect(
        env.MONGODB_URI,
        {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 10000
        }
      );

      console.log(
        '✅ MongoDB connected successfully'
      );

      // --------------------------------------------------------
      // CONNECTION EVENTS
      // --------------------------------------------------------

      mongoose.connection.on(
        'error',
        (error) => {
          console.error(
            '❌ MongoDB connection error:',
            error.message
          );
        }
      );

      mongoose.connection.on(
        'disconnected',
        () => {
          console.warn(
            '⚠️ MongoDB disconnected'
          );
        }
      );

      mongoose.connection.on(
        'reconnected',
        () => {
          console.log(
            '🔄 MongoDB reconnected'
          );
        }
      );

      return mongoose.connection;
    } catch (error) {
      retries += 1;

      console.error(
        `❌ MongoDB connection attempt ${retries} failed:`,
        error.message
      );

      // --------------------------------------------------------
      // FINAL ATTEMPT FAILED
      // --------------------------------------------------------

      if (retries >= maxRetries) {
        console.error(
          '❌ Maximum MongoDB connection retries reached.'
        );

        /*
         * Important:
         * Your current application uses MongoDB models
         * throughout the processing pipeline.
         *
         * Therefore demo mode does NOT magically provide
         * an in-memory replacement for Mongoose.
         *
         * We return null here only if the caller explicitly
         * chooses to continue without MongoDB.
         */
        if (env.DEMO_MODE) {
          console.warn(
            '⚠️ DEMO_MODE is enabled, but MongoDB is unavailable.'
          );

          return null;
        }

        throw error;
      }

      // --------------------------------------------------------
      // RETRY DELAY
      // --------------------------------------------------------

      const retryDelay =
        2000 * retries;

      console.log(
        `⏳ Retrying MongoDB connection in ${
          retryDelay / 1000
        } seconds...`
      );

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            retryDelay
          )
      );
    }
  }

  return null;
}