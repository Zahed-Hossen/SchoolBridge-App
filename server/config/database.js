import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');

    // ✅ FIXED: Remove deprecated options and ensure correct database
    const connectionOptions = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority',
      appName: 'SchoolBridge-Cluster0',
      // ✅ FORCE DATABASE NAME
      dbName: process.env.DB_NAME || 'schoolbridge',
    };

    let mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    // ✅ Ensure database name is in the URI
    if (!mongoURI.includes('/schoolbridge?') && !mongoURI.includes('dbName=')) {
      // Add database to URI if not present
      mongoURI = mongoURI.replace('mongodb.net/', 'mongodb.net/schoolbridge');
    }

    // ✅ Log connection attempt (hide password)
    const safeURI = mongoURI.replace(/\/\/.*:.*@/, '//****:****@');
    console.log('🔗 Attempting connection to:', safeURI);

    const conn = await mongoose.connect(mongoURI, connectionOptions);

    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🌐 Host: ${conn.connection.host}`);
    console.log(`📡 Port: ${conn.connection.port}`);
    console.log(`🔄 Ready State: ${conn.connection.readyState}`);

    // ✅ VERIFY DATABASE NAME
    const actualDbName = conn.connection.name;
    const expectedDbName = process.env.DB_NAME || 'schoolbridge';

    if (actualDbName !== expectedDbName) {
      console.log(`⚠️ Warning: Connected to "${actualDbName}" but expected "${expectedDbName}"`);
      console.log('💡 This will still work, but data will be stored in the "test" database');
    } else {
      console.log(`✅ Connected to correct database: ${actualDbName}`);
    }

    // Test database access
    await conn.connection.db.admin().ping();
    console.log('✅ Database ping successful');

    // ✅ Connection event handlers
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    return conn;

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('🔄 Continuing without database for development...');
    return null;
  }
};

export default connectDB;
