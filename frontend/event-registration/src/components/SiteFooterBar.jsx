import { Phone, Globe, Facebook, Linkedin, Instagram, Youtube } from 'lucide-react';

const socials = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
];

export default function SiteFooterBar({
  tollFree = '8288-8288-71',
  websites = ['www.alfence.net', 'www.kventerprises.net'],
}) {
  return (
    <div className="relative z-10 flex w-full flex-col items-center justify-between gap-3 bg-brand-navyDark px-6 py-3 text-white sm:flex-row sm:px-10">
      <div className="flex items-center gap-2 text-sm">
        <Phone size={16} className="text-brand-lime" />
        <div className="leading-tight">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/70">Toll free</p>
          <p className="font-bold">{tollFree}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <Globe size={16} className="text-brand-lime" />
        <div className="leading-tight">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/70">Websites</p>
          <p className="flex flex-wrap gap-x-2 font-semibold">
            {websites.map((site) => (
              <span key={site}>{site}</span>
            ))}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-white/70">Follow us</span>
        <div className="flex items-center gap-2">
          {socials.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition hover:bg-brand-lime hover:text-brand-navyDark"
            >
              <Icon size={14} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}