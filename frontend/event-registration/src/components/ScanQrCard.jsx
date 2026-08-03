import { Smartphone } from 'lucide-react';
import qrCode from '../assets/qr-register.png';

export default function ScanQrCard() {
  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy via-brand-navy to-brand-lime shadow-lg">
      <div className="relative p-4">
        <div
          className="pointer-events-none absolute right-3 top-3 h-10 w-14 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '6px 6px',
          }}
        />

        <div className="relative rounded-lg border-2 border-dashed border-brand-lime/70 bg-white p-3">
          <img
            src={qrCode}
            alt="QR code to register"
            width={140}
            height={140}
            className="mx-auto h-[150px] w-[150px] object-contain"
          />
        </div>
      </div>

      <span className="mx-4 block h-px bg-white/20" />

      <div className="flex flex-col items-center justify-center gap-1 px-5 py-3.5">
        <Smartphone size={18} className="text-brand-lime" />
        <p className="text-center text-xs font-bold leading-tight text-white">
          SCAN TO
          <br />
          <span className="text-brand-lime">REGISTER</span>
        </p>
      </div>
    </div>
  );
}