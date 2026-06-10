import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/studyverse';
    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MONGO_URI: ${error.message}`);
    console.log(`Attempting local database fallback: mongodb://localhost:27017/studyverse`);
    try {
      const conn = await mongoose.connect('mongodb://localhost:27017/studyverse');
      console.log(`MongoDB Connected (Local Fallback): ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error(`Local database fallback connection also failed: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
