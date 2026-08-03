const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

function daysAgo(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}


function localDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function pctChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

const getDashboardStats = asyncHandler(async (req, res) => {
  const last7Start = daysAgo(7);
  const prev7Start = daysAgo(14);

  const [
    totalVisitors,
    visitorsLast7,
    visitorsPrev7,
    qrSentLast7,
    qrSentPrev7,
    pendingNow,
    pendingLast7,
  ] = await Promise.all([
    prisma.visitor.count(),
    prisma.visitor.count({ where: { createdAt: { gte: last7Start } } }),
    prisma.visitor.count({ where: { createdAt: { gte: prev7Start, lt: last7Start } } }),
    prisma.visitor.count({ where: { emailStatus: 'SENT', createdAt: { gte: last7Start } } }),
    prisma.visitor.count({ where: { emailStatus: 'SENT', createdAt: { gte: prev7Start, lt: last7Start } } }),
    prisma.visitor.count({ where: { emailStatus: 'PENDING' } }),
    prisma.visitor.count({ where: { emailStatus: 'PENDING', createdAt: { gte: prev7Start, lt: last7Start } } }),
  ]);

  res.json({
    success: true,
    data: {
      totalVisitors: { value: totalVisitors, change: pctChange(visitorsLast7, visitorsPrev7) },
      thisEvent: { value: visitorsLast7, change: pctChange(visitorsLast7, visitorsPrev7) },
      qrSent: { value: qrSentLast7, change: pctChange(qrSentLast7, qrSentPrev7) },
      pending: { value: pendingNow, change: pctChange(pendingNow, pendingLast7) },
    },
  });
});

const getRegistrationsOverTime = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 7;
  const start = daysAgo(days - 1);

  const rows = await prisma.visitor.findMany({
    where: { createdAt: { gte: start } },
    select: { createdAt: true },
  });

  const buckets = {};
  const order = [];
  for (let i = 0; i < days; i++) {
    const d = daysAgo(days - 1 - i);
    const key = localDateKey(d);
    buckets[key] = 0;
    order.push(key);
  }
  rows.forEach((r) => {
    const key = localDateKey(r.createdAt);
    if (key in buckets) buckets[key] += 1;
  });

  const series = order.map((key) => {
    const [y, m, d] = key.split('-').map(Number);
    return {
      date: key,
      label: new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      count: buckets[key],
    };
  });

  res.json({ success: true, data: series });
});

const getRecentRegistrations = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 5;

  const visitors = await prisma.visitor.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      registrationId: true,
      fullName: true,
      email: true,
      mobileNumber: true,
      createdAt: true,
      emailStatus: true,
      checkedIn: true,
    },
  });

  res.json({ success: true, data: visitors });
});

module.exports = { getDashboardStats, getRegistrationsOverTime, getRecentRegistrations };