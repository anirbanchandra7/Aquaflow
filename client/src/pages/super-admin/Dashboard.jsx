import { useFetch } from '../../hooks/useFetch.js';
import StatCard from '../../components/StatCard.jsx';
import DistributorsTable from '../../components/DistributorsTable.jsx';

export default function Dashboard() {
  const stats = useFetch('/api/admin/stats');
  const list = useFetch('/api/admin/distributors');

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0A1628]">Dashboard</h1>
      <p className="text-sm text-slate-500 mt-1">Platform overview</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard label="Total Distributors" value={stats.data?.total_distributors} accent />
        <StatCard label="Total Customers" value={stats.data?.total_customers} />
        <StatCard label="Total Drivers" value={stats.data?.total_drivers} />
        <StatCard label="Open Support Tickets" value={stats.data?.open_tickets} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mt-8 p-6">
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Distributors</h2>
        <DistributorsTable
          distributors={list.data?.distributors}
          loading={list.loading}
          error={list.error || stats.error}
        />
      </div>
    </div>
  );
}
