const MetricCard = ({ title, value, subtitle, accent = 'emerald' }) => {
  const accentClass = {
    emerald: 'from-emerald-500/20 to-emerald-300/5 border-emerald-300/30',
    sky: 'from-sky-500/20 to-sky-300/5 border-sky-300/30',
    amber: 'from-amber-500/20 to-amber-300/5 border-amber-300/30'
  }[accent] || 'from-emerald-500/20 to-emerald-300/5 border-emerald-300/30';

  return (
    <div className={`rounded-3xl border bg-gradient-to-br p-5 shadow-lg ${accentClass}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{title}</p>
      <h3 className="mt-2 text-3xl font-display font-bold text-slate-900">{value}</h3>
      <p className="mt-1 text-xs text-slate-600">{subtitle}</p>
    </div>
  );
};

export default MetricCard;
