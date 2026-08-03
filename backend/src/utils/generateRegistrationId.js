const prisma = require('../config/prisma');

async function generateRegistrationId() {
  const prefix = process.env.EVENT_CODE || 'EVT';
  const count = await prisma.visitor.count();
  const nextNumber = count + 1;
  const padded = String(nextNumber).padStart(6, '0');
  const candidate = `${prefix}-${padded}`;

  const exists = await prisma.visitor.findUnique({ where: { registrationId: candidate } });
  if (!exists) return candidate;

  const fallbackSuffix = Date.now().toString().slice(-6);
  return `${prefix}-${fallbackSuffix}`;
}

module.exports = generateRegistrationId;