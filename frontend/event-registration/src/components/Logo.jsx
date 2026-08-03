import logo from '../assets/logo.png';

export default function Logo({ className = '' }) {
  return (
    <img
      src={logo}
      alt="Buoyant Media"
      className={`h-9 w-auto object-contain ${className}`}
    />
  );
}