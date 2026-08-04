import { useEffect, useState } from 'react';
import {
  Users,
  CheckCircle2,
  QrCode,
  Clock,
  ArrowRight,
  Loader2,
  Eye,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Link, useOutletContext } from 'react-router-dom';
import api from '../api/axios';
import { EmailStatusBadge, CheckInBadge } from '../components/StatusBadge';

const ALL_VISITORS_PAGE_SIZE = 100;

async function fetchAllVisitors() {
  let page = 1;
  let all = [];
  let total = Infinity;

  while (all.length < total) {
    const res = await api.get('/admin/visitors', {
      params: { page, limit: ALL_VISITORS_PAGE_SIZE },
    });
    const batch = res.data.data || [];
    all = all.concat(batch);
    total = res.data.pagination?.total ?? all.length;
    if (batch.length === 0) break;
    page += 1;
  }

  return all;
}

export default function DashboardPage() {
 
  const { rangeDays } = useOutletContext();
  const [stats, setStats] = useState(null);
 
  const [checkedInCount, setCheckedInCount] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    Promise.all([
      api.get('/admin/dashboard/stats'),
      api.get('/admin/dashboard/registrations-over-time', { params: { days: rangeDays } }),
      api.get('/admin/dashboard/recent', { params: { limit: 5 } }),
      fetchAllVisitors(),
    ])
      .then(([statsRes, chartRes, recentRes, allVisitors]) => {
        if (!active) return;
        setStats(statsRes.data.data);
        setChartData(chartRes.data.data);
        setRecent(recentRes.data.data);
        setCheckedInCount(allVisitors.filter((v) => v.checkedIn).length);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Failed to load dashboard.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [rangeDays]);

  const todayKey = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();
  const todayCount = chartData.find((d) => d.date === todayKey)?.count ?? 0;

  const statCards = stats && checkedInCount !== null
    ? [
        {
          label: 'Total Visitors',
          value: stats.totalVisitors.value,
          change: stats.totalVisitors.change,
          icon: Users,
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-500',
        },
        {
          label: 'Checked In',
          value: checkedInCount,
          change: null,
          icon: CheckCircle2,
          iconBg: 'bg-emerald-50',
          iconColor: 'text-emerald-500',
        },
        {
          label: 'QR Sent',
          value: stats.qrSent.value,
          change: stats.qrSent.change,
          icon: QrCode,
          iconBg: 'bg-amber-50',
          iconColor: 'text-amber-500',
        },
        {
          label: 'Pending',
          value: stats.pending.value,
          change: stats.pending.change,
          icon: Clock,
          iconBg: 'bg-violet-50',
          iconColor: 'text-violet-500',
        },
      ]
    : [];

  return (
    <div>
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        {loading && !stats
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex h-[104px] items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <Loader2 className="animate-spin text-brand-navy" size={22} />
              </div>
            ))
          : statCards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 ${card.iconBg} ${card.iconColor}`}
                  >
                    <card.icon size={20} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-500">{card.label}</p>
                    <p className="text-xl font-bold text-brand-navyDark sm:text-2xl">{card.value}</p>
                  </div>
                </div>
                {card.change !== null && (
                  <p
                    className={`mt-3 text-xs font-medium ${
                      card.change >= 0 ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {card.change >= 0 ? '+' : ''}
                    {card.change}% <span className="font-normal text-slate-400">from last {rangeDays} days</span>
                  </p>
                )}
              </div>
            ))}
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="h-5 w-1 rounded-full bg-[#8bc53f]" />
            <h2 className="text-base font-bold text-brand-navyDark sm:text-lg">Registrations Over Time</h2>
          </div>
          {!loading && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-semibold text-[#1e3a8a]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2f6fed]" />
              Today ({new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}): {todayCount} registered
            </span>
          )}
        </div>

        <div className="h-56 w-full sm:h-64 lg:h-72">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="animate-spin text-brand-navy" size={26} />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2f6fed" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#2f6fed" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#eef2f7" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  padding={{ left: 10, right: 10 }}
                  interval={chartData.length > 10 ? Math.ceil(chartData.length / 8) - 1 : 0}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                  }}
                  labelStyle={{ color: '#152a63', fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Registrations"
                  stroke="#2f6fed"
                  strokeWidth={3}
                  fill="url(#regGradient)"
                  dot={(props) => <ChartDot {...props} todayKey={todayKey} />}
                  activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="h-5 w-1 rounded-full bg-[#8bc53f]" />
            <h2 className="text-base font-bold text-brand-navyDark sm:text-lg">Recent Registrations</h2>
          </div>
          <Link
            to="/visitors"
            className="flex items-center gap-1 text-sm font-medium text-brand-navy hover:underline"
          >
            View all <ArrowRight size={15} />
          </Link>
        </div>

        {loading && (
          <div className="py-14 text-center">
            <Loader2 className="mx-auto animate-spin text-brand-navy" size={24} />
          </div>
        )}

        {!loading && recent.length === 0 && (
          <p className="py-14 text-center text-sm text-slate-400">No registrations yet.</p>
        )}

        {!loading && recent.length > 0 && (
          <div className="divide-y divide-slate-100 sm:hidden">
            {recent.map((v) => (
              <Link
                to="/visitors"
                key={v.id}
                className="flex items-start justify-between gap-3 px-4 py-3.5 active:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-brand-navy">{v.fullName}</p>
                  <p className="truncate text-xs text-slate-500">{v.email}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{v.mobileNumber}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <EmailStatusBadge status={v.emailStatus} />
                    <CheckInBadge checkedIn={v.checkedIn} />
                  </div>
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-2">
                  <span className="whitespace-nowrap text-[11px] text-slate-400">
                    {new Date(v.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                  <Eye size={16} className="text-slate-300" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && recent.length > 0 && (
          <div className="hidden overflow-x-auto sm:block [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-y border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-semibold sm:px-6">ID</th>
                  <th className="px-5 py-3 font-semibold sm:px-6">Name</th>
                  <th className="px-5 py-3 font-semibold sm:px-6">Email</th>
                  <th className="px-5 py-3 font-semibold sm:px-6">Mobile</th>
                  <th className="px-5 py-3 font-semibold sm:px-6">Date</th>
                  <th className="px-5 py-3 font-semibold sm:px-6">QR Status</th>
                  <th className="px-5 py-3 font-semibold sm:px-6">Status</th>
                  <th className="px-5 py-3 font-semibold sm:px-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-brand-navy sm:px-6">
                      {v.registrationId}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 sm:px-6">{v.fullName}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-500 sm:px-6">{v.email}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-500 sm:px-6">{v.mobileNumber}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-500 sm:px-6">
                      {new Date(v.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                      <EmailStatusBadge status={v.emailStatus} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                      <CheckInBadge checkedIn={v.checkedIn} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 sm:px-6">
                      <Link
                        to="/visitors"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-brand-navy"
                        aria-label={`View ${v.fullName}`}
                      >
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


function ChartDot({ cx, cy, payload, todayKey }) {
  if (!payload) return null;
  const isToday = payload.date === todayKey;

  if (isToday) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={7} fill="#152a63" stroke="#fff" strokeWidth={2} />
        <text
          x={cx}
          y={cy - 14}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill="#152a63"
        >
          Today
        </text>
      </g>
    );
  }

  return <circle cx={cx} cy={cy} r={5} fill="#2f6fed" stroke="#fff" strokeWidth={2} />;
}