const axios = require('axios');

const ZEPTOMAIL_URL = process.env.ZEPTOMAIL_URL || 'https://api.zeptomail.in/v1.1/email';

function buildConfirmationEmailHtml({ fullName, registrationId }) {
  const eventName = process.env.EVENT_NAME || 'INTERIO & EXTERIO EXPO';
  const eventDates = process.env.EVENT_DATES || '07, 08 & 09 August 2026';
  const eventVenue = process.env.EVENT_VENUE || 'CODISSIA TRADE CENTRE';

  return `
  <div style="font-family: Arial, Helvetica, sans-serif; background:#EAF2FC; padding:24px;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="background:linear-gradient(135deg,#0F3D7A,#14428c);padding:24px 28px;">
        <p style="margin:0;color:#8BC53F;font-weight:700;letter-spacing:1px;font-size:12px;text-transform:uppercase;">Registration Confirmed</p>
        <h1 style="margin:6px 0 0;color:#ffffff;font-size:22px;">${eventName}</h1>
      </div>
      <div style="padding:28px;">
        <p style="color:#1a1a1a;font-size:15px;">Hi <strong>${fullName}</strong>,</p>
        <p style="color:#334155;font-size:14px;line-height:1.6;">
          Thank you for registering. Your digital event pass is attached below.
          Please carry this QR code (digital or printed) for quick check-in at the venue.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <img src="cid:qrpass" alt="QR Pass" style="width:220px;height:220px;border:6px solid #EAF2FC;border-radius:12px;" />
          <p style="margin-top:10px;font-size:13px;color:#64748b;">Registration ID: <strong style="color:#0F3D7A;">${registrationId}</strong></p>
        </div>
        <div style="background:#EAF2FC;border-radius:12px;padding:16px 18px;margin-top:8px;">
          <p style="margin:0 0 6px;font-size:13px;color:#0F3D7A;font-weight:700;">DATE</p>
          <p style="margin:0 0 12px;font-size:14px;color:#1e293b;">${eventDates}</p>
          <p style="margin:0 0 6px;font-size:13px;color:#0F3D7A;font-weight:700;">VENUE</p>
          <p style="margin:0;font-size:14px;color:#1e293b;">${eventVenue}</p>
        </div>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">
          This is an automated confirmation email. Your registration data is stored securely and never shared with third parties.
        </p>
      </div>
    </div>
  </div>`;
}

async function sendRegistrationEmail({ to, fullName, registrationId, qrCodeDataUrl }) {
  try {
    const base64Data = qrCodeDataUrl.split(',')[1];
    const html = buildConfirmationEmailHtml({ fullName, registrationId });

    const payload = {
      from: {
        address: process.env.ZEPTOMAIL_FROM_EMAIL,
        name: process.env.ZEPTOMAIL_FROM_NAME || 'Event Team',
      },
      to: [
        {
          email_address: {
            address: to,
            name: fullName,
          },
        },
      ],
      subject: `Your ${process.env.EVENT_NAME || 'Event'} Pass - ${registrationId}`,
      htmlbody: html,
      inline_images: [
        {
          cid: 'qrpass',
          content: base64Data,
          mime_type: 'image/png',
        },
      ],
      attachments: [
        {
          content: base64Data,
          mime_type: 'image/png',
          name: `${registrationId}-qr-pass.png`,
        },
      ],
    };

    await axios.post(ZEPTOMAIL_URL, payload, {
      headers: {
        Authorization: process.env.ZEPTOMAIL_TOKEN,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    return { success: true };
  } catch (error) {
    const details = error.response?.data?.message || error.message;
    return { success: false, error: details };
  }
}

module.exports = { sendRegistrationEmail };