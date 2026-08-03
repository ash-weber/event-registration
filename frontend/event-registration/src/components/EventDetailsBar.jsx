import { CalendarDays, Clock, MapPin } from 'lucide-react';

export default function EventDetailsBar({
  dateRange = { label: 'AUGUST', value: '7,8 &9 2026' },
  venue = { label: 'CODISSIA,', value: 'COIMBATORE.' },
}) {
  const items = [
    { icon: CalendarDays, ...dateRange, accent: 'from-sky-400 to-sky-600' },
    { icon: MapPin, ...venue, accent: 'from-brand-navy to-sky-500' },
  ];

  return (
   
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-lg backdrop-blur-md">
      <div className="flex flex-1 flex-col justify-center divide-y divide-slate-200/70 px-4 py-1.5">
        {items.map(({ icon: Icon, label, value, accent }) => (
          <div
            key={label}
            className="group flex items-center gap-3.5 py-3 transition-transform duration-300 hover:translate-x-1"
          >
            <span
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-md shadow-sky-900/10 transition-transform duration-300 group-hover:scale-105`}
            >
              <Icon size={17} />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-wider text-sky-600 sm:text-xs">
              {label}
              <br />
              <span className="text-sm font-extrabold normal-case tracking-normal text-brand-navyDark sm:text-base">
                {value}
              </span>
            </p>
          </div>
        ))}
      </div>
      <div className="h-1 w-full flex-shrink-0 bg-gradient-to-r from-brand-navy via-sky-400 to-brand-lime" />
    </div>
  );
}