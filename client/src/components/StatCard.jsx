export default function StatCard({ label, value, accent = false }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accent ? 'text-[#0EA5E9]' : 'text-[#0A1628]'}`}>
        {value ?? '—'}
      </p>
    </div>
  );
}
