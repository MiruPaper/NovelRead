// Fix for Mongoose TypeScript compatibility
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/novel-reader';

export const connectDB = async () => {
  try {
    // Force TypeScript to accept the connect method with a type assertion
    await (mongoose as any).connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}; 