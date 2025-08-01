import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Modern Mongoose doesn't need these options, but included for clarity
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Set up connection event listeners
    mongoose.connection.on('disconnected', () => {
      console.log('❌ MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔚 MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
