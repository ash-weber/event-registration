const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const generateRegistrationId = require('../utils/generateRegistrationId');
const { generateQrCodeImage } = require('../utils/qrGenerator');
const { sendRegistrationEmail } = require('../utils/emailService');


const BUSY_ERROR_CODES = new Set([
  'P2024', // connection pool timeout - no available connection
  'P2028', // transaction API timeout
  'P1001', // can't reach database server
  'P1002', // database server timed out
  'P1008', // operation timed out
  'P1017', // server closed the connection
]);

const BUSY_MESSAGE = 'Please wait a moment and try again.';

const registerVisitor = asyncHandler(async (req, res) => {
  const { fullName, email, mobileNumber, company, designation, city, numberOfAttendees } = req.body;

  let existing;
  try {
    existing = await prisma.visitor.findFirst({
      where: {
        OR: [{ email }, { mobileNumber }],
      },
    });
  } catch (err) {
    if (BUSY_ERROR_CODES.has(err.code)) {
      throw new ApiError(503, BUSY_MESSAGE);
    }
    throw err;
  }

  if (existing) {
    if (existing.email === email) {
      throw new ApiError(
        409,
        'This email address is already registered for the event.',
        [{ field: 'email', message: 'This email address is already registered for the event.' }]
      );
    }
    if (existing.mobileNumber === mobileNumber) {
      throw new ApiError(
        409,
        'This mobile number is already registered. Please use a different mobile number.',
        [{ field: 'mobileNumber', message: 'This mobile number is already registered. Please use a different mobile number.' }]
      );
    }
  }

  const registrationId = await generateRegistrationId();
  const { payload, dataUrl } = await generateQrCodeImage(registrationId);

  let visitor;
  try {
    visitor = await prisma.visitor.create({
      data: {
        registrationId,
        fullName,
        email,
        mobileNumber,
        company: company || null,
        designation: designation || null,
        city: city || null,
        numberOfAttendees: numberOfAttendees || 1,
        qrCodeData: payload,
        qrCodeImage: dataUrl,
        ipAddress: req.ip,
      },
    });
  } catch (err) {
    if (BUSY_ERROR_CODES.has(err.code)) {
      throw new ApiError(503, BUSY_MESSAGE);
    }

    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(',') : String(err.meta?.target || '');

      if (target.includes('mobileNumber')) {
        throw new ApiError(
          409,
          'This mobile number is already registered. Please use a different mobile number.',
          [{ field: 'mobileNumber', message: 'This mobile number is already registered. Please use a different mobile number.' }]
        );
      }
      if (target.includes('registrationId')) {
        throw new ApiError(409, 'Something went wrong generating your pass. Please try submitting again.');
      }
    }

    throw err;
  }

  let emailResult;
  try {
    emailResult = await sendRegistrationEmail({
      to: email,
      fullName,
      registrationId,
      qrCodeDataUrl: dataUrl,
    });
  } catch (err) {
    emailResult = { success: false };
  }

  let updated = visitor;
  try {
    updated = await prisma.visitor.update({
      where: { id: visitor.id },
      data: {
        emailStatus: emailResult.success ? 'SENT' : 'FAILED',
        emailSentAt: emailResult.success ? new Date() : null,
      },
    });
  } catch (err) {
   
  }

  res.status(201).json({
    success: true,
    message: 'Registration successful! Your QR pass has been generated.',
    data: {
      registrationId: updated.registrationId,
      fullName: updated.fullName,
      email: updated.email,
      company: updated.company,
      designation: updated.designation,
      city: updated.city,
      numberOfAttendees: updated.numberOfAttendees,
      qrCodeImage: dataUrl,
      emailSent: emailResult.success,
    },
  });
});

const getRegistrationById = asyncHandler(async (req, res) => {
  const { registrationId } = req.params;

  let visitor;
  try {
    visitor = await prisma.visitor.findUnique({
      where: { registrationId },
      select: {
        registrationId: true,
        fullName: true,
        email: true,
        company: true,
        designation: true,
        city: true,
        numberOfAttendees: true,
        qrCodeImage: true,
        emailStatus: true,
        checkedIn: true,
        createdAt: true,
      },
    });
  } catch (err) {
    if (BUSY_ERROR_CODES.has(err.code)) {
      throw new ApiError(503, BUSY_MESSAGE);
    }
    throw err;
  }

  if (!visitor) throw new ApiError(404, 'Registration not found.');

  res.json({ success: true, data: visitor });
});

module.exports = { registerVisitor, getRegistrationById };