const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');
const { Readable } = require('stream');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { verifyQrPayload, generateQrCodeImage } = require('../utils/qrGenerator');
const generateRegistrationId = require('../utils/generateRegistrationId');

function signToken(admin) {
  return jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) throw new ApiError(401, 'Invalid email or password.');

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password.');

  await prisma.admin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });

  const token = signToken(admin);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    },
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const admin = await prisma.admin.findUnique({
    where: { id: req.admin.id },
    select: { id: true, name: true, email: true, role: true, lastLoginAt: true },
  });
  if (!admin) throw new ApiError(404, 'Admin not found');
  res.json({ success: true, data: admin });
});

const listVisitors = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;
  const search = req.query.search || '';

  const where = search
    ? {
        OR: [
          { fullName: { contains: search } },
          { email: { contains: search } },
          { mobileNumber: { contains: search } },
          { registrationId: { contains: search } },
        ],
      }
    : {};

  const [visitors, total] = await Promise.all([
    prisma.visitor.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        registrationId: true,
        fullName: true,
        email: true,
        mobileNumber: true,
        company: true,
        designation: true,
        city: true,
        emailStatus: true,
        checkedIn: true,
        createdAt: true,
      },
    }),
    prisma.visitor.count({ where }),
  ]);

  res.json({
    success: true,
    data: visitors,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

const getVisitorDetail = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new ApiError(400, 'Invalid visitor id');

  const visitor = await prisma.visitor.findUnique({ where: { id } });
  if (!visitor) throw new ApiError(404, 'Visitor not found');

  res.json({ success: true, data: visitor });
});

// GET /api/admin/visitors/export?format=csv|excel&search=
const exportVisitors = asyncHandler(async (req, res) => {
  const format = (req.query.format || 'csv').toLowerCase();
  const search = req.query.search || '';

  const where = search
    ? {
        OR: [
          { fullName: { contains: search } },
          { email: { contains: search } },
          { mobileNumber: { contains: search } },
          { registrationId: { contains: search } },
        ],
      }
    : {};

  const visitors = await prisma.visitor.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      registrationId: true,
      fullName: true,
      email: true,
      mobileNumber: true,
      company: true,
      designation: true,
      city: true,
      emailStatus: true,
      checkedIn: true,
      checkedInAt: true,
      createdAt: true,
    },
  });

  const timestamp = new Date().toISOString().slice(0, 10);

  const rows = visitors.map((v) => ({
    registrationId: v.registrationId,
    fullName: v.fullName,
    email: v.email,
    mobileNumber: v.mobileNumber,
    company: v.company || '',
    designation: v.designation || '',
    city: v.city || '',
    emailStatus: v.emailStatus,
    checkedIn: v.checkedIn ? 'Yes' : 'No',
    checkedInAt: v.checkedInAt ? new Date(v.checkedInAt).toLocaleString('en-IN') : '',
    createdAt: new Date(v.createdAt).toLocaleString('en-IN'),
  }));

  if (format === 'excel' || format === 'xlsx') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Visitors');

    sheet.columns = [
      { header: 'Registration ID', key: 'registrationId', width: 18 },
      { header: 'Full Name', key: 'fullName', width: 24 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Mobile Number', key: 'mobileNumber', width: 16 },
      { header: 'Company', key: 'company', width: 22 },
      { header: 'Designation', key: 'designation', width: 20 },
      { header: 'City', key: 'city', width: 16 },
      { header: 'Email Status', key: 'emailStatus', width: 14 },
      { header: 'Checked In', key: 'checkedIn', width: 12 },
      { header: 'Checked In At', key: 'checkedInAt', width: 20 },
      { header: 'Registered On', key: 'createdAt', width: 20 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A3A6E' } };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    rows.forEach((row) => sheet.addRow(row));
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="visitors-${timestamp}.xlsx"`);

    await workbook.xlsx.write(res);
    return res.end();
  }

  const fields = [
    { label: 'Registration ID', value: 'registrationId' },
    { label: 'Full Name', value: 'fullName' },
    { label: 'Email', value: 'email' },
    { label: 'Mobile Number', value: 'mobileNumber' },
    { label: 'Company', value: 'company' },
    { label: 'Designation', value: 'designation' },
    { label: 'City', value: 'city' },
    { label: 'Email Status', value: 'emailStatus' },
    { label: 'Checked In', value: 'checkedIn' },
    { label: 'Checked In At', value: 'checkedInAt' },
    { label: 'Registered On', value: 'createdAt' },
  ];
  const parser = new Parser({ fields });
  const csv = parser.parse(rows);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="visitors-${timestamp}.csv"`);
  res.status(200).send('\uFEFF' + csv);
});


const HEADER_MAP = {
  fullname: 'fullName',
  'full name': 'fullName',
  name: 'fullName',
  email: 'email',
  'email address': 'email',
  mobile: 'mobileNumber',
  'mobile number': 'mobileNumber',
  mobilenumber: 'mobileNumber',
  phone: 'mobileNumber',
  'phone number': 'mobileNumber',
  company: 'company',
  organisation: 'company',
  organization: 'company',
  designation: 'designation',
  title: 'designation',
  city: 'city',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sheetToRows(sheet) {
  const rows = [];
  const headerValues = sheet.getRow(1).values || [];
  const headers = headerValues.slice(1).map((h) => String(h || '').trim().toLowerCase());

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values.slice(1);
    const obj = {};
    headers.forEach((h, i) => {
      const key = HEADER_MAP[h];
      if (!key) return;
      const raw = values[i];
      obj[key] = raw === undefined || raw === null ? '' : String(raw).trim();
    });
    if (Object.values(obj).some((v) => v !== '')) rows.push(obj);
  });

  return rows;
}

async function parseUploadedFile(file) {
  const workbook = new ExcelJS.Workbook();
  const isCsv = file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv');

  if (isCsv) {
    await workbook.csv.read(Readable.from(file.buffer));
  } else {
    await workbook.xlsx.load(file.buffer);
  }

  const sheet = workbook.worksheets[0];
  if (!sheet) throw new ApiError(400, 'The uploaded file has no data.');
  return sheetToRows(sheet);
}

const downloadImportTemplate = asyncHandler(async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Visitors');

  sheet.columns = [
    { header: 'fullName', key: 'fullName', width: 24 },
    { header: 'email', key: 'email', width: 28 },
    { header: 'mobileNumber', key: 'mobileNumber', width: 16 },
    { header: 'company', key: 'company', width: 22 },
    { header: 'designation', key: 'designation', width: 20 },
    { header: 'city', key: 'city', width: 16 },
  ];

  sheet.addRow({
    fullName: 'John Doe',
    email: 'john@example.com',
    mobileNumber: '9876543210',
    company: 'Acme Pvt Ltd',
    designation: 'Manager',
    city: 'Chennai',
  });

  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A3A6E' } };
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'attachment; filename="visitor-import-template.xlsx"');
  await workbook.xlsx.write(res);
  res.end();
});

const importVisitors = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Please upload a CSV or Excel file.');

  const rows = await parseUploadedFile(req.file);
  if (rows.length === 0) throw new ApiError(400, 'No valid rows found in the file.');
  if (rows.length > 2000) throw new ApiError(400, 'Import limited to 2000 rows at a time.');

  const existingEmails = new Set(
    (await prisma.visitor.findMany({ select: { email: true } })).map((v) => v.email.toLowerCase())
  );

  const seenInFile = new Set();
  const created = [];
  const skipped = [];
  const failed = [];

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2; 
    const r = rows[i];
    const fullName = r.fullName || '';
    const email = (r.email || '').toLowerCase();
    const mobileNumber = r.mobileNumber || '';

    if (!fullName || !email || !mobileNumber) {
      skipped.push({ row: rowNum, reason: 'Missing fullName, email or mobileNumber.' });
      continue;
    }
    if (!EMAIL_RE.test(email)) {
      skipped.push({ row: rowNum, reason: `Invalid email format: ${email}` });
      continue;
    }
    if (existingEmails.has(email) || seenInFile.has(email)) {
      skipped.push({ row: rowNum, reason: `Duplicate email: ${email}` });
      continue;
    }

    try {
      const registrationId = await generateRegistrationId();
      const { payload, dataUrl } = await generateQrCodeImage(registrationId);

      const visitor = await prisma.visitor.create({
        data: {
          registrationId,
          fullName,
          email,
          mobileNumber,
          company: r.company || null,
          designation: r.designation || null,
          city: r.city || null,
          qrCodeData: payload,
          qrCodeImage: dataUrl,
          emailStatus: 'PENDING',
          ipAddress: req.ip,
        },
      });

      seenInFile.add(email);
      created.push({ registrationId: visitor.registrationId, fullName, email });
    } catch (err) {
      failed.push({ row: rowNum, reason: err.message || 'Failed to create visitor.' });
    }
  }

  res.status(201).json({
    success: true,
    message: `Import complete: ${created.length} added, ${skipped.length} skipped, ${failed.length} failed.`,
    data: {
      totalRows: rows.length,
      insertedCount: created.length,
      skippedCount: skipped.length,
      failedCount: failed.length,
      inserted: created,
      skipped,
      failed,
    },
  });
});

const checkInVisitor = asyncHandler(async (req, res) => {
  const { qrPayload } = req.body;
  if (!qrPayload) throw new ApiError(400, 'QR payload is required');

  const registrationId = verifyQrPayload(qrPayload);
  if (!registrationId) throw new ApiError(400, 'Invalid or tampered QR code');

  const visitor = await prisma.visitor.findUnique({ where: { registrationId } });
  if (!visitor) throw new ApiError(404, 'Registration not found');

  if (visitor.checkedIn) {
    return res.json({
      success: true,
      alreadyCheckedIn: true,
      message: `${visitor.fullName} was already checked in.`,
      data: visitor,
    });
  }

  const updated = await prisma.visitor.update({
    where: { registrationId },
    data: { checkedIn: true, checkedInAt: new Date() },
  });

  res.json({ success: true, message: `${visitor.fullName} checked in successfully.`, data: updated });
});

module.exports = {
  loginAdmin,
  getProfile,
  listVisitors,
  getVisitorDetail,
  exportVisitors,
  downloadImportTemplate,
  importVisitors,
  checkInVisitor,
};