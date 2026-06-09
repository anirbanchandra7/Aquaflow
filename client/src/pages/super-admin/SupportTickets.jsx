import { useState } from 'react';
import { api } from '../../api.js';
import { useFetch } from '../../hooks/useFetch.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import Drawer from '../../components/Drawer.jsx';
import { formatDate } from '../../utils/format.js';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

export default function SupportTickets() {
  const { data, error, loading, refetch } = useFetch('/api/admin/support-tickets');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const tickets = (data?.tickets || []).filter((t) => filter === 'all' || t.status === filter);

  function openTicket(ticket) {
    setSelected(ticket);
    setNote(ticket.resolution_note || '');
    setSaveError('');
  }

  async function updateStatus(status) {
    setSaving(true);
    setSaveError('');
    try {
      const body = { status };
      if (status === 'resolved') body.resolution_note = note;
      const { ticket } = await api(`/api/admin/support-tickets/${selected.id}`, {
        method: 'PATCH',
        body,
      });
      setSelected(ticket);
      refetch();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0A1628]">Support Tickets</h1>
      <p className="text-sm text-slate-500 mt-1">Tickets raised by distributors</p>

      <div className="flex gap-2 mt-6">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-[#0EA5E9] text-white'
                : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mt-4 p-6">
        {loading ? (
          <p className="text-sm text-slate-400 py-8 text-center">Loading…</p>
        ) : error ? (
          <p className="text-sm text-red-600 py-8 text-center">{error}</p>
        ) : tickets.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No tickets found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200">
                <th className="py-3 pr-4 font-medium">Ticket ID</th>
                <th className="py-3 pr-4 font-medium">Distributor</th>
                <th className="py-3 pr-4 font-medium">Subject</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Raised On</th>
                <th className="py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 pr-4 font-mono text-xs text-slate-500">{t.id}</td>
                  <td className="py-3 pr-4 font-medium text-slate-800">{t.distributor_name}</td>
                  <td className="py-3 pr-4 text-slate-600">{t.subject}</td>
                  <td className="py-3 pr-4"><StatusBadge status={t.status} /></td>
                  <td className="py-3 pr-4 text-slate-600">{formatDate(t.created_at)}</td>
                  <td className="py-3">
                    <button
                      onClick={() => openTicket(t)}
                      className="rounded-lg border border-[#0EA5E9] px-3 py-1 text-xs font-medium text-[#0EA5E9] hover:bg-[#0EA5E9] hover:text-white transition-colors"
                    >
                      {t.status === 'resolved' ? 'View' : 'View / Resolve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title="Ticket Details">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-slate-500">{selected.id}</span>
              <StatusBadge status={selected.status} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Distributor</p>
              <p className="text-sm font-medium text-slate-800 mt-0.5">
                {selected.distributor_name}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Subject</p>
              <p className="text-sm font-medium text-slate-800 mt-0.5">{selected.subject}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Description</p>
              <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
                {selected.description || '—'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">Raised On</p>
                <p className="text-sm text-slate-700 mt-0.5">{formatDate(selected.created_at)}</p>
              </div>
              {selected.resolved_at && (
                <div>
                  <p className="text-xs text-slate-400">Resolved On</p>
                  <p className="text-sm text-slate-700 mt-0.5">{formatDate(selected.resolved_at)}</p>
                </div>
              )}
            </div>

            {selected.status === 'resolved' ? (
              selected.resolution_note && (
                <div className="rounded-lg bg-green-50 border border-green-100 p-3">
                  <p className="text-xs text-green-700 font-medium">Resolution note</p>
                  <p className="text-sm text-green-800 mt-1">{selected.resolution_note}</p>
                </div>
              )
            ) : (
              <div className="space-y-3 border-t border-slate-200 pt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Resolution note (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                    placeholder="How was this resolved?"
                  />
                </div>
                {saveError && <p className="text-sm text-red-600">{saveError}</p>}
                <div className="flex gap-3">
                  {selected.status === 'open' && (
                    <button
                      onClick={() => updateStatus('in_progress')}
                      disabled={saving}
                      className="flex-1 rounded-lg border border-amber-400 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 disabled:opacity-60 transition-colors"
                    >
                      Mark In Progress
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus('resolved')}
                    disabled={saving}
                    className="flex-1 rounded-lg bg-[#0EA5E9] py-2 text-sm font-semibold text-white hover:bg-[#0284C7] disabled:opacity-60 transition-colors"
                  >
                    {saving ? 'Saving…' : 'Mark Resolved'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
