import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meetscribe';

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`[MongoDB] Connected to database: ${conn.connection.name} at ${conn.connection.host}`);
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    process.exit(1);
  }
};
