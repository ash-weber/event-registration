const QRCode = require('qrcode');
const crypto = require('crypto');

function buildQrPayload(registrationId) {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(registrationId)
    .digest('hex')
    .slice(0, 16);

  return JSON.stringify({
    rid: registrationId,
    evt: process.env.EVENT_CODE || 'EVT',
    sig: signature,
  });
}

function verifyQrPayload(rawPayload) {
  try {
    const data = JSON.parse(rawPayload);
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const expected = crypto
      .createHmac('sha256', secret)
      .update(data.rid)
      .digest('hex')
      .slice(0, 16);
    return expected === data.sig ? data.rid : null;
  } catch (err) {
    return null;
  }
}

async function generateQrCodeImage(registrationId) {
  const payload = buildQrPayload(registrationId);
  const dataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 320,
    color: {
      dark: '#0F3D7A',
      light: '#FFFFFFFF',
    },
  });
  return { payload, dataUrl };
}

module.exports = { buildQrPayload, verifyQrPayload, generateQrCodeImage };