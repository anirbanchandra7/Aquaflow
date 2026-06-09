import { titleCase } from '../utils/format.js';

const COLORS = {
  // green
  active: 'bg-green-100 text-green-700',
  resolved: 'bg-green-100 text-green-700',
  delivered: 'bg-green-100 text-green-700',
  // amber
  in_progress: 'bg-amber-100 text-amber-700',
  pending: 'bg-amber-100 text-amber-700',
  assigned: 'bg-amber-100 text-amber-700',
  in_transit: 'bg-amber-100 text-amber-700',
  // red
  inactive: 'bg-red-100 text-red-700',
  open: 'bg-red-100 text-red-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function StatusBadge({ status }) {
  const color = COLORS[status] || 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {titleCase(status) || '—'}
    </span>
  );
}
