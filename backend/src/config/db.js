/**
 * Database connection using JavaScript (not TypeScript) to avoid type errors in Docker builds
 */
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/novel-reader';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectDB }; 