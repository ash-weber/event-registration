import TopBar from './TopBar';
import QuoteCard from './QuoteCard';
import ScanQrCard from './ScanQrCard';
import EventDetailsBar from './EventDetailsBar';
import heroBg from '../assets/hero-bg.png';

const layout = {
  topBar:       { left: '1.6%',  top: '1.5%',  width: '54%' },
  badge:        { left: '2.6%',  top: '15.6%', width: '20.8%' },
  heading:      { left: '2.6%',  top: '20%',   width: '28%' },
  eventBar:     { left: '2.6%',  top: '53.2%', width: '31.5%' },
  quote:        { left: '32%',   top: '19%',   width: '24%' },
  qr:           { left: '36.5%', top: '53.2%', width: '20.5%' },
  card:         { left: '58%',   top: '6%',    width: '38%',  height: '90%' },
};

function HeadingBlock({ line1, line2, line3 }) {
  return (
    <div>
      <p className="text-sm font-bold tracking-[0.3em] text-brand-navyDark">WELCOME TO</p>
      <h1 className="mt-1 flex flex-wrap items-baseline gap-x-3 text-2xl font-extrabold leading-none tracking-tight sm:text-3xl xl:text-4xl">
        <span className="text-brand-navyDark">{line1}</span>
        <span className="text-sky-500">{line2}</span>
        <span className="bg-gradient-to-r from-brand-navy via-sky-500 to-brand-lime bg-clip-text text-transparent">
          {line3}
        </span>
      </h1>
      <p className="mt-3 text-sm font-bold uppercase tracking-wide text-brand-navyDark">
        Shaping today, <br />
        building <span className="text-brand-lime">tomorrow.</span>
      </p>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Join industry leaders, innovators, and visionaries for an inspiring experience filled with
        knowledge, networking, and future-ready solutions.
      </p>
    </div>
  );
}

function Badge() {
  return (
    <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-semibold text-brand-navy shadow-sm ring-1 ring-white/60 backdrop-blur-sm sm:text-sm">
      <span>Innovate</span>
      <span className="text-brand-lime">&bull;</span>
      <span>Connect</span>
      <span className="text-brand-lime">&bull;</span>
      <span>Transform</span>
    </div>
  );
}

export default function HeroPanel({ children }) {
  const eventName = import.meta.env.VITE_EVENT_NAME || 'INTERIO & EXTERIO EXPO';
  const words = eventName.split(' ');
  const line1 = words[0] ?? '';
  const line2 = words.length > 2 ? words.slice(1, -1).join(' ') : words[1] ?? '';
  const line3 = words.length > 2 ? words[words.length - 1] : '';

  return (
    <div
      className="relative w-full overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="relative mx-auto hidden w-full max-w-[1536px] xl:block" style={{ aspectRatio: '1536 / 1024' }}>
        <div className="pointer-events-none absolute h-[9%] w-[4%] opacity-40" style={{ left: '96%', top: '9%', backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)', backgroundSize: '9px 9px' }} />
        <div className="pointer-events-none absolute h-[8%] w-[6%] opacity-20" style={{ left: '95%', top: '85%', backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '8px 8px' }} />

        <div className="absolute" style={layout.topBar}>
          <TopBar />
        </div>

        <div className="absolute" style={layout.badge}>
          <Badge />
        </div>

        <div className="absolute" style={layout.heading}>
          <HeadingBlock line1={line1} line2={line2} line3={line3} />
        </div>

        <div className="absolute" style={layout.eventBar}>
          <EventDetailsBar />
        </div>

        <div className="absolute" style={layout.quote}>
          <QuoteCard eventLabel={eventName} />
        </div>

        <div className="absolute" style={layout.qr}>
          <ScanQrCard />
        </div>

        <div className="absolute flex items-center justify-center" style={layout.card}>
          {children}
        </div>
      </div>

    
      <div className="flex w-full flex-col xl:hidden">
        <TopBar />

        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-7 sm:gap-10 sm:px-8 sm:py-10">
          <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
            <Badge />
            <HeadingBlock line1={line1} line2={line2} line3={line3} />
          </div>

        
          <div>
            <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-navy/60">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-lime" />
              Event Details
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <EventDetailsBar />
              <ScanQrCard />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-brand-navy/20" />
            <span className="flex-shrink-0 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-navy/60">
              Reserve your spot
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-brand-navy/20" />
          </div>

          <div className="flex justify-center">{children}</div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-navy/15 to-transparent" />

          <div className="pb-2">
            <QuoteCard eventLabel={eventName} />
          </div>
        </div>
      </div>
    </div>
  );
}