const styles = {
  SENT: 'bg-emerald-50 text-emerald-600',
  PENDING: 'bg-amber-50 text-amber-600',
  FAILED: 'bg-red-50 text-red-600',
  checkedIn: 'bg-brand-sky text-brand-navy',
  notCheckedIn: 'bg-slate-100 text-slate-500',
};

export function EmailStatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] || styles.PENDING}`}>
      {status}
    </span>
  );
}

export function CheckInBadge({ checkedIn }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        checkedIn ? styles.checkedIn : styles.notCheckedIn
      }`}
    >
      {checkedIn ? 'Checked In' : 'Not Checked In'}
    </span>
  );
}