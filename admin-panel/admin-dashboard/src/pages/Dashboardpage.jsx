import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Users,
  CheckCircle2,
  QrCode,
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

  const tableScrollRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const [isDragging, setIsDragging] = useState(false);

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

  const handleTableWheel = useCallback((e) => {
    const el = tableScrollRef.current;
    if (!el) return;
    if (el.scrollWidth <= el.clientWidth) return;
    e.preventDefault();
    e.stopPropagation();
    el.scrollLeft += e.deltaY !== 0 ? e.deltaY : e.deltaX;
  }, []);

  const handleTableMouseDown = useCallback((e) => {
    const el = tableScrollRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = { x: e.pageX, scrollLeft: el.scrollLeft };
  }, []);

  const handleTableMouseMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    const el = tableScrollRef.current;
    if (!el) return;
    e.preventDefault();
    const dx = e.pageX - dragStartRef.current.x;
    el.scrollLeft = dragStartRef.current.scrollLeft - dx;
  }, []);

  const stopTableDrag = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  const todayKey = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();
  const todayCount = chartData.find((d) => d.date === todayKey)?.count ?? 0;

  // "Pending" card removed as requested — only 3 cards now.
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
      ]
    : [];

  return (
    <div>
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 xs:grid-cols-3 sm:grid-cols-3">
        {loading && !stats
          ? Array.from({ length: 3 }).map((_, i) => (
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
          <div className="px-4 pb-1 pt-0 sm:px-6">
           
            <div
              ref={tableScrollRef}
              onWheel={handleTableWheel}
              onMouseDown={handleTableMouseDown}
              onMouseMove={handleTableMouseMove}
              onMouseUp={stopTableDrag}
              onMouseLeave={stopTableDrag}
              style={{ overscrollBehavior: 'contain', touchAction: 'pan-x pan-y', maxHeight: '420px' }}
              className={`hidden overflow-auto rounded-lg border border-slate-100 sm:block
                [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-100
                [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300
                hover:[&::-webkit-scrollbar-thumb]:bg-slate-400
                [scrollbar-width:thin] [scrollbar-color:#cbd5e1_#f1f5f9]
                ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
            >
              <table className="border-separate text-left text-sm" style={{ width: 'max-content', minWidth: '100%', borderSpacing: 0 }}>
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-white">
                    <th className="sticky top-0 z-20 border-b-2 px-5 py-3.5 font-semibold sm:px-6" style={{ backgroundColor: '#1a3a6e', borderColor: '#0f2650' }}>ID</th>
                    <th className="sticky top-0 z-20 border-b-2 px-5 py-3.5 font-semibold sm:px-6" style={{ backgroundColor: '#1a3a6e', borderColor: '#0f2650' }}>Name</th>
                    <th className="sticky top-0 z-20 border-b-2 px-5 py-3.5 font-semibold sm:px-6" style={{ backgroundColor: '#1a3a6e', borderColor: '#0f2650' }}>Email</th>
                    <th className="sticky top-0 z-20 border-b-2 px-5 py-3.5 font-semibold sm:px-6" style={{ backgroundColor: '#1a3a6e', borderColor: '#0f2650' }}>Mobile</th>
                    <th className="sticky top-0 z-20 border-b-2 px-5 py-3.5 font-semibold sm:px-6" style={{ backgroundColor: '#1a3a6e', borderColor: '#0f2650' }}>Date</th>
                    <th className="sticky top-0 z-20 border-b-2 px-5 py-3.5 font-semibold sm:px-6" style={{ backgroundColor: '#1a3a6e', borderColor: '#0f2650' }}>QR Status</th>
                    <th className="sticky top-0 z-20 border-b-2 px-5 py-3.5 font-semibold sm:px-6" style={{ backgroundColor: '#1a3a6e', borderColor: '#0f2650' }}>Status</th>
                    <th className="sticky top-0 z-20 border-b-2 px-5 py-3.5 font-semibold sm:px-6" style={{ backgroundColor: '#1a3a6e', borderColor: '#0f2650' }}>Action</th>
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
          </div>
        )}
        {!loading && recent.length > 0 && <div className="h-3 sm:h-1" />}
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