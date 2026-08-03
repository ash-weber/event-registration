export default function QuoteCard({ eventLabel = 'Build Intec 2026' }) {
  return (
    <div className="relative rounded-2xl border border-sky-200 bg-white/70 px-6 py-5 shadow-sm backdrop-blur-sm sm:px-7 sm:py-6">
      <span className="absolute -left-1 -top-3 font-serif text-5xl leading-none text-brand-navy/25 sm:text-6xl">
        &ldquo;
      </span>
      <p className="text-center text-lg font-bold leading-snug text-brand-navyDark sm:text-xl">
        Every landmark <br className="hidden sm:block" />
        begins with a <span className="text-sky-500">vision</span>.
      </p>
      <span className="mx-auto mt-2 block h-0.5 w-10 rounded-full bg-brand-lime" />
      <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">
        Welcome to <span className="font-semibold text-brand-navy">{eventLabel}</span> &mdash; where ideas
        become structures, connections become opportunities, and innovation becomes{' '}
        <span className="font-semibold text-brand-lime">the future</span>.
      </p>
      <span className="absolute -bottom-4 -right-1 font-serif text-5xl leading-none text-brand-navy/25 sm:text-6xl">
        &rdquo;
      </span>
    </div>
  );
}