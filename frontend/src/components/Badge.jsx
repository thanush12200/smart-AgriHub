/**
 * Reusable status badge component.
 * @param {{ children: React.ReactNode, color?: string }} props
 */
const BADGE_COLORS = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  sky: 'bg-sky-50 text-sky-700 border-sky-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
};

const Badge = ({ children, color = 'slate' }) => {
  const cls = BADGE_COLORS[color] || BADGE_COLORS.slate;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
};

export default Badge;
