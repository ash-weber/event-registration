import Logo from './Logo';
import PartnerLogos from './PartnerLogos';

export default function TopBar() {
  return (
    <div
      className="relative flex w-full flex-col items-center gap-4 bg-white/95 px-5 py-4 shadow-xl ring-1 ring-white/70 backdrop-blur-sm sm:px-7 sm:py-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-9 lg:py-6"
      style={{
        clipPath:
          'polygon(0 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%)',
        borderRadius: '1.5rem',
      }}
    >
      <span className="absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-brand-navy via-sky-400 to-brand-lime" />

      <span className="pointer-events-none absolute bottom-0 right-0 h-[18px] w-[18px] bg-gradient-to-br from-brand-lime to-sky-500" />

      <Logo className="h-10 sm:h-12 xl:h-16" />

      <span className="hidden h-12 w-px flex-shrink-0 bg-gradient-to-b from-transparent via-slate-300 to-transparent lg:block xl:h-14" />
      <span className="h-px w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent lg:hidden" />

      <PartnerLogos className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 [&_img]:h-8 sm:[&_img]:h-9 lg:[&_img]:h-11 xl:[&_img]:h-12" />
    </div>
  );
}