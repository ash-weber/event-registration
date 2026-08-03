import ciconLogo from '../assets/Cicon logo.png';
import interioLogo from '../assets/Interio Logo.png';

export default function PartnerLogos() {
  return (
    <div className="flex flex-shrink-0 items-center gap-4 sm:gap-6">
      <img
        src={ciconLogo}
        alt="CICON 2026 Civil Expo"
        className="h-14 w-auto object-contain sm:h-16"
      />

      <span className="h-10 w-px flex-shrink-0 bg-slate-300 sm:h-12" />

      <img
        src={interioLogo}
        alt="Interio & Exterio Expo 2026, 13th Edition"
        className="h-14 w-auto object-contain sm:h-16"
      />
    </div>
  );
}