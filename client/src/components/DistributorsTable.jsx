import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import { formatDate } from '../utils/format.js';

/** Shared distributor table (dashboard + distributors page). */
export default function DistributorsTable({ distributors, loading, error }) {
  if (loading) return <p className="text-sm text-slate-400 py-8 text-center">Loading…</p>;
  if (error) return <p className="text-sm text-red-600 py-8 text-center">{error}</p>;
  if (!distributors?.length) {
    return <p className="text-sm text-slate-400 py-8 text-center">No distributors yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200">
            <th className="py-3 pr-4 font-medium">Company Name</th>
            <th className="py-3 pr-4 font-medium">Emirate</th>
            <th className="py-3 pr-4 font-medium">Status</th>
            <th className="py-3 pr-4 font-medium">Customers</th>
            <th className="py-3 pr-4 font-medium">Drivers</th>
            <th className="py-3 pr-4 font-medium">Registered</th>
            <th className="py-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {distributors.map((d) => (
            <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 pr-4 font-medium text-slate-800">{d.company_name}</td>
              <td className="py-3 pr-4 text-slate-600">{d.emirate || '—'}</td>
              <td className="py-3 pr-4"><StatusBadge status={d.status} /></td>
              <td className="py-3 pr-4 text-slate-600">{d.customer_count}</td>
              <td className="py-3 pr-4 text-slate-600">{d.driver_count}</td>
              <td className="py-3 pr-4 text-slate-600">{formatDate(d.created_at)}</td>
              <td className="py-3">
                <Link
                  to={`/super-admin/distributors/${d.id}`}
                  className="rounded-lg border border-[#0EA5E9] px-3 py-1 text-xs font-medium text-[#0EA5E9] hover:bg-[#0EA5E9] hover:text-white transition-colors"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
