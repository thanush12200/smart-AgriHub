export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

export const shortDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
      })
    : '—';

export const StatCard = ({ label, value, sub, color = 'slate', icon }) => {
  const themes = {
    green: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', iconBg: 'bg-emerald-100' },
    amber: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', iconBg: 'bg-amber-100' },
    blue: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', iconBg: 'bg-blue-100' },
    red: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', iconBg: 'bg-red-100' },
    purple: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', iconBg: 'bg-purple-100' },
    slate: { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-700', iconBg: 'bg-slate-100' },
  };
  const theme = themes[color] || themes.slate;

  return (
    <div className={`rounded-2xl border p-4 ${theme.bg} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
          <p className={`mt-1.5 text-3xl font-bold tracking-tight ${theme.text}`}>{value ?? '—'}</p>
          {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
        {icon && <span className={`rounded-xl p-2 text-lg ${theme.iconBg}`}>{icon}</span>}
      </div>
    </div>
  );
};

export const SectionHeader = ({ label, title, subtitle, action }) => (
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
      <p className="section-label">{label}</p>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const EmptyState = ({ icon = '📭', message }) => (
  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
    <span className="mb-3 text-4xl">{icon}</span>
    <p className="text-sm">{message}</p>
  </div>
);

export const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'farmers', label: 'Farmers', icon: '👨‍🌾' },
  { id: 'marketplace', label: 'Marketplace', icon: '🛒' },
  { id: 'models', label: 'ML Models', icon: '🤖' },
  { id: 'logs', label: 'Logs', icon: '📋' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];
