import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  User,
  Users,
  BarChart3,
  QrCode,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const NAVY = '#1a3a6e';
const GREEN = '#8bc53f';
const REMEMBER_KEY = 'ems_remembered_username';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/visitors';

  const [form, setForm] = useState({ username: '', password: '' });
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0); 
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  useEffect(() => {
    const savedUsername = localStorage.getItem(REMEMBER_KEY);
    if (savedUsername) {
      setForm((f) => ({ ...f, username: savedUsername }));
      setRemember(true);
    }
  }, []);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (cooldown > 0) return;
    if (!form.username || !form.password) {
      setError('Please enter both your username and password.');
      return;
    }
    setSubmitting(true);
    try {
      await login(form.username, form.password, remember);

      if (remember) {
        localStorage.setItem(REMEMBER_KEY, form.username);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      if (err.response?.status === 429) {
        const retryAfter = Number(err.response.headers?.['retry-after']);
        setCooldown(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 30);
        setError('Too many attempts. Please wait before trying again.');
      } else {
        setError(err.response?.data?.message || 'Invalid username or password.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const features = [
    {
      icon: <QrCode size={22} />,
      title: 'QR Pass System',
      description: 'Generate and download secure QR passes for registered attendees.',
    },
    {
      icon: <BarChart3 size={22} />,
      title: 'Real-time Analytics',
      description: 'Track registrations, check-ins and event performance in real-time.',
    },
    {
      icon: <Users size={22} />,
      title: 'Visitor Management',
      description: 'Manage attendees, view reports and export data with ease.',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f8f2]">
      <style>{`
        @property --ems-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        .ems-border-frame {
          position: relative;
          border-radius: 1.25rem;
          padding: 2px;
          background: conic-gradient(
            from var(--ems-angle),
            ${NAVY} 0deg,
            ${GREEN} 100deg,
            ${NAVY} 220deg,
            ${GREEN} 320deg,
            ${NAVY} 360deg
          );
          animation: ems-rotate 6s linear infinite, ems-glow 3.5s ease-in-out infinite;
        }
        @keyframes ems-rotate {
          to { --ems-angle: 360deg; }
        }
        @keyframes ems-glow {
          0%, 100% { box-shadow: 0 0 22px rgba(26, 58, 110, 0.25), 0 0 0 rgba(139,197,63,0); }
          50% { box-shadow: 0 0 36px rgba(139, 197, 63, 0.35), 0 0 14px rgba(26,58,110,0.2); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ems-border-frame { animation: none; }
        }
      `}</style>

      <DotGrid className="absolute right-6 top-6 hidden text-[#c6d6c1] sm:grid" rows={5} cols={5} gap={7} dotSize={4} />

      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#1a3a6e]/10 blur-3xl" />
      <div className="pointer-events-none absolute -top-24 right-1/3 h-64 w-64 rounded-full bg-[#8bc53f]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-[#1a3a6e]/10 blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-10 lg:flex-row lg:items-center lg:gap-8 lg:px-10 lg:py-16 xl:gap-12">
        <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:w-1/3 lg:items-start lg:text-left">
          <span
            className="inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ borderColor: `${NAVY}33`, color: NAVY }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: GREEN }} />
            Event Management System
          </span>

          <h1
            className="mt-5 text-3xl font-extrabold leading-[1.15] sm:text-4xl lg:text-[2.4rem] xl:text-5xl"
            style={{ color: NAVY }}
          >
            Every event,
            <br />
            under{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(90deg, ${NAVY}, ${GREEN})` }}
            >
              one badge.
            </span>
          </h1>
          <div className="mt-4 h-1 w-12 rounded-full" style={{ backgroundColor: GREEN }} />

          <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-500 lg:max-w-none">
            Streamline registrations, manage attendees and create impactful event experiences.
          </p>

          <div className="mt-8 flex w-full max-w-xs items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-shadow duration-300 hover:shadow-md lg:max-w-none">
            <span
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${GREEN}22`, color: NAVY }}
            >
              <ShieldCheck size={20} />
            </span>
            <div className="text-left">
              <p className="text-sm font-bold" style={{ color: NAVY }}>
                Secure &amp; Reliable
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                Your data is protected with enterprise-grade security.
              </p>
            </div>
          </div>

          <DotGrid className="mt-10 hidden text-[#c6d6c1] lg:grid" rows={4} cols={4} gap={7} dotSize={4} />
        </div>

        <div className="order-1 flex justify-center lg:order-2 lg:w-1/3">
          <div className="ems-border-frame w-full max-w-sm">
            <div className="w-full rounded-[1.1rem] bg-white p-6 sm:p-9">
              <div className="flex flex-col items-center text-center">
                <div className="origin-center scale-100 transform sm:scale-110">
                  <Logo />
                </div>

                <div className="mt-5 flex w-full items-center gap-3">
                  <span className="h-px flex-1 bg-slate-200" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: NAVY }}>
                    Staff Access
                  </span>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>

                <h2 className="mt-3 text-xl font-bold sm:text-2xl" style={{ color: NAVY }}>
                  Admin Login
                </h2>
                <p className="mt-1 text-sm text-slate-500">Please sign in to continue</p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
                <div>
                  <div className="relative">
                    <span
                      className="pointer-events-none absolute inset-y-0 left-3 flex items-center"
                      style={{ color: NAVY }}
                    >
                      <User size={18} />
                    </span>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      aria-label="Username"
                      className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-3 text-base text-slate-700 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 sm:text-sm"
                      style={{ '--tw-ring-color': `${GREEN}55` }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = NAVY)}
                      onBlur={(e) => (e.currentTarget.style.borderColor = '')}
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <span
                      className="pointer-events-none absolute inset-y-0 left-3 flex items-center"
                      style={{ color: NAVY }}
                    >
                      <Lock size={18} />
                    </span>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      aria-label="Password"
                      className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-10 text-base text-slate-700 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 sm:text-sm"
                      style={{ '--tw-ring-color': `${GREEN}55` }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = NAVY)}
                      onBlur={(e) => (e.currentTarget.style.borderColor = '')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <label className="flex select-none items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 focus:ring-2"
                    style={{ accentColor: NAVY }}
                  />
                  Remember me
                </label>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting || cooldown > 0}
                  className="flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-semibold text-white shadow-md transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 sm:py-3"
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${NAVY}, #14294f)`,
                    boxShadow: `0 10px 20px -8px ${NAVY}66`,
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Signing in...
                    </>
                  ) : cooldown > 0 ? (
                    <>Try again in {cooldown}s</>
                  ) : (
                    <>
                      <Lock size={16} /> Login
                    </>
                  )}
                </button>

                <div className="flex items-center gap-3 pt-1">
                  <span className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs text-slate-400">Secure Access</span>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>

                <div
                  className="flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium"
                  style={{ backgroundColor: `${GREEN}1a`, color: NAVY }}
                >
                  <ShieldCheck size={16} />
                  Authorized personnel only
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="order-3 lg:w-1/3">
          <div className="mx-auto max-w-sm lg:mx-0 lg:max-w-none">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: NAVY }}>
              System Features
            </span>
            <div className="mt-2 h-1 w-10 rounded-full" style={{ backgroundColor: GREEN }} />

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="flex items-start gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 12px 24px -10px ${NAVY}33`)}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '')}
                >
                  <span
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${GREEN}22`, color: NAVY }}
                  >
                    {f.icon}
                  </span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: NAVY }}>
                      {f.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="relative z-10 pb-8 text-center text-xs text-slate-400">
        © 2026 Event Registration System. All rights reserved.
      </p>
    </div>
  );
}

function DotGrid({ className = '', rows = 4, cols = 4, gap = 6, dotSize = 4 }) {
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
        <span
          key={i}
          className="rounded-full bg-current"
          style={{ width: dotSize, height: dotSize }}
        />
      ))}
    </div>
  );
}