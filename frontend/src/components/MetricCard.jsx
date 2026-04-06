const icons = {
  emerald: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  sky: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500">
      <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
      <path d="M8.5 2h7M7 16h10" />
    </svg>
  ),
  amber: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  ),
};

const borderColors = {
  emerald: 'border-l-brand-400',
  sky: 'border-l-sky-400',
  amber: 'border-l-amber-400',
};

const MetricCard = ({ title, value, subtitle, accent = 'emerald' }) => {
  const border = borderColors[accent] || borderColors.emerald;
  const icon = icons[accent] || icons.emerald;

  return (
    <div className={`card border-l-[3px] ${border} p-5 md:p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
          <h3 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-950">{value}</h3>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
