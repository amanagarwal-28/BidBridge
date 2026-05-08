import app from './app';
import { ENV } from './config/env';
import { prisma } from './config/prisma';

const start = async () => {
  try {
    await prisma.$connect();
    console.log('[DB] Connected to MySQL via Prisma');
    app.listen(ENV.PORT, '0.0.0.0', () => {
      console.log(`[Server] Running on port ${ENV.PORT} (${ENV.NODE_ENV})`);
    });
  } catch (err) {
    console.error('[DB] Connection failed:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

start();
