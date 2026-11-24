import mongoose from 'mongoose';
import dns from 'dns';

// Ensure SRV DNS resolution succeeds across Windows DNS resolvers
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // fallback to system default
}

let mongodInstance: any = null;

const connectWithTimeout = (uri: string, ms = 3000): Promise<any> => {
  return Promise.race([
    mongoose.connect(uri, { serverSelectionTimeoutMS: ms }),
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)),
  ]);
};

const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;

  // 1. Try cloud Atlas or custom URI if provided
  if (mongoUri && !mongoUri.includes('localhost') && !mongoUri.includes('127.0.0.1')) {
    try {
      console.log('🔄 Attempting connection to MongoDB Atlas...');
      const conn = await connectWithTimeout(mongoUri, 3500);
      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
      return;
    } catch (error: any) {
      console.warn(`⚠️ Cloud MongoDB Atlas unavailable (${error.message}).`);
      console.log('🚀 Activating embedded MongoDB engine for seamless instant execution...');
    }
  }

  // 2. Fallback to MongoMemoryServer
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbName: 'university_cms',
      },
    });

    const localUri = mongodInstance.getUri();
    await mongoose.connect(localUri);
    console.log(`✅ Embedded Local MongoDB Connected: ${localUri}`);

    // Auto-seed if database is fresh
    const User = (await import('../models/User')).default;
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Database is fresh. Automatically populating initial university demo data...');
      const { seedData } = await import('../utils/seed');
      await seedData(false);
      console.log('✅ Demo university records loaded and ready for use!');
    }
  } catch (err: any) {
    console.error('❌ Failed to start embedded MongoDB:', err.message);
  }
};

export default connectDB;
