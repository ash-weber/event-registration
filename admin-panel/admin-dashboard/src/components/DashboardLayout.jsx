import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Users,
  CalendarDays,
  ScanLine,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const NAVY = '#1a3a6e';
const NAVY_DARK = '#0f2650';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid },
  { to: '/visitors', label: 'Registered Visitors', icon: Users },
  { to: '/checkin', label: 'QR Passes', icon: ScanLine },
];

const RANGE_OPTIONS = [
  { label: 'Last 7 Days', value: 7 },
  { label: 'Last 14 Days', value: 14 },
  { label: 'Last 30 Days', value: 30 },
];

export default function DashboardLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [rangeDays, setRangeDays] = useState(30);

  const isDashboard = location.pathname === '/';
  const currentTitle = navItems.find((n) => n.to === location.pathname)?.label || 'Dashboard';

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
   
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="hidden h-full w-64 flex-shrink-0 lg:flex xl:w-72">
        <SidebarContent onLogout={handleLogout} admin={admin} />
      </aside>

     
      <div
        className={`fixed inset-0 z-40 lg:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={`relative z-50 flex h-full w-[78%] max-w-72 transform flex-col shadow-2xl transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarContent
            onLogout={handleLogout}
            onNavigate={() => setMobileOpen(false)}
            onClose={() => setMobileOpen(false)}
            admin={admin}
          />
        </aside>
      </div>

      <div className="flex h-full min-w-0 flex-1 flex-col">
        <header className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-50 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-[#152a63] sm:text-lg lg:text-2xl">
                {currentTitle}
              </h1>
              <span className="hidden h-0.5 w-8 rounded-full bg-[#8bc53f] lg:block" />
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3 lg:gap-4">
            {isDashboard && <DateRangePicker value={rangeDays} onChange={setRangeDays} />}

            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 shadow-sm">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#1a3a6e] to-[#2f5aa8] text-sm font-semibold text-white">
                {admin?.name?.[0]?.toUpperCase() || 'A'}
              </span>
              <span className="hidden text-sm font-semibold text-slate-700 sm:block">
                {admin?.name || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:p-6 lg:p-8">
          <Outlet context={{ rangeDays }} />
        </main>
      </div>
    </div>
  );
}

function DateRangePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = RANGE_OPTIONS.find((opt) => opt.value === value) || RANGE_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-600 shadow-sm hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 sm:gap-2 sm:px-3"
      >
        <CalendarDays size={16} className="text-slate-400" />
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`block w-full px-3 py-2 text-left text-sm ${
                opt.value === value
                  ? 'bg-[#eef2ff] font-medium text-[#1e3a8a]'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarContent({ onLogout, onNavigate, onClose, admin }) {
  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ backgroundImage: `linear-gradient(160deg, ${NAVY} 0%, ${NAVY_DARK} 78%)` }}
    >
      
      <SidebarDotGrid className="pointer-events-none absolute -right-3 top-16 text-white/10" rows={6} cols={4} gap={8} dotSize={3} />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[#8bc53f]/10 blur-3xl" />

      {/* Logo */}
      <div className="relative flex flex-shrink-0 items-center justify-between px-6 py-6">
        <div className="rounded-lg bg-white/95 px-3 py-2 shadow-md">
          <img src={logo} alt="Buoyant Events" className="h-9 w-auto object-contain" />
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="relative mx-6 mb-2 h-px bg-white/10" />

   
      <nav className="relative flex-shrink-0 space-y-1 px-3 py-3">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
          Navigate
        </p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-lg py-2.5 pl-4 pr-3 text-sm font-medium transition-colors ${
                isActive ? 'bg-white/[0.07] text-white' : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full transition-all ${
                    isActive ? 'bg-[#8bc53f]' : 'bg-transparent'
                  }`}
                />
                <span
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md transition-colors ${
                    isActive ? 'bg-[#8bc53f] text-[#12264d]' : 'bg-white/5 text-white/70 group-hover:bg-white/10'
                  }`}
                >
                  <Icon size={16} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="relative min-h-0 flex-1" />

      <div className="relative mx-4 mb-3 flex items-center gap-3 rounded-xl bg-white/[0.06] px-3 py-3">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#8bc53f] text-sm font-bold text-[#12264d]">
          {admin?.name?.[0]?.toUpperCase() || 'A'}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{admin?.name || 'Admin'}</p>
          <p className="truncate text-xs text-white/50">{admin?.email || 'Administrator'}</p>
        </div>
      </div>

      <div className="relative px-4 pb-6">
        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/95 px-3 py-2.5 text-sm font-medium text-red-500 shadow-sm backdrop-blur hover:bg-white"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  );
}

function SidebarDotGrid({ className = '', rows = 4, cols = 4, gap = 6, dotSize = 3 }) {
  const dots = Array.from({ length: rows * cols });
  return (
    <div
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${cols}, ${dotSize}px)`,
        gap: `${gap}px`,
      }}
    >
      {dots.map((_, i) => (
        <span key={i} className="rounded-full bg-current" style={{ width: dotSize, height: dotSize }} />
      ))}
    </div>
  );
}