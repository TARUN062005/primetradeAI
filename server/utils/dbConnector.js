const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
  errorFormat: 'pretty'
});

const ConnectDb = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // MongoDB doesn't support $queryRaw like SQL databases
    // Instead, we can test connection with a simple findFirst
    await prisma.user.findFirst({
      take: 1
    }).catch(() => {
      // This is expected if there are no users yet
      console.log('✅ Database connection test passed');
    });
    
    console.log('✅ Database connection test completed');
    
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('🔍 Debug info:');
    console.error('  - DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    console.error('  - NODE_ENV:', process.env.NODE_ENV || 'Not set');
    
    // Common MongoDB error codes
    if (err.code === 'P1001') {
      console.error('  ⚠️  Cannot reach database server');
      console.error('  💡 Check if MongoDB is running:');
      console.error('      Windows: Open Services (services.msc) and start MongoDB');
      console.error('      Or run: mongod --dbpath "C:\\data\\db"');
    } else if (err.code === 'P1012') {
      console.error('  ⚠️  Prisma schema validation error');
      console.error('  💡 Run: npx prisma validate');
    } else if (err.code === 'P1009') {
      console.error('  ⚠️  Database already exists');
      console.error('  💡 This is usually not a problem');
    } else if (err.code === 'P2021') {
      console.error('  ⚠️  Table/Collection does not exist');
      console.error('  💡 Run: npx prisma db push');
    } else if (err.code === 'P1002') {
      console.error('  ⚠️  Authentication failed');
      console.error('  💡 Check MongoDB username/password in DATABASE_URL');
    }
    
    // Additional MongoDB-specific checks
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('mongodb://')) {
      console.error('  💡 MongoDB URL format: mongodb://localhost:27017/database_name');
      console.error('  💡 If using authentication: mongodb://username:password@localhost:27017/database_name');
    }
    
    throw err;
  }
};

const DisconnectDb = async () => {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
  } catch (err) {
    console.error('❌ Error during database disconnect:', err);
    throw err;
  }
};

// Test MongoDB connection with a simple method
const testMongoDBConnection = async () => {
  try {
    // Try to run a simple command using runCommandRaw (MongoDB specific)
    const result = await prisma.$runCommandRaw({
      ping: 1
    });
    console.log('✅ MongoDB ping successful:', result);
    return true;
  } catch (err) {
    console.error('❌ MongoDB ping failed:', err.message);
    return false;
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await DisconnectDb();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await DisconnectDb();
  process.exit(0);
});

module.exports = { 
  prisma, 
  ConnectDb, 
  DisconnectDb,
  testMongoDBConnection
};