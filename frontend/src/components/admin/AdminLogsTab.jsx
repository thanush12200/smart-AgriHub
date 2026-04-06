import Badge from '../Badge';
import { EmptyState, SectionHeader, shortDate } from './AdminShared';

const AdminLogsTab = ({ predictions, chats, chatSearch, setChatSearch }) => (
  <div className="grid gap-6 lg:grid-cols-2">
    <div className="card p-5">
      <SectionHeader label="AI Predictions" title={`Prediction Logs (${predictions.length})`} />
      <div className="mt-4 max-h-[540px] space-y-2 overflow-auto pr-1">
        {predictions.length === 0 ? (
          <EmptyState icon="🤖" message="No prediction logs yet." />
        ) : (
          predictions.map((item) => (
            <div key={item._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge color={item.type === 'crop' ? 'green' : item.type === 'fertilizer' ? 'blue' : 'purple'}>{item.type}</Badge>
                  <span className="text-xs font-medium text-slate-700">{item.user?.name || item.user?.email || 'Unknown'}</span>
                </div>
                <span className="text-[10px] text-slate-400">{shortDate(item.createdAt)}</span>
              </div>
              {item.confidence != null && (
                <div className="mt-2">
                  <div className="mb-0.5 flex justify-between text-[10px] text-slate-500">
                    <span>Confidence</span>
                    <span className="font-semibold">{(item.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${(item.confidence * 100).toFixed(0)}%` }} />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>

    <div className="card p-5">
      <SectionHeader label="Conversations" title={`Chat Logs (${chats.length})`} />
      <input className="input mt-3" placeholder="Search messages…" value={chatSearch} onChange={(e) => setChatSearch(e.target.value)} />
      <div className="mt-3 max-h-[480px] space-y-2 overflow-auto pr-1">
        {chats.length === 0 ? (
          <EmptyState icon="💬" message="No chat logs found." />
        ) : (
          chats.map((item) => (
            <div key={item._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-800">{item.user?.name || item.user?.email || 'Unknown'}</p>
                <span className="text-[10px] text-slate-400">{shortDate(item.createdAt)}</span>
              </div>
              <p className="text-xs text-slate-700"><span className="font-semibold text-brand-600">Q:</span> {item.message}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-slate-500"><span className="font-semibold">A:</span> {item.response}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge color="slate">{item.source}</Badge>
                {item.confidence != null && <span className="text-[10px] text-slate-400">{(item.confidence * 100).toFixed(0)}% confident</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

export default AdminLogsTab;
