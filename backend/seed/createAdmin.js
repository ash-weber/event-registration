require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const name = process.env.SEED_ADMIN_NAME || 'Super Admin';
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`ℹ️  Admin with email ${email} already exists. Skipping.`);
    return;
  }

  const hashed = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.create({
    data: { name, email, password: hashed, role: 'SUPER_ADMIN' },
  });

  console.log(`✅ Admin created: ${admin.email} (id: ${admin.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });