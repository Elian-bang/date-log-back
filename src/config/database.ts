import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) {
    console.log('✅ Using existing MongoDB connection');
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (!isConnected) return;

  await mongoose.disconnect();
  isConnected = false;
  console.log('🔌 MongoDB disconnected');
};

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});
