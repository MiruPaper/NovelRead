// Fix for Mongoose TypeScript compatibility
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/novel-reader';

// Define interface for mongoose with connect method
interface MongooseWithConnect extends mongoose.Mongoose {
  connect: (uri: string) => Promise<typeof mongoose>;
}

export const connectDB = async () => {
  try {
    // Use proper type casting instead of any
    await (mongoose as MongooseWithConnect).connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}; 