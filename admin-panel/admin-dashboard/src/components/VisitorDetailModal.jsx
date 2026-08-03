import { useEffect, useState, useRef } from 'react';
import { X, Loader2, Download, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { EmailStatusBadge, CheckInBadge } from './StatusBadge';

const NAVY = '#1a3a6e';

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-800">{value || '—'}</p>
    </div>
  );
}


function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function VisitorDetailModal({ visitorId, onClose }) {
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get(`/admin/visitors/${visitorId}`)
      .then((res) => {
        if (!cancelled) setVisitor(res.data.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load visitor details.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visitorId]);

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  
  async function handleDownload() {
    if (!visitor) return;
    setDownloading(true);
    try {
      const W = 720;
      const H = 980;
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = '#0f172a';
      ctx.font = '700 26px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Visitor Details', 48, 64);
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 92);
      ctx.lineTo(W, 92);
      ctx.stroke();

      const qrSize = 260;
      const qrX = (W - qrSize) / 2;
      const qrY = 130;
      if (visitor.qrCodeImage) {
        const qrImg = await loadImage(visitor.qrCodeImage);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        roundRect(ctx, qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 20);
        ctx.stroke();
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      }

      ctx.fillStyle = '#0f172a';
      ctx.font = '700 22px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(visitor.registrationId || '', W / 2, qrY + qrSize + 60);

      const pillY = qrY + qrSize + 84;
      ctx.font = '700 12px Arial';
      const sentText = visitor.emailStatus || '';
      const checkText = visitor.checkedIn ? 'Checked In' : 'Not Checked In';
      const sentW = ctx.measureText(sentText).width + 32;
      const checkW = ctx.measureText(checkText).width + 32;
      const gap = 12;
      const totalW = sentW + checkW + gap;
      let px = (W - totalW) / 2;

      ctx.fillStyle = '#dcfce7';
      roundRect(ctx, px, pillY, sentW, 30, 15);
      ctx.fill();
      ctx.fillStyle = '#15803d';
      ctx.textAlign = 'center';
      ctx.fillText(sentText, px + sentW / 2, pillY + 20);
      px += sentW + gap;

      ctx.fillStyle = '#f1f5f9';
      roundRect(ctx, px, pillY, checkW, 30, 15);
      ctx.fill();
      ctx.fillStyle = '#475569';
      ctx.fillText(checkText, px + checkW / 2, pillY + 20);

      const fields = [
        ['Full Name', visitor.fullName],
        ['Email', visitor.email],
        ['Mobile Number', visitor.mobileNumber],
        ['Company', visitor.company],
        ['Designation', visitor.designation],
        ['City', visitor.city],
        ['Registered On', visitor.createdAt ? new Date(visitor.createdAt).toLocaleString('en-GB') : ''],
        ['Checked In At', visitor.checkedInAt ? new Date(visitor.checkedInAt).toLocaleString('en-GB') : '—'],
      ];

      const colX = [48, W / 2 + 8];
      const colW = W / 2 - 64;
      let rowY = pillY + 70;
      const rowH = 78;

      fields.forEach(([label, value], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = colX[col];
        const y = rowY + row * rowH;

        ctx.textAlign = 'left';
        ctx.fillStyle = '#94a3b8';
        ctx.font = '700 11px Arial';
        ctx.fillText(label.toUpperCase(), x, y);

        ctx.fillStyle = '#1e293b';
        ctx.font = '600 16px Arial';
        const text = String(value || '—');
        const truncated = ctx.measureText(text).width > colW ? text.slice(0, 34) + '…' : text;
        ctx.fillText(truncated, x, y + 26);
      });

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${visitor.registrationId}-visitor-details.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      setError('Could not generate the download. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-shrink-0 justify-center pt-2 sm:hidden">
          <span className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">Visitor Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          {loading && (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="animate-spin" style={{ color: NAVY }} size={26} />
            </div>
          )}

          {!loading && error && (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
              <AlertCircle className="text-red-400" size={26} />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {!loading && !error && visitor && (
            <>
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-2xl border-2 border-slate-900 p-2">
                  {visitor.qrCodeImage ? (
                    <img
                      src={visitor.qrCodeImage}
                      alt="QR pass"
                      className="h-40 w-40 object-contain xs:h-44 xs:w-44 sm:h-52 sm:w-52"
                    />
                  ) : (
                    <div className="flex h-40 w-40 items-center justify-center text-xs text-slate-300 sm:h-52 sm:w-52">
                      No QR
                    </div>
                  )}
                </div>
                <p className="break-all text-center text-base font-bold text-slate-900 sm:text-lg">
                  {visitor.registrationId}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <EmailStatusBadge status={visitor.emailStatus} />
                  <CheckInBadge checkedIn={visitor.checkedIn} />
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition disabled:opacity-50 cursor-pointer sm:w-auto sm:py-2"
                  style={{ backgroundColor: NAVY }}
                >
                  {downloading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Download size={13} />
                  )}
                  Download Details
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
                <Field label="Full Name" value={visitor.fullName} />
                <Field label="Email" value={visitor.email} />
                <Field label="Mobile Number" value={visitor.mobileNumber} />
                <Field label="Company" value={visitor.company} />
                <Field label="Designation" value={visitor.designation} />
                <Field label="City" value={visitor.city} />
                <Field
                  label="Registered On"
                  value={visitor.createdAt ? new Date(visitor.createdAt).toLocaleString('en-GB') : ''}
                />
                <Field
                  label="Checked In At"
                  value={visitor.checkedInAt ? new Date(visitor.checkedInAt).toLocaleString('en-GB') : '—'}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}