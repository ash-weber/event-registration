const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const generateRegistrationId = require('../utils/generateRegistrationId');
const { generateQrCodeImage } = require('../utils/qrGenerator');
const { sendRegistrationEmail } = require('../utils/emailService');

const registerVisitor = asyncHandler(async (req, res) => {
  const { fullName, email, mobileNumber, company, designation, city } = req.body;

  const existing = await prisma.visitor.findFirst({ where: { email } });
  if (existing) {
    throw new ApiError(409, 'This email address is already registered for the event.', {
      registrationId: existing.registrationId,
    });
  }

  const registrationId = await generateRegistrationId();
  const { payload, dataUrl } = await generateQrCodeImage(registrationId);

  const visitor = await prisma.visitor.create({
    data: {
      registrationId,
      fullName,
      email,
      mobileNumber,
      company: company || null,
      designation: designation || null,
      city: city || null,
      qrCodeData: payload,
      qrCodeImage: dataUrl,
      ipAddress: req.ip,
    },
  });

  // Fire the email but don't block the response on SMTP latency/failures
  const emailResult = await sendRegistrationEmail({
    to: email,
    fullName,
    registrationId,
    qrCodeDataUrl: dataUrl,
  });

  await prisma.visitor.update({
    where: { id: visitor.id },
    data: {
      emailStatus: emailResult.success ? 'SENT' : 'FAILED',
      emailSentAt: emailResult.success ? new Date() : null,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful! Your QR pass has been generated.',
    data: {
      registrationId: visitor.registrationId,
      fullName: visitor.fullName,
      email: visitor.email,
      company: visitor.company,
      designation: visitor.designation,
      city: visitor.city,
      qrCodeImage: dataUrl,
      emailSent: emailResult.success,
    },
  });
});

const getRegistrationById = asyncHandler(async (req, res) => {
  const { registrationId } = req.params;

  const visitor = await prisma.visitor.findUnique({
    where: { registrationId },
    select: {
      registrationId: true,
      fullName: true,
      email: true,
      company: true,
      designation: true,
      city: true,
      qrCodeImage: true,
      emailStatus: true,
      checkedIn: true,
      createdAt: true,
    },
  });

  if (!visitor) throw new ApiError(404, 'Registration not found.');

  res.json({ success: true, data: visitor });
});

module.exports = { registerVisitor, getRegistrationById };