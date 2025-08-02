import readline from 'readline';
import mongoose from 'mongoose';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function setupAtlasConnection() {
  console.log('🔧 MongoDB Atlas Connection Setup');
  console.log('=================================\n');

  console.log('Please provide the following information from your MongoDB Atlas account:\n');

  // Get cluster information
  const clusterName = await question('🏠 Cluster Name (e.g., Cluster0, schoolbridge-cluster): ');
  const username = await question('👤 Database Username: ');
  const password = await question('🔐 Database Password: ');
  const databaseName = await question('📊 Database Name (or press Enter for default "schoolbridge"): ') || 'schoolbridge';

  console.log('\n⏳ Testing connection...\n');

  // Test different connection string formats
  const connectionStrings = [
    `mongodb+srv://${username}:${password}@${clusterName}.qhodrqf.mongodb.net/${databaseName}?retryWrites=true&w=majority`,
    `mongodb+srv://${username}:${password}@${clusterName}.qhodrqf.mongodb.net/?retryWrites=true&w=majority`,
    `mongodb+srv://${username}:${password}@${clusterName}.mongodb.net/${databaseName}?retryWrites=true&w=majority`,
    `mongodb+srv://${username}:${password}@${clusterName}.mongodb.net/?retryWrites=true&w=majority`,
  ];

  let workingConnection = null;

  for (let i = 0; i < connectionStrings.length; i++) {
    const uri = connectionStrings[i];
    console.log(`🔗 Testing connection ${i + 1}...`);

    try {
      const connection = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      });

      console.log('✅ CONNECTION SUCCESS!');
      console.log(`📊 Database: ${connection.connection.name}`);
      console.log(`🌐 Host: ${connection.connection.host}`);

      // Test database operations
      await connection.connection.db.admin().ping();
      console.log('✅ Database ping successful');

      workingConnection = uri;
      await mongoose.disconnect();
      break;

    } catch (error) {
      console.log(`❌ Connection ${i + 1} failed: ${error.message}`);

      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
    }
  }

  if (workingConnection) {
    console.log('\n🎉 WORKING CONNECTION FOUND!');
    console.log('=====================================');
    console.log('\n📋 Update your .env file with:');
    console.log(`MONGODB_URI=${workingConnection}`);
    console.log('\n✅ Copy this line to your server/.env file');

    // Generate complete .env content
    console.log('\n📄 Complete .env MongoDB section:');
    console.log('# MongoDB Configuration');
    console.log(`MONGODB_URI=${workingConnection}`);
    console.log(`DB_NAME=${databaseName}`);

  } else {
    console.log('\n❌ No working connection found');
    console.log('\n🔧 Please check:');
    console.log('1. Cluster name is correct');
    console.log('2. Username and password are correct');
    console.log('3. User has proper permissions');
    console.log('4. Your IP is whitelisted (or use 0.0.0.0/0)');
    console.log('5. Cluster is running (not paused)');
  }

  rl.close();
}

setupAtlasConnection().catch(console.error);
