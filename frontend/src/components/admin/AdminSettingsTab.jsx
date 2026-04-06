import Badge from '../Badge';
import { EmptyState, SectionHeader, shortDate } from './AdminShared';

const AdminSettingsTab = ({
  annForm,
  setAnnForm,
  createAnnouncement,
  announcements,
  annTypeColor,
  deleteAnnouncement,
  auditLog,
}) => (
  <div className="grid gap-6 lg:grid-cols-2">
    <div className="space-y-6">
      <div className="card p-5">
        <SectionHeader label="Communication" title="Broadcast Announcement" subtitle="Send a message to all farmers" />
        <form className="mt-4 space-y-3" onSubmit={createAnnouncement}>
          <input className="input" placeholder="Title *" value={annForm.title} onChange={(e) => setAnnForm((p) => ({ ...p, title: e.target.value }))} required />
          <textarea className="input min-h-[80px] resize-none" placeholder="Message body…" value={annForm.body} onChange={(e) => setAnnForm((p) => ({ ...p, body: e.target.value }))} required />
          <select className="input" value={annForm.type} onChange={(e) => setAnnForm((p) => ({ ...p, type: e.target.value }))}>
            <option value="info">ℹ Info</option>
            <option value="warning">⚠ Warning</option>
            <option value="success">✅ Success</option>
            <option value="alert">🚨 Alert</option>
          </select>
          <button className="btn-primary w-full" type="submit">Publish Announcement</button>
        </form>
      </div>

      <div className="card p-5">
        <h3 className="mb-3 font-display text-xl text-slate-900">Announcements ({announcements.length})</h3>
        <div className="max-h-64 space-y-2 overflow-auto">
          {announcements.length === 0 ? (
            <EmptyState icon="📢" message="No announcements yet." />
          ) : (
            announcements.map((announcement) => (
              <div key={announcement._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge color={annTypeColor(announcement.type)}>{announcement.type}</Badge>
                    <p className="text-sm font-semibold text-slate-900">{announcement.title}</p>
                  </div>
                  <button type="button" className="flex-shrink-0 text-xs font-semibold text-red-600 hover:text-red-700" onClick={() => deleteAnnouncement(announcement._id)}>
                    Delete
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-600">{announcement.body}</p>
                <p className="mt-1.5 text-[10px] text-slate-400">{shortDate(announcement.createdAt)} — {announcement.createdBy?.name || 'Admin'}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>

    <div className="card p-5">
      <SectionHeader label="Security" title="Admin Activity Log" subtitle="All admin actions are recorded here" />
      <div className="mt-4 max-h-[540px] space-y-2 overflow-auto pr-1">
        {auditLog.length === 0 ? (
          <EmptyState icon="📋" message="No activity logged yet." />
        ) : (
          auditLog.map((log) => (
            <div key={log._id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-800">{log.action.replace(/_/g, ' ').toUpperCase()}</p>
                  <span className="flex-shrink-0 text-[10px] text-slate-400">{shortDate(log.createdAt)}</span>
                </div>
                {log.detail && <p className="mt-0.5 truncate text-xs text-slate-500">{log.detail}</p>}
                <p className="mt-1 text-[10px] text-slate-400">{log.admin?.email || 'Admin'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

export default AdminSettingsTab;
