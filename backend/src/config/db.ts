// Dynamically importing mongoose to avoid Docker build issues
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/novel-reader';

export const connectDB = async () => {
  try {
    // Dynamically import mongoose
    const mongoose = await import('mongoose');
    
    // Connect using the global connection instance
    const conn = await mongoose.default.connect(MONGODB_URI);
    
    console.log('MongoDB connected successfully');
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};