import { useRef, useState } from 'react';
import {
  QrCode,
  Download,
  ArrowLeft,
  RotateCcw,
  Calendar,
  MapPin,
  Loader2,
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import buoyantLogo from '../assets/logo.png';
import interioLogo from '../assets/Interio Logo.png';
import ciconLogo from '../assets/Cicon logo.png';

function BuoyantLogo() {
  return (
    <img
      src={buoyantLogo}
      alt="Buoyant Media"
      className="h-10 w-auto object-contain sm:h-12"
    />
  );
}

function DotGrid() {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <span key={i} className="h-1.5 w-1.5 rounded-full bg-rose-400/70" />
      ))}
    </div>
  );
}

const INFO_ROWS = [
  { label: 'NAME', key: 'fullName' },
  { label: 'DESIGNATION', key: 'designation' },
  { label: 'COMPANY', key: 'company' },
  { label: 'BADGE ID', key: 'registrationId' },
];

const TOP_INFO = [
  { icon: Calendar, key: 'eventDates' },
  { icon: MapPin, key: 'venue' },
];

export default function QRPassCard({ data, onBack, onReset }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const {
    fullName = 'Shamima',
    designation = 'MD',
    company = 'BUOYANT',
    registrationId = 'ATS26-000006',
    eventDates = '07, 08 & 09\nAUGUST 2026',
    venue = 'Codissia Trade\nFair Centre,\nCoimbatore',
    qrCodeImage,
  } = data || {};

  
  async function handleDownload() {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, 
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${registrationId}-pass.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to capture pass card:', err);
    } finally {
      setDownloading(false);
    }
  }

  const values = { fullName, designation, company, registrationId };
  const topValues = { eventDates, venue };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-slate-100 p-3 sm:p-6 md:p-8">
      <div className="relative w-full max-w-md">
        <div
          ref={cardRef}
          className="relative w-full overflow-hidden rounded-t-[20px] border-2 border-b-0 border-rose-100 bg-white shadow-2xl"
        >
          <div className="absolute left-1/2 top-1 z-20 h-2 w-12 -translate-x-1/2 rounded-full bg-slate-300 sm:top-1.5 sm:h-2.5 sm:w-16" />

          <div className="h-6 w-full bg-rose-800 sm:h-8" />

          <div className="relative z-10 flex flex-col gap-5 px-4 pb-6 pt-5 sm:gap-6 sm:px-7 sm:pt-6">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <img
                src={interioLogo}
                alt="Interio & Exterio Expo 2026"
                className="h-20 w-auto flex-shrink-0 object-contain sm:h-24"
              />
              <span className="h-16 w-px flex-shrink-0 bg-slate-200 sm:h-20" />
              <div className="flex flex-1 flex-col items-center gap-0.5 px-1 text-center">
                <p className="text-sm font-extrabold leading-tight tracking-tight text-slate-900 sm:text-base">
                  INTERIO <span className="text-amber-600">&amp; EXTERIO</span>
                </p>
                <p className="text-sm font-extrabold leading-tight tracking-tight text-slate-900 sm:text-base">
                  EXPO 2026
                </p>
                <p className="mt-0.5 text-[10px] font-bold tracking-wide text-rose-800 sm:text-xs">
                  13<sup>TH</sup> EDITION
                </p>
              </div>
              <span className="h-16 w-px flex-shrink-0 bg-slate-200 sm:h-20" />
              <div className="flex flex-shrink-0 flex-col items-end gap-0.5">
                
                <img
                  src={ciconLogo}
                  alt="CICON 2026 Civil Expo"
                  className="h-14 w-auto max-w-[150px] object-contain sm:h-16 sm:max-w-[170px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 divide-y divide-slate-100 rounded-xl border border-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              {TOP_INFO.map(({ icon: Icon, key }) => (
                <div key={key} className="flex items-center gap-2.5 px-3 py-2.5">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-rose-700 text-white">
                    <Icon size={14} />
                  </span>
                  <span className="whitespace-pre-line text-xs font-bold leading-tight text-slate-900 sm:text-sm">
                    {topValues[key]}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 px-1 sm:gap-3.5 sm:px-2">
              {INFO_ROWS.map(({ label, key }) => (
                <p key={key} className="flex text-xs sm:text-sm">
                  <span className="w-[140px] flex-shrink-0 font-bold text-rose-700 sm:w-[160px]">
                    {label}
                  </span>
                  <span className="mr-2 text-slate-400">:</span>
                  <span className="break-words font-semibold text-slate-900">
                    {values[key]}
                  </span>
                </p>
              ))}
            </div>

            <div className="flex justify-center">
              <div className="flex h-36 w-36 items-center justify-center sm:h-40 sm:w-40">
                {qrCodeImage ? (
                  <img
                    src={qrCodeImage}
                    alt={`QR pass for ${registrationId}`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <QrCode size={140} className="text-black" />
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2.5 pt-1">
              <span className="h-px w-48 flex-shrink-0 bg-rose-800/70 sm:w-56" />
              <BuoyantLogo />
            </div>
          </div>

          <svg
            className="pointer-events-none relative z-0 -mb-px block w-full"
            viewBox="0 0 400 40"
            fill="none"
            preserveAspectRatio="none"
          >
            <path d="M0 40 L0 14 C60 2 130 0 200 12 C270 24 330 8 400 0 L400 40 Z" fill="#fbcfe0" />
            <path d="M0 40 L0 24 C70 10 140 8 210 20 C280 32 330 18 400 12 L400 40 Z" fill="#9f1239" />
          </svg>

          <div className="relative z-10 -mt-px flex items-center justify-center gap-3 bg-rose-800 px-4 pb-5 pt-2 sm:pb-6">
            <span className="h-px w-10 flex-shrink-0 bg-white/70 sm:w-14" />
            <span className="text-lg font-extrabold tracking-wide text-white sm:text-xl">
              Visitors Pass
            </span>
            <span className="h-px w-10 flex-shrink-0 bg-white/70 sm:w-14" />
          </div>
        </div>

      
        <div className="rounded-b-[20px] border-2 border-t-0 border-rose-100 bg-rose-800 px-3 pb-4 pt-3 shadow-2xl sm:px-5">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex flex-shrink-0 items-center justify-center gap-2 rounded-full border-2 border-white/80 bg-transparent px-4 py-2 text-xs font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
            >
              {downloading ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Preparing...
                </>
              ) : (
                <>
                  <Download size={15} /> Download Pass
                </>
              )}
            </button>

            {onBack && (
              <button
                onClick={onBack}
                className="flex flex-shrink-0 items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-rose-800 shadow-sm transition hover:bg-rose-50 sm:text-sm"
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}

            {onReset && (
              <button
                onClick={onReset}
                className="flex flex-shrink-0 items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-emerald-600 shadow-sm transition hover:bg-emerald-50 sm:text-sm"
              >
                <RotateCcw size={14} /> Register Another
              </button>
            )}
          </div>

          <div className="mt-3 flex justify-center">
            <DotGrid />
          </div>
        </div>
      </div>
    </div>
  );
}