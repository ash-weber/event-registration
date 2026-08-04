import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Loader2,
  Inbox,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import api from '../api/axios';
import { EmailStatusBadge, CheckInBadge } from '../components/StatusBadge';
import VisitorDetailModal from '../components/VisitorDetailModal';

const LIMIT = 10;

const ALL_VISITORS_PAGE_SIZE = 100;

async function fetchAllVisitors(api) {
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

  return { all, total };
}

const NAVY = '#1a3a6e';
const GREEN = '#8bc53f';

const STATUS_OPTIONS = [
  { label: 'All Visitors', value: 'all', icon: Users, color: NAVY },
  { label: 'Checked In', value: 'checkedIn', icon: CheckCircle2, color: '#16a34a' },
  { label: 'Not Checked In', value: 'notCheckedIn', icon: XCircle, color: '#dc2626' },
  { label: 'Pending Email', value: 'pending', icon: Clock, color: '#d97706' },
];

export default function VisitorsListPage() {
  const [visitors, setVisitors] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeVisitorId, setActiveVisitorId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState(STATUS_OPTIONS[0]);
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef(null);

  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(null);
  const exportRef = useRef(null);

  
  const fetchVisitors = useCallback(async (opts) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/visitors', {
        params: {
          page: opts.page,
          limit: LIMIT,
          search: opts.search || undefined,
          status: opts.status && opts.status !== 'all' ? opts.status : undefined,
        },
      });
      setVisitors(res.data.data);
      setTotalPages(res.data.pagination.totalPages || 1);
      setTotal(res.data.pagination.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load visitors.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { all, total: totalVisitors } = await fetchAllVisitors(api);
      const checkedInCount = all.filter((v) => v.checkedIn).length;
      const pendingCount = all.filter((v) => v.emailStatus === 'PENDING').length;

      setStats({
        totalVisitors: { value: totalVisitors },
        thisEvent: { value: checkedInCount },
        pending: { value: pendingCount },
      });
    } catch {
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // debounce search
  useEffect(() => {
    const handle = setTimeout(() => {
      setPage(1);
      fetchVisitors({ page: 1, search, status: statusFilter.value });
    }, 400);
    return () => clearTimeout(handle);
  }, [search]);

  // refetch when page changes
  useEffect(() => {
    fetchVisitors({ page, search, status: statusFilter.value });
  }, [page]);

  // refetch (reset to page 1) whenever the status filter changes
  useEffect(() => {
    setPage(1);
    fetchVisitors({ page: 1, search, status: statusFilter.value });
  }, [statusFilter]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (statusRef.current && !statusRef.current.contains(e.target)) setStatusOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

 
  const visibleVisitors = visitors;

  const statCards = stats
    ? [
        {
          label: 'Total Visitors',
          value: stats.totalVisitors.value,
          icon: Users,
          bg: `${NAVY}14`,
          color: NAVY,
        },
        {
          label: 'Checked In',
          value: stats.thisEvent.value,
          icon: CheckCircle2,
          bg: `${GREEN}22`,
          color: '#5c9e1f',
        },
        {
          label: 'Pending Email',
          value: stats.pending.value,
          icon: Clock,
          bg: '#fef3c7',
          color: '#d97706',
        },
        {
          label: 'Not Checked In',
          value: Math.max(stats.totalVisitors.value - stats.thisEvent.value, 0),
          icon: XCircle,
          bg: '#fee2e2',
          color: '#dc2626',
        },
      ]
    : [];

  const pageNumbers = useMemo(() => {
    const pages = [];
    const push = (p) => pages.push(p);
    const windowSize = 1;

    push(1);
    if (page - windowSize > 2) push('…');
    for (let p = Math.max(2, page - windowSize); p <= Math.min(totalPages - 1, page + windowSize); p++) {
      push(p);
    }
    if (page + windowSize < totalPages - 1) push('…');
    if (totalPages > 1) push(totalPages);

    return pages;
  }, [page, totalPages]);

  // Format helpers: date + time split out so we can show an explicit
  // "Registration Time" column (e.g. "9:00 AM") alongside the date.
  function formatRegisteredDate(createdAt) {
    return new Date(createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }

  function formatRegisteredTime(createdAt) {
    return new Date(createdAt).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  async function handleDownload(id, e) {
    e.stopPropagation();
    setDownloadingId(id);
    try {
      const res = await api.get(`/admin/visitors/${id}`);
      const v = res.data.data;
      if (!v.qrCodeImage) return;
      const a = document.createElement('a');
      a.href = v.qrCodeImage;
      a.download = `${v.registrationId}-qr-pass.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
    } finally {
      setDownloadingId(null);
    }
  }

  
  async function handleExport(format) {
    setExporting(format);
    try {
      const res = await api.get('/admin/visitors/export', {
        params: {
          format,
          search: search || undefined,
          status: statusFilter.value !== 'all' ? statusFilter.value : undefined,
        },
        responseType: 'blob',
      });

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ext = format === 'excel' ? 'xlsx' : 'csv';
      a.href = url;
      a.download = `visitors-${new Date().toISOString().slice(0, 10)}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Export failed. Please try again.');
    } finally {
      setExporting(null);
      setExportOpen(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex-shrink-0">
        <h1 className="text-lg font-bold sm:text-xl" style={{ color: NAVY }}>
          Registered Visitors
        </h1>
        <p className="text-xs text-slate-400">
          Dashboard <span className="mx-1">›</span> Registered Visitors
        </p>
      </div>

      <div className="grid flex-shrink-0 grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {statsLoading && !stats
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex h-[64px] items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm sm:h-[72px]"
              >
                <Loader2 className="animate-spin" style={{ color: NAVY }} size={18} />
              </div>
            ))
          : statCards.map((card) => (
              <div
                key={card.label}
                className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-sm sm:gap-3 sm:px-4 sm:py-3"
              >
                <span
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10"
                  style={{ backgroundColor: card.bg, color: card.color }}
                >
                  <card.icon size={17} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[11px] text-slate-500 sm:text-xs">{card.label}</p>
                  <p className="text-lg font-bold leading-tight sm:text-xl" style={{ color: NAVY }}>
                    {card.value}
                  </p>
                </div>
              </div>
            ))}
      </div>

      <div className="flex flex-shrink-0 flex-col gap-2.5 rounded-t-xl border border-b-0 border-slate-100 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-lg lg:max-w-2xl">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, mobile, ID..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': `${GREEN}55` }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative" ref={statusRef}>
            <button
              type="button"
              onClick={() => setStatusOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg border bg-white py-2 pl-2.5 pr-3 text-xs font-semibold shadow-sm transition cursor-pointer"
              style={{ borderColor: statusOpen ? `${statusFilter.color}66` : '#e2e8f0' }}
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-md"
                style={{ backgroundColor: `${statusFilter.color}1a`, color: statusFilter.color }}
              >
                <statusFilter.icon size={13} />
              </span>
              <span className="text-slate-700">{statusFilter.label}</span>
              <ChevronDown
                size={13}
                className={`text-slate-400 transition-transform ${statusOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {statusOpen && (
              <div className="absolute left-0 z-30 mt-2 w-52 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                <p className="flex items-center gap-1.5 px-2 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  <SlidersHorizontal size={11} /> Filter by status
                </p>
                {STATUS_OPTIONS.map((opt) => {
                  const isActive = opt.value === statusFilter.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(opt);
                        setStatusOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-xs transition cursor-pointer"
                      style={isActive ? { backgroundColor: `${opt.color}14` } : undefined}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = '';
                      }}
                    >
                      <span
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
                        style={{ backgroundColor: `${opt.color}1a`, color: opt.color }}
                      >
                        <opt.icon size={14} />
                      </span>
                      <span
                        className="flex-1 font-medium"
                        style={{ color: isActive ? opt.color : '#475569' }}
                      >
                        {opt.label}
                      </span>
                      {isActive && <Check size={14} style={{ color: opt.color }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="relative" ref={exportRef}>
            <button
              type="button"
              onClick={() => setExportOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-white shadow-sm cursor-pointer"
              style={{ backgroundColor: NAVY }}
            >
              <Download size={13} />
              Export
              <ChevronDown size={13} />
            </button>
            {exportOpen && (
              <div className="absolute right-0 z-30 mt-2 w-44 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => handleExport('csv')}
                  disabled={exporting !== null}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                >
                  {exporting === 'csv' ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <FileText size={14} />
                  )}
                  Download as CSV
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('excel')}
                  disabled={exporting !== null}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                >
                  {exporting === 'excel' ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <FileSpreadsheet size={14} />
                  )}
                  Download as Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {statusFilter.value !== 'all' && (
        <div className="-mt-1 flex flex-shrink-0 items-center gap-2 sm:hidden">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ backgroundColor: `${statusFilter.color}14`, color: statusFilter.color }}
          >
            <statusFilter.icon size={12} />
            {statusFilter.label}
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter(STATUS_OPTIONS[0])}
            className="text-[11px] font-medium text-slate-400 underline cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-xl border border-slate-100 bg-white shadow-sm">
        <div className="min-h-0 flex-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loading && (
            <div className="py-10 text-center">
              <Loader2 className="mx-auto animate-spin" style={{ color: NAVY }} size={22} />
            </div>
          )}

          {!loading && error && (
            <p className="py-8 text-center text-sm text-red-500">{error}</p>
          )}

          {!loading && !error && visibleVisitors.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-400">
              <Inbox className="mx-auto mb-2" size={22} />
              No visitors found.
            </div>
          )}

          {!loading && !error && visibleVisitors.length > 0 && (
            <div className="divide-y divide-slate-100 sm:hidden">
              {visibleVisitors.map((v, idx) => (
                <div key={v.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate text-sm font-semibold" style={{ color: NAVY }}>
                        <span className="text-xs font-normal text-slate-400">
                          #{(page - 1) * LIMIT + idx + 1}
                        </span>
                        {v.fullName}
                      </p>
                      <p className="truncate text-xs text-slate-500">{v.email}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{v.mobileNumber}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {formatRegisteredDate(v.createdAt)} · {formatRegisteredTime(v.createdAt)}
                      </p>
                    </div>
                    <span className="flex-shrink-0 whitespace-nowrap text-[11px] font-medium text-slate-400">
                      {v.registrationId}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <EmailStatusBadge status={v.emailStatus} />
                      <CheckInBadge checkedIn={v.checkedIn} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveVisitorId(v.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border cursor-pointer"
                        style={{ borderColor: `${GREEN}88`, color: '#5c9e1f' }}
                        aria-label={`View ${v.fullName}`}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDownload(v.id, e)}
                        disabled={downloadingId === v.id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border disabled:opacity-50 cursor-pointer"
                        style={{ borderColor: `${NAVY}55`, color: NAVY }}
                        aria-label={`Download QR for ${v.fullName}`}
                      >
                        {downloadingId === v.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Download size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && visibleVisitors.length > 0 && (
            <div className="hidden overflow-x-auto sm:block [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-2.5 font-semibold">S.No</th>
                    <th className="px-4 py-2.5 font-semibold">ID</th>
                    <th className="px-4 py-2.5 font-semibold">Name</th>
                    <th className="px-4 py-2.5 font-semibold">Email</th>
                    <th className="px-4 py-2.5 font-semibold">Mobile</th>
                    <th className="px-4 py-2.5 font-semibold">Registered</th>
                    <th className="px-4 py-2.5 font-semibold">Reg. Time</th>
                    <th className="px-4 py-2.5 font-semibold">Email</th>
                    <th className="px-4 py-2.5 font-semibold">Check-in</th>
                    <th className="px-4 py-2.5 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleVisitors.map((v, idx) => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-2.5 text-xs text-slate-500">
                        {(page - 1) * LIMIT + idx + 1}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-xs font-medium" style={{ color: NAVY }}>
                        {v.registrationId}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-xs">{v.fullName}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-xs text-slate-500">{v.email}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-xs text-slate-500">{v.mobileNumber}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-xs text-slate-500">
                        {formatRegisteredDate(v.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-xs text-slate-500">
                        {formatRegisteredTime(v.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <EmailStatusBadge status={v.emailStatus} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <CheckInBadge checkedIn={v.checkedIn} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveVisitorId(v.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border cursor-pointer"
                            style={{ borderColor: `${GREEN}88`, color: '#5c9e1f' }}
                            aria-label={`View ${v.fullName}`}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDownload(v.id, e)}
                            disabled={downloadingId === v.id}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border disabled:opacity-50 cursor-pointer"
                            style={{ borderColor: `${NAVY}55`, color: NAVY }}
                            aria-label={`Download QR for ${v.fullName}`}
                          >
                            {downloadingId === v.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Download size={13} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex flex-shrink-0 flex-col gap-2 border-t border-slate-100 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-slate-500">
            Showing {visitors.length === 0 ? 0 : (page - 1) * LIMIT + 1} to{' '}
            {Math.min(page * LIMIT, total)} of {total} entries
          </p>

          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>

            {pageNumbers.map((p, idx) =>
              p === '…' ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-xs text-slate-400">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold transition cursor-pointer"
                  style={
                    p === page
                      ? { backgroundColor: NAVY, color: '#fff' }
                      : { border: '1px solid #e2e8f0', color: '#475569' }
                  }
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {activeVisitorId && (
        <VisitorDetailModal visitorId={activeVisitorId} onClose={() => setActiveVisitorId(null)} />
      )}
    </div>
  );
}