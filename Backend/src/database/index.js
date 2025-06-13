import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Cache the database connection for better performance in serverless environments
let cachedConnection = null;

const connectDB = async () => {
  // If we already have a connection, don't create a new one
  if (cachedConnection) {
    console.log('Using existing MongoDB connection');
    return cachedConnection;
  }

  try {
      const uri = process.env.MONGODB_URI;
      
      // Log connection attempt without exposing the full URI for security
      console.log("Connecting to MongoDB...");
      if (!uri) {
        throw new Error("MongoDB URI is not defined. Check your .env file.");
      }
      // Add connection options optimized for serverless environments
      const options = {
        // Serverless environment optimizations
        bufferCommands: false, // Disable mongoose buffering
        maxPoolSize: 10, // Limit number of sockets
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4 // Use IPv4, skip trying IPv6
      };

      // Connect to MongoDB
      const conn = await mongoose.connect(uri, options);

      // Store the connection in our cache
      cachedConnection = conn;

      console.log(`MongoDB Connected: ${conn.connection.host}`);

      // Handle connection errors after initial connection
      mongoose.connection.on('error', err => {
        console.error('MongoDB connection error:', err);
        cachedConnection = null;
      });
    return conn;
  } catch (error) {
      console.error(`MongoDB connection error: ${error.message}`);
      
      throw error;
  }
};

export default connectDB;