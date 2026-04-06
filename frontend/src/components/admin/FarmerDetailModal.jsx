import Badge from '../Badge';
import { fmtDate } from './AdminShared';

const FarmerDetailModal = ({ farmerModal, setFarmerModal, toggleFarmer }) => {
  if (!farmerModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={() => setFarmerModal(null)}>
      <div className="card m-4 w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-xl text-slate-900">Farmer Details</h3>
          <button className="text-lg text-slate-400 transition-colors hover:text-slate-600" onClick={() => setFarmerModal(null)}>✕</button>
        </div>

        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
            {farmerModal.farmer.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">{farmerModal.farmer.name}</p>
            <p className="text-sm text-slate-500">{farmerModal.farmer.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Region</p>
            <p className="mt-0.5 font-semibold text-slate-900">{farmerModal.farmer.region || '—'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Status</p>
            <div className="mt-0.5">
              <Badge color={farmerModal.farmer.isActive ? 'green' : 'red'}>{farmerModal.farmer.isActive ? 'Active' : 'Blocked'}</Badge>
            </div>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-[10px] uppercase tracking-wider text-emerald-600">Predictions</p>
            <p className="mt-0.5 text-2xl font-bold text-emerald-700">{farmerModal.predCount}</p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
            <p className="text-[10px] uppercase tracking-wider text-blue-600">Chat Sessions</p>
            <p className="mt-0.5 text-2xl font-bold text-blue-700">{farmerModal.chatCount}</p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Member Since</p>
          <p className="mt-0.5 font-semibold text-slate-900">{fmtDate(farmerModal.farmer.createdAt)}</p>
        </div>

        <button
          className={`mt-4 w-full rounded-xl border py-2.5 text-sm font-semibold transition-all ${
            farmerModal.farmer.isActive
              ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          }`}
          type="button"
          onClick={() => {
            toggleFarmer(farmerModal.farmer);
            setFarmerModal(null);
          }}
        >
          {farmerModal.farmer.isActive ? 'Block this Farmer' : 'Activate this Farmer'}
        </button>
      </div>
    </div>
  );
};

export default FarmerDetailModal;
