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
    
    <div className="mx-auto flex h-full w-full max-w-2xl min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-shrink-0 flex-col items-center px-3 pt-3 pb-2 text-center sm:px-6 sm:pt-6 sm:pb-3">
          <span className="relative mb-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 sm:mb-3 sm:h-16 sm:w-16">
            <ScanLine size={18} className="text-blue-600 sm:hidden" />
            <ScanLine size={26} className="hidden text-blue-600 sm:block" />
            <span className="absolute -top-1 left-1 h-1.5 w-1.5 rounded-full bg-blue-200" />
            <span className="absolute -bottom-2 -right-1 h-1 w-1 rounded-full bg-blue-300" />
            <span className="absolute top-2 -right-3 h-1 w-1 rounded-full bg-blue-200" />
          </span>
          <h1 className="text-base font-bold text-brand-navyDark sm:text-xl">Gate Check-in</h1>
          <p className="mt-0.5 max-w-md text-[11px] text-slate-500 sm:text-sm">
            Scan a visitor's QR pass using your device camera to check them in.
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-3 pb-2 sm:px-6 sm:pb-4">
          <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/30 p-3 sm:p-6">
            <span className="absolute left-2 top-2 h-4 w-4 rounded-tl-lg border-l-2 border-t-2 border-blue-500 sm:left-3 sm:top-3 sm:h-5 sm:w-5" />
            <span className="absolute right-2 top-2 h-4 w-4 rounded-tr-lg border-r-2 border-t-2 border-blue-500 sm:right-3 sm:top-3 sm:h-5 sm:w-5" />
            <span className="absolute bottom-2 left-2 h-4 w-4 rounded-bl-lg border-b-2 border-l-2 border-blue-500 sm:bottom-3 sm:left-3 sm:h-5 sm:w-5" />
            <span className="absolute bottom-2 right-2 h-4 w-4 rounded-br-lg border-b-2 border-r-2 border-blue-500 sm:bottom-3 sm:right-3 sm:h-5 sm:w-5" />

            {cameraOpen ? (
              <div
                id={SCANNER_ELEMENT_ID}
                className="aspect-square w-full max-w-[220px] overflow-hidden rounded-xl sm:max-w-xs"
              />
            ) : (
              <>
                <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-500 sm:mb-4 sm:h-16 sm:w-16">
                  {submitting ? (
                    <Loader2 size={20} className="animate-spin sm:hidden" />
                  ) : (
                    <Camera size={20} className="sm:hidden" />
                  )}
                  {submitting ? (
                    <Loader2 size={24} className="hidden animate-spin sm:block" />
                  ) : (
                    <Camera size={24} className="hidden sm:block" />
                  )}
                </span>
                <h3 className="text-xs font-bold text-brand-navyDark sm:text-base">
                  {submitting ? 'Verifying...' : 'Ready to Scan'}
                </h3>
                {!submitting && (
                  <p className="mt-1 text-center text-[11px] text-slate-500 sm:text-sm">
                    Tap "Scan with Camera" and position the
                    <br className="hidden sm:block" /> QR code within the frame
                  </p>
                )}
              </>
            )}

            {cameraError && (
              <p className="mt-2 text-center text-[11px] font-medium text-red-500 sm:text-xs">
                {cameraError}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={cameraOpen ? stopCamera : startCamera}
            disabled={submitting}
            className="mt-3 flex w-full flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer sm:py-3 sm:text-sm"
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
          <div className="flex-shrink-0 px-3 pb-2 sm:px-6 sm:pb-4">
            <div
              className={`flex items-start gap-2.5 rounded-xl p-3 sm:gap-3 sm:p-4 ${
                result.type === 'error'
                  ? 'bg-red-50'
                  : result.type === 'already'
                  ? 'bg-amber-50'
                  : 'bg-emerald-50'
              }`}
            >
              {result.type === 'error' ? (
                <AlertTriangle className="mt-0.5 flex-shrink-0 text-red-500" size={18} />
              ) : (
                <CheckCircle2
                  className={`mt-0.5 flex-shrink-0 ${
                    result.type === 'already' ? 'text-amber-500' : 'text-emerald-500'
                  }`}
                  size={18}
                />
              )}
              <div className="min-w-0">
                <p
                  className={`text-xs font-medium sm:text-sm ${
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
                  <p className="mt-1 truncate text-[11px] text-slate-500 sm:text-xs">
                    {result.visitor.registrationId} · {result.visitor.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mx-3 mb-2.5 flex flex-shrink-0 items-center justify-between gap-2.5 rounded-xl bg-blue-50/70 px-3 py-2.5 sm:mx-6 sm:mb-5 sm:gap-4 sm:px-5 sm:py-4">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-white sm:h-7 sm:w-7">
              <Info size={12} className="sm:hidden" />
              <Info size={14} className="hidden sm:block" />
            </span>
            <p className="text-[11px] text-slate-600 sm:text-sm">
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