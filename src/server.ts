import app from './app';
import { env } from './config/env';
import { connectDB } from './config/database';

const startServer = async (): Promise<void> => {
  try {
    // MongoDB 연결
    await connectDB();

    // Express 서버 시작
    app.listen(env.port, () => {
      console.log('=================================');
      console.log(`🚀 DateLog API Server Started`);
      console.log(`📍 Environment: ${env.nodeEnv}`);
      console.log(`🌐 Server running on port ${env.port}`);
      console.log(`📚 API Documentation: http://localhost:${env.port}/v1/docs`);
      console.log(`❤️  Health Check: http://localhost:${env.port}/v1/health`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = (signal: string): void => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
startServer();
