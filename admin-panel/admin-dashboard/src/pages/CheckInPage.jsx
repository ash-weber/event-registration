import { useRef, useState, useEffect } from 'react';
import {
  ScanLine,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Info,
  QrCode,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../api/axios';

const SCANNER_ELEMENT_ID = 'qr-camera-scanner';

export default function CheckInPage() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const html5QrRef = useRef(null);
  const scanningRef = useRef(false);

  async function submitPayload(payload) {
    if (!payload.trim()) return;

    setSubmitting(true);
    setResult(null);
    try {
      const res = await api.post('/admin/checkin', { qrPayload: payload.trim() });
      setResult({
        type: res.data.alreadyCheckedIn ? 'already' : 'success',
        message: res.data.message,
        visitor: res.data.data,
      });
    } catch (err) {
      setResult({
        type: 'error',
        message: err.response?.data?.message || 'Check-in failed. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  function startCamera() {
    setCameraError('');
    setResult(null);
    setCameraOpen(true);
  }

  function stopCamera() {
    const instance = html5QrRef.current;
    if (instance) {
      instance
        .stop()
        .then(() => instance.clear())
        .catch(() => {});
      html5QrRef.current = null;
    }
    scanningRef.current = false;
    setCameraOpen(false);
  }

  useEffect(() => {
    if (!cameraOpen) return;

    const qr = new Html5Qrcode(SCANNER_ELEMENT_ID);
    html5QrRef.current = qr;
    scanningRef.current = false;

    qr.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      async (decodedText) => {
        if (scanningRef.current) return;
        scanningRef.current = true;

        stopCamera();
        await submitPayload(decodedText);
      },
      () => {}
    ).catch((err) => {
      setCameraError(
        'Could not access camera. Please allow camera permission and try again.'
      );
      setCameraOpen(false);
      console.error('QR camera start failed:', err);
    });

    return () => {
      if (html5QrRef.current) {
        html5QrRef.current
          .stop()
          .then(() => html5QrRef.current?.clear())
          .catch(() => {});
        html5QrRef.current = null;
      }
    };
  }, [cameraOpen]);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col items-center px-4 pt-8 pb-5 text-center sm:px-6 sm:pt-10 sm:pb-6">
          <span className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 sm:mb-4 sm:h-20 sm:w-20">
            <ScanLine size={28} className="text-blue-600 sm:hidden" />
            <ScanLine size={32} className="hidden text-blue-600 sm:block" />
            <span className="absolute -top-1 left-1 h-1.5 w-1.5 rounded-full bg-blue-200" />
            <span className="absolute -bottom-2 -right-1 h-1 w-1 rounded-full bg-blue-300" />
            <span className="absolute top-2 -right-3 h-1 w-1 rounded-full bg-blue-200" />
          </span>
          <h1 className="text-xl font-bold text-brand-navyDark sm:text-2xl">Gate Check-in</h1>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Scan a visitor's QR pass using your device camera to check them in.
          </p>
        </div>

        <div className="px-4 pb-5 sm:px-6 sm:pb-6">
          <div className="relative flex min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/30 p-5 sm:min-h-[320px] sm:p-6">
            <span className="absolute left-3 top-3 h-5 w-5 rounded-tl-lg border-l-2 border-t-2 border-blue-500" />
            <span className="absolute right-3 top-3 h-5 w-5 rounded-tr-lg border-r-2 border-t-2 border-blue-500" />
            <span className="absolute bottom-3 left-3 h-5 w-5 rounded-bl-lg border-b-2 border-l-2 border-blue-500" />
            <span className="absolute bottom-3 right-3 h-5 w-5 rounded-br-lg border-b-2 border-r-2 border-blue-500" />

            {cameraOpen ? (
              <div id={SCANNER_ELEMENT_ID} className="w-full max-w-xs overflow-hidden rounded-xl" />
            ) : (
              <>
                <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-500 sm:mb-4 sm:h-16 sm:w-16">
                  {submitting ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <Camera size={24} />
                  )}
                </span>
                <h3 className="text-sm font-bold text-brand-navyDark sm:text-base">
                  {submitting ? 'Verifying...' : 'Ready to Scan'}
                </h3>
                {!submitting && (
                  <p className="mt-1 text-center text-xs text-slate-500 sm:text-sm">
                    Tap "Scan with Camera" and position the
                    <br />
                    QR code within the frame
                  </p>
                )}
              </>
            )}

            {cameraError && (
              <p className="mt-3 text-center text-xs font-medium text-red-500">{cameraError}</p>
            )}
          </div>

          <button
            type="button"
            onClick={cameraOpen ? stopCamera : startCamera}
            disabled={submitting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Verifying...
              </>
            ) : cameraOpen ? (
              <>
                <Camera size={16} /> Stop Camera
              </>
            ) : (
              <>
                <Camera size={16} /> Scan with Camera
              </>
            )}
          </button>
        </div>

        {result && (
          <div className="px-4 pb-5 sm:px-6 sm:pb-6">
            <div
              className={`flex items-start gap-3 rounded-xl p-4 ${
                result.type === 'error'
                  ? 'bg-red-50'
                  : result.type === 'already'
                  ? 'bg-amber-50'
                  : 'bg-emerald-50'
              }`}
            >
              {result.type === 'error' ? (
                <AlertTriangle className="mt-0.5 flex-shrink-0 text-red-500" size={20} />
              ) : (
                <CheckCircle2
                  className={`mt-0.5 flex-shrink-0 ${
                    result.type === 'already' ? 'text-amber-500' : 'text-emerald-500'
                  }`}
                  size={20}
                />
              )}
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium ${
                    result.type === 'error'
                      ? 'text-red-700'
                      : result.type === 'already'
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }`}
                >
                  {result.message}
                </p>
                {result.visitor && (
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {result.visitor.registrationId} · {result.visitor.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mx-4 mb-5 flex items-center justify-between gap-3 rounded-xl bg-blue-50/70 px-4 py-3.5 sm:mx-6 sm:mb-6 sm:gap-4 sm:px-5 sm:py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
              <Info size={14} />
            </span>
            <p className="text-xs text-slate-600 sm:text-sm">
              Tip: Hold the QR pass steady within the frame. Check-in happens automatically
              as soon as the code is recognized.
            </p>
          </div>
          <span className="hidden h-14 w-10 flex-shrink-0 items-center justify-center rounded-xl border-4 border-slate-800 bg-white sm:flex">
            <QrCode size={18} className="text-slate-700" />
          </span>
        </div>
      </div>
    </div>
  );
}