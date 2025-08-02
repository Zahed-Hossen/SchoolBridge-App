import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function debugMongoConnection() {
  console.log('🔍 MongoDB Connection Diagnostics');
  console.log('==================================\n');

  // ✅ Step 1: Check environment variables
  console.log('📋 Environment Variables:');
  console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT:', process.env.PORT);

  if (process.env.MONGODB_URI) {
    const safeURI = process.env.MONGODB_URI.replace(/\/\/.*:.*@/, '//[USERNAME]:[PASSWORD]@');
    console.log('MongoDB URI format:', safeURI);
  } else {
    console.log('❌ MONGODB_URI not found in environment variables');
    return;
  }

  // ✅ Step 2: Test multiple connection variations
  const connectionVariations = [
    // Your current URI
    process.env.MONGODB_URI,

    // Without database specified
    process.env.MONGODB_URI.replace(/\/schoolbridge\?/, '/?'),

    // Alternative cluster names (common variations)
    'mongodb+srv://SchoolBridge-Team:7f92899c3ad2bc801d3bd4df4f0204213e577a4b3f65b6a5a22e98f635dcb58d@cluster0.qhodrqf.mongodb.net/schoolbridge?retryWrites=true&w=majority',
    'mongodb+srv://SchoolBridge-Team:7f92899c3ad2bc801d3bd4df4f0204213e577a4b3f65b6a5a22e98f635dcb58d@schoolbridge.qhodrqf.mongodb.net/schoolbridge?retryWrites=true&w=majority',

    // URL encoded password (in case special characters are the issue)
    'mongodb+srv://SchoolBridge-Team:7f92899c3ad2bc801d3bd4df4f0204213e577a4b3f65b6a5a22e98f635dcb58d@schoolbridge-cluster.qhodrqf.mongodb.net/schoolbridge?retryWrites=true&w=majority&authSource=admin',
  ];

  for (let i = 0; i < connectionVariations.length; i++) {
    const uri = connectionVariations[i];
    if (!uri) continue;

    console.log(`\n🔗 Testing Connection ${i + 1}:`);
    console.log(`URI: ${uri.replace(/\/\/.*:.*@/, '//[USERNAME]:[PASSWORD]@')}`);

    try {
      const connection = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });

      console.log('✅ CONNECTION SUCCESS!');
      console.log(`Database: ${connection.connection.name || 'default'}`);
      console.log(`Host: ${connection.connection.host}`);
      console.log(`Ready State: ${connection.connection.readyState}`);

      // Test database operations
      try {
        await connection.connection.db.admin().ping();
        console.log('✅ Database ping successful');

        const collections = await connection.connection.db.listCollections().toArray();
        console.log(`✅ Collections available: ${collections.length}`);

        console.log('\n🎉 WORKING CONNECTION FOUND!');
        console.log('Update your .env with this URI:');
        console.log(`MONGODB_URI=${uri}`);

        await mongoose.disconnect();
        return;

      } catch (dbError) {
        console.log('⚠️ Connected but database operations failed:', dbError.message);
      }

      await mongoose.disconnect();

    } catch (error) {
      console.log('❌ Connection failed:', error.message);

      if (error.message.includes('bad auth')) {
        console.log('🔐 Authentication issue - checking credentials...');
      } else if (error.message.includes('ENOTFOUND')) {
        console.log('🌐 DNS resolution failed - checking cluster name...');
      } else if (error.message.includes('timeout')) {
        console.log('⏰ Connection timeout - network or firewall issue...');
      }
    }
  }

  console.log('\n❌ All connection attempts failed');
  console.log('\n� MongoDB Atlas Troubleshooting Steps:');
  console.log('1. Go to https://cloud.mongodb.com/');
  console.log('2. Check your cluster name and status');
  console.log('3. Verify Database Access > Database Users');
  console.log('4. Check Network Access > IP Access List');
  console.log('5. Get the correct connection string from "Connect" button');
}

// ✅ Step 3: Check MongoDB Atlas cluster status
async function checkAtlasClusterInfo() {
  console.log('\n� MongoDB Atlas Cluster Information:');
  console.log('=====================================');

  console.log('Expected cluster details:');
  console.log('• Cluster Name: SchoolBridge Cluster or similar');
  console.log('• Username: SchoolBridge-Team');
  console.log('• Password: 7f92899c3ad2bc801d3bd4df4f0204213e577a4b3f65b6a5a22e98f635dcb58d');
  console.log('• Database: schoolbridge');

  console.log('\n📋 Please verify in MongoDB Atlas:');
  console.log('1. Cluster is running (not paused)');
  console.log('2. User "SchoolBridge-Team" exists');
  console.log('3. User has "readWrite" permissions');
  console.log('4. IP 0.0.0.0/0 is whitelisted (or your specific IP)');
  console.log('5. Connection string is correctly formatted');
}

// Run diagnostics
debugMongoConnection()
  .then(() => checkAtlasClusterInfo())
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Diagnostic failed:', error);
    process.exit(1);
  });
