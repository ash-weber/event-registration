
process.env.TZ = process.env.TZ || 'Asia/Kolkata';

require('dotenv').config();
const app = require('./app');
const prisma = require('./config/prisma');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await prisma.$connect();
    console.log('Connected to MariaDB via Prisma');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT} (TZ=${process.env.TZ})`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});