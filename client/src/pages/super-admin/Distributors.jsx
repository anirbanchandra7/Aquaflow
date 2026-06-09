import { useState } from 'react';
import { api } from '../../api.js';
import { useFetch } from '../../hooks/useFetch.js';
import DistributorsTable from '../../components/DistributorsTable.jsx';
import Drawer from '../../components/Drawer.jsx';

// Dropdown labels per spec; values are the full names stored in the sheet.
const EMIRATES = [
  { value: 'Dubai', label: 'Dubai' },
  { value: 'Abu Dhabi', label: 'Abu Dhabi' },
  { value: 'Sharjah', label: 'Sharjah' },
  { value: 'Ajman', label: 'Ajman' },
  { value: 'Ras Al Khaimah', label: 'RAK' },
  { value: 'Fujairah', label: 'Fujairah' },
  { value: 'Umm Al Quwain', label: 'UAQ' },
];

const EMPTY_FORM = {
  company_name: '',
  contact_email: '',
  contact_phone: '',
  trade_license: '',
  emirate: 'Dubai',
  status: 'active',
};

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent';

export default function Distributors() {
  const { data, error, loading, refetch } = useFetch('/api/admin/distributors');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [licenseFile, setLicenseFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  // After a successful save: { distributor, admin: { email, temp_password } }
  const [created, setCreated] = useState(null);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function openDrawer() {
    setForm(EMPTY_FORM);
    setLicenseFile(null);
    setSubmitError('');
    setCreated(null);
    setDrawerOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      // File upload to Drive is not wired up yet — store the filename as a
      // reference so the document can be matched up later.
      const body = {
        ...form,
        registration_doc_url: licenseFile ? `file:${licenseFile.name}` : '',
      };
      const result = await api('/api/admin/distributors', { method: 'POST', body });
      setCreated(result);
      refetch();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Distributors</h1>
          <p className="text-sm text-slate-500 mt-1">Manage distributor accounts</p>
        </div>
        <button
          onClick={openDrawer}
          className="rounded-lg bg-[#0EA5E9] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0284C7] transition-colors"
        >
          + Add Distributor
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mt-6 p-6">
        <DistributorsTable distributors={data?.distributors} loading={loading} error={error} />
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={created ? 'Distributor Created' : 'Add Distributor'}
      >
        {created ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">{created.distributor.company_name}</span>{' '}
              has been onboarded. Share these admin credentials with them — the
              password is shown only once.
            </p>
            <div className="rounded-lg border border-[#0EA5E9]/30 bg-sky-50 p-4 space-y-2">
              <div>
                <p className="text-xs text-slate-500">Login email</p>
                <p className="text-sm font-medium text-slate-800">{created.admin.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Temporary password</p>
                <p className="text-lg font-mono font-bold text-[#0A1628] tracking-wide">
                  {created.admin.temp_password}
                </p>
              </div>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    `Email: ${created.admin.email}\nPassword: ${created.admin.temp_password}`
                  )
                }
                className="text-xs font-medium text-[#0EA5E9] hover:underline"
              >
                Copy credentials
              </button>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-full rounded-lg bg-[#0EA5E9] py-2.5 text-sm font-semibold text-white hover:bg-[#0284C7] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input required value={form.company_name} onChange={set('company_name')} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
              <input
                required
                type="email"
                value={form.contact_email}
                onChange={set('contact_email')}
                className={inputClass}
              />
              <p className="text-xs text-slate-400 mt-1">Used as the admin login email.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
              <input required value={form.contact_phone} onChange={set('contact_phone')} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Trade License Number
              </label>
              <input required value={form.trade_license} onChange={set('trade_license')} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Trade License Upload
              </label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#0EA5E9] hover:file:bg-sky-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Emirate</label>
              <select value={form.emirate} onChange={set('emirate')} className={inputClass}>
                {EMIRATES.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <button
                type="button"
                role="switch"
                aria-checked={form.status === 'active'}
                onClick={() =>
                  setForm((f) => ({ ...f, status: f.status === 'active' ? 'inactive' : 'active' }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.status === 'active' ? 'bg-[#0EA5E9]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-slate-500 -mt-2 text-right">
              {form.status === 'active' ? 'Active' : 'Inactive'}
            </p>

            {submitError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-[#0EA5E9] py-2.5 text-sm font-semibold text-white hover:bg-[#0284C7] disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Saving…' : 'Save Distributor'}
            </button>
          </form>
        )}
      </Drawer>
    </div>
  );
}
