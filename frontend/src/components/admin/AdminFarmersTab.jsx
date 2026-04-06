import Badge from '../Badge';
import { EmptyState, SectionHeader, shortDate } from './AdminShared';

const AdminFarmersTab = ({
  farmers,
  farmerSearch,
  setFarmerSearch,
  farmerStatus,
  setFarmerStatus,
  exportFarmersCSV,
  openFarmerModal,
  toggleFarmer,
}) => (
  <div className="card space-y-5 p-5">
    <SectionHeader
      label="User Management"
      title={`Farmers (${farmers.length})`}
      action={
        <button className="btn-secondary text-xs" type="button" onClick={exportFarmersCSV}>
          ⬇ Export CSV
        </button>
      }
    />

    <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
      <input className="input" placeholder="Search by name, email, or region…" value={farmerSearch} onChange={(e) => setFarmerSearch(e.target.value)} />
      <select className="input" value={farmerStatus} onChange={(e) => setFarmerStatus(e.target.value)}>
        <option value="all">All statuses</option>
        <option value="active">Active only</option>
        <option value="blocked">Blocked only</option>
      </select>
    </div>

    {farmers.length === 0 ? (
      <EmptyState icon="👨‍🌾" message="No farmers match your search." />
    ) : (
      <div className="overflow-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Farmer</th>
              <th className="px-4 py-3">Region</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {farmers.map((farmer) => (
              <tr key={farmer._id} className="transition-colors hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                      {farmer.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{farmer.name}</p>
                      <p className="text-xs text-slate-500">{farmer.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{farmer.region || '—'}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{shortDate(farmer.createdAt)}</td>
                <td className="px-4 py-3">
                  <Badge color={farmer.isActive ? 'green' : 'red'}>{farmer.isActive ? 'Active' : 'Blocked'}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button className="btn-secondary px-2.5 py-1.5 text-xs" type="button" onClick={() => openFarmerModal(farmer)}>
                      View
                    </button>
                    <button
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                        farmer.isActive ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                      type="button"
                      onClick={() => toggleFarmer(farmer)}
                    >
                      {farmer.isActive ? 'Block' : 'Activate'}
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
);

export default AdminFarmersTab;
