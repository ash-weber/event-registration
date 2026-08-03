import { X, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export default function ImportResultModal({ result, onClose }) {
  const {
    totalRows,
    insertedCount,
    skippedCount,
    failedCount,
    skipped = [],
    failed = [],
  } = result;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-brand-navyDark">Import Summary</h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-emerald-50 p-3">
              <CheckCircle2 className="mx-auto mb-1 text-emerald-500" size={18} />
              <p className="text-lg font-bold text-emerald-600">{insertedCount}</p>
              <p className="text-[11px] text-slate-500">Added</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3">
              <AlertTriangle className="mx-auto mb-1 text-amber-500" size={18} />
              <p className="text-lg font-bold text-amber-600">{skippedCount}</p>
              <p className="text-[11px] text-slate-500">Skipped</p>
            </div>
            <div className="rounded-xl bg-red-50 p-3">
              <XCircle className="mx-auto mb-1 text-red-500" size={18} />
              <p className="text-lg font-bold text-red-600">{failedCount}</p>
              <p className="text-[11px] text-slate-500">Failed</p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400">{totalRows} row(s) processed in total.</p>

          {skipped.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-600">Skipped rows</p>
              <ul className="max-h-32 space-y-1 overflow-y-auto rounded-lg bg-amber-50/60 p-2 text-[11px] text-amber-700">
                {skipped.map((s, i) => (
                  <li key={i}>Row {s.row}: {s.reason}</li>
                ))}
              </ul>
            </div>
          )}

          {failed.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-600">Failed rows</p>
              <ul className="max-h-32 space-y-1 overflow-y-auto rounded-lg bg-red-50/60 p-2 text-[11px] text-red-700">
                {failed.map((f, i) => (
                  <li key={i}>Row {f.row}: {f.reason}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full rounded-lg bg-brand-navy py-2.5 text-sm font-semibold text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}