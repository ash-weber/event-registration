import { Check, UserRound, Mail, CalendarDays, RotateCcw, QrCode, ArrowRight } from 'lucide-react';

export default function SuccessCard({ data, onViewQr, onReset }) {
  const { fullName, registrationId, email, eventName, eventDate } = data;

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-blue-50/60 to-white p-4 sm:p-6">
      <style>{`
        @keyframes borderRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animated-border-wrap {
          position: relative;
          border-radius: 1.5rem;
          padding: 2px;
          overflow: hidden;
        }
        .animated-border-wrap::before {
          content: "";
          position: absolute;
          inset: -50%;
          background: conic-gradient(from 0deg, #1e3a8a, #3b82f6, #8bc53f, #3b82f6, #1e3a8a);
          animation: borderRotate 4s linear infinite;
        }
        .dashed-ring {
          animation: ringRotate 7s linear infinite;
        }
      `}</style>

      <div className="pointer-events-none absolute left-6 top-6 grid grid-cols-3 gap-2 sm:left-10 sm:top-10">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-brand-navy/60" />
        ))}
      </div>

      <span className="pointer-events-none absolute right-16 top-10 h-6 w-6 rounded-full border-2 border-blue-300 sm:right-24 sm:top-16" />
      <span className="pointer-events-none absolute right-6 top-0 h-56 w-56 rounded-full border-[16px] border-blue-100 sm:right-0 sm:h-72 sm:w-72" />

      <span className="pointer-events-none absolute left-10 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-blue-300 sm:left-16" />
      <span className="pointer-events-none absolute left-8 bottom-32 h-3 w-3 rounded-full border-2 border-slate-300 sm:left-14" />

      <div className="pointer-events-none absolute bottom-40 right-8 grid grid-cols-3 gap-1.5 opacity-80 sm:bottom-48 sm:right-16">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-brand-navy/60" />
        ))}
      </div>

      <svg
        className="pointer-events-none absolute bottom-0 left-0 h-32 w-full sm:h-40"
        viewBox="0 0 1400 200"
        preserveAspectRatio="none"
      >
        <path
          d="M0,140 C350,195 750,80 1050,140 C1220,170 1320,150 1400,130 L1400,200 L0,200 Z"
          fill="#1e3a8a"
        />
        <path
          d="M650,175 C920,140 1150,170 1400,150 L1400,175 L650,175 Z"
          fill="#8bc53f"
        />
      </svg>

      <div className="animated-border-wrap group relative z-10 w-full max-w-5xl shadow-2xl">
        <div className="relative grid grid-cols-1 gap-6 rounded-3xl bg-white p-6 ring-1 ring-slate-100 transition-shadow duration-300 hover:shadow-[0_20px_60px_-15px_rgba(30,58,138,0.35)] sm:p-8 md:grid-cols-2 md:gap-10 md:p-9">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <span className="dashed-ring absolute inset-0 rounded-full border-2 border-dashed border-blue-200" />
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-navy to-blue-700 text-white shadow-lg shadow-blue-900/20">
                <Check size={24} strokeWidth={3} />
              </span>
            </div>

            <h2 className="mt-3 text-xl font-extrabold sm:text-2xl">
              <span className="text-brand-navy">Registration </span>
              <span className="text-brand-lime">Successful!</span>
            </h2>

            <div className="my-2 flex items-center justify-center gap-2">
              <span className="h-px w-14 bg-slate-200" />
              <span className="text-brand-lime text-sm">&#127807;</span>
              <span className="h-px w-14 bg-slate-200" />
            </div>

            <p className="text-sm leading-snug text-slate-500">
              Registration completed. A QR Pass has been sent to your email.
            </p>

            <p className="mt-3 text-xs text-slate-400">Thank you for registering!</p>
          </div>

          <div className="flex flex-col justify-center">
            <div className="rounded-2xl bg-slate-50 p-4 text-left">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="h-px w-10 bg-lime-200" />
                  <p className="text-brand-lime text-xs font-semibold tracking-wide">Registration ID</p>
                  <span className="h-px w-10 bg-lime-200" />
                </div>
                <p className="text-brand-lime mt-0.5 text-2xl font-extrabold tracking-wide">{registrationId}</p>
                <div className="mx-auto mt-2 mb-1 h-px w-full bg-slate-200" />
              </div>

              <DetailRow icon={UserRound} label="Name" value={fullName} />
              <DetailRow icon={Mail} label="Email" value={email} />
              {eventName && <DetailRow icon={CalendarDays} label="Event" value={eventName} />}
              {eventDate && <DetailRow icon={CalendarDays} label="Date" value={eventDate} last />}
            </div>

            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <button
                onClick={onViewQr}
                className="group/btn flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-navy to-blue-700 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-900/30 hover:brightness-110 active:scale-[0.98]"
              >
                <QrCode size={16} /> View QR Pass
                <ArrowRight size={16} className="transition-transform duration-300 group-hover/btn:translate-x-0.5" />
              </button>

              <button
                onClick={onReset}
                className="group/btn flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-600 transition-all duration-300 ease-out hover:scale-[1.02] hover:border-blue-200 hover:bg-slate-50 hover:text-brand-navy active:scale-[0.98]"
              >
                <RotateCcw size={16} className="transition-transform duration-500 group-hover/btn:rotate-180" /> Register Another
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, last }) {
  return (
    <div className={`flex items-center gap-3 py-2 ${!last ? 'border-b border-slate-200' : ''}`}>
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-brand-navy">
        <Icon size={14} />
      </span>
      <span className="w-16 flex-shrink-0 text-sm text-slate-500">{label}</span>
      <span className="text-sm text-slate-400">:</span>
      <span className="truncate text-sm font-semibold text-slate-800">{value}</span>
    </div>
  );
}