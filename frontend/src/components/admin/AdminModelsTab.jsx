import Badge from '../Badge';
import { EmptyState, SectionHeader, shortDate } from './AdminShared';

const AdminModelsTab = ({ upload, setUpload, uploadModel, models, modelStatusColor, changeModelStatus }) => (
  <div className="space-y-6">
    <div className="card p-5">
      <SectionHeader label="Machine Learning" title="Register New Model" subtitle="Upload a trained model file to the registry" />
      <form className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4" onSubmit={uploadModel}>
        <input className="input" value={upload.name} onChange={(e) => setUpload({ ...upload, name: e.target.value })} placeholder="Model name" />
        <input className="input" value={upload.version} onChange={(e) => setUpload({ ...upload, version: e.target.value })} placeholder="Version (e.g. v2.1)" />
        <input className="input" value={upload.metadata} onChange={(e) => setUpload({ ...upload, metadata: e.target.value })} placeholder="Metadata JSON" />
        <input className="input text-xs" type="file" onChange={(e) => setUpload({ ...upload, file: e.target.files?.[0] || null })} />
        <div className="md:col-span-2 lg:col-span-4">
          <button className="btn-primary w-full" type="submit">Upload Model</button>
        </div>
      </form>
    </div>

    <div className="card p-5">
      <h3 className="mb-4 font-display text-xl text-slate-900">Model Registry ({models.length})</h3>
      {models.length === 0 ? (
        <EmptyState icon="🤖" message="No models registered yet." />
      ) : (
        <div className="space-y-3">
          {models.map((model) => (
            <div key={model._id} className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50/60">
              <div className="min-w-[200px] flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900">{model.name}</p>
                  <span className="font-mono text-xs text-slate-400">{model.version}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Uploaded by {model.uploadedBy?.name || '—'} · {shortDate(model.createdAt)}
                </p>
              </div>
              <Badge color={modelStatusColor(model.status)}>{model.status}</Badge>
              <div className="flex gap-1">
                {['staging', 'deployed', 'archived'].filter((status) => status !== model.status).map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      status === 'deployed'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : status === 'archived'
                          ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                          : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                    onClick={() => changeModelStatus(model, status)}
                  >
                    → {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default AdminModelsTab;
