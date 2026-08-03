import { ShieldCheck, Users2, Leaf } from 'lucide-react';

const badges = [
  { icon: ShieldCheck, label: 'Secure', sub: 'Data Protection' },
  { icon: Users2, label: 'Trusted', sub: 'by Professionals' },
  { icon: Leaf, label: 'Building a', sub: 'Better Tomorrow' },
];

export default function TrustBadges({ className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-8 gap-y-3 ${className}`}>
      {badges.map(({ icon: Icon, label, sub }) => (
        <div key={label} className="flex items-center gap-2">
          <Icon size={18} className="flex-shrink-0 text-brand-teal" />
          <span className="text-xs leading-tight text-slate-600">
            <span className="block font-semibold text-brand-navyDark">{label}</span>
            <span className="block">{sub}</span>
          </span>
        </div>
      ))}
    </div>
  );
}