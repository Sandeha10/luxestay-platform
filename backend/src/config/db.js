import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: process.env.NODE_ENV !== 'production',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`[LuxeStay DB] MongoDB Cluster Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[LuxeStay DB Error] Connection Failure: ${error.message}`);
    process.exit(1);
  }
};