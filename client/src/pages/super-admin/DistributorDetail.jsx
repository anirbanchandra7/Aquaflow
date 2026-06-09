import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch.js';
import StatCard from '../../components/StatCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { formatDate, titleCase } from '../../utils/format.js';

const PAGE_SIZE = 10;

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm text-slate-800 mt-0.5">{value || '—'}</p>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-[#0A1628] mb-4">{title}</h2>
      {children}
    </div>
  );
}

const th = 'py-2.5 pr-4 font-medium';
const td = 'py-2.5 pr-4 text-slate-600';
const headRow = 'text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200';

export default function DistributorDetail() {
  const { id } = useParams();
  const { data, error, loading } = useFetch(`/api/admin/distributors/${id}`);
  const [page, setPage] = useState(1);

  if (loading) return <p className="text-sm text-slate-400">Loading…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  const { distributor: d, stats, customers, drivers, tickets } = data;
  const totalPages = Math.max(1, Math.ceil(customers.length / PAGE_SIZE));
  const pageCustomers = customers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <Link to="/super-admin/distributors" className="text-sm text-[#0EA5E9] hover:underline">
          ← Back to Distributors
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-bold text-[#0A1628]">{d.company_name}</h1>
          <StatusBadge status={d.status} />
        </div>
      </div>

      <SectionCard title="Company Information">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
          <InfoRow label="Company Name" value={d.company_name} />
          <InfoRow label="Emirate" value={d.emirate} />
          <InfoRow label="Trade License" value={d.trade_license} />
          <InfoRow label="Contact Email" value={d.contact_email} />
          <InfoRow label="Contact Phone" value={d.contact_phone} />
          <InfoRow label="Registered" value={formatDate(d.created_at)} />
          <InfoRow label="Registration Document" value={d.registration_doc_url} />
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Customers" value={stats.total_customers} accent />
        <StatCard label="Active Drivers" value={stats.active_drivers} />
        <StatCard label="Orders This Month" value={stats.orders_this_month} />
      </div>

      <SectionCard title={`Customers (${customers.length})`}>
        {customers.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No customers yet.</p>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className={headRow}>
                  <th className={th}>Name</th>
                  <th className={th}>Phone</th>
                  <th className={th}>Emirate</th>
                  <th className={th}>Type</th>
                  <th className={th}>Last Order</th>
                </tr>
              </thead>
              <tbody>
                {pageCustomers.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100">
                    <td className="py-2.5 pr-4 font-medium text-slate-800">{c.name}</td>
                    <td className={td}>{c.phone}</td>
                    <td className={td}>{c.emirate}</td>
                    <td className={td}>{titleCase(c.type)}</td>
                    <td className={td}>{formatDate(c.last_order_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-end gap-3 mt-4 text-sm">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-slate-300 px-3 py-1 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>
                <span className="text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-slate-300 px-3 py-1 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </SectionCard>

      <SectionCard title={`Drivers (${drivers.length})`}>
        {drivers.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No drivers yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className={headRow}>
                <th className={th}>Name</th>
                <th className={th}>Phone</th>
                <th className={th}>Email</th>
                <th className={th}>Status</th>
                <th className={th}>Live</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((dr) => (
                <tr key={dr.id} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4 font-medium text-slate-800">{dr.name}</td>
                  <td className={td}>{dr.phone}</td>
                  <td className={td}>{dr.email}</td>
                  <td className="py-2.5 pr-4"><StatusBadge status={dr.status} /></td>
                  <td className={td}>{dr.is_live === 'true' ? '🟢 Live' : '⚪ Offline'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>

      <SectionCard title={`Support Tickets (${tickets.length})`}>
        {tickets.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No tickets raised.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className={headRow}>
                <th className={th}>Subject</th>
                <th className={th}>Status</th>
                <th className={th}>Raised On</th>
                <th className={th}>Resolved On</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4 font-medium text-slate-800">{t.subject}</td>
                  <td className="py-2.5 pr-4"><StatusBadge status={t.status} /></td>
                  <td className={td}>{formatDate(t.created_at)}</td>
                  <td className={td}>{formatDate(t.resolved_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>
    </div>
  );
}
