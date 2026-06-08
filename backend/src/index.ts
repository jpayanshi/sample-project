import 'dotenv/config'; // load .env before anything else
import './config/env'; // then validate
import app from './app';
import { prisma } from './config/prisma';
import { redis } from './config/redis';
import { env } from './config/env';

async function main() {
  await redis.connect();
  await prisma.$connect();

  app.listen(env.PORT, () => {
    console.log(`Backend running on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
