import { SectionHeader, StatCard } from './AdminShared';

const AdminOverviewTab = ({ stats, lowStockProducts, predAnalytics }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      <StatCard label="Total Farmers" value={stats.farmers.total} sub={`${stats.farmers.newThisWeek} joined this week`} color="green" icon="👨‍🌾" />
      <StatCard label="Active" value={stats.farmers.active} color="green" icon="✅" />
      <StatCard label="Blocked" value={stats.farmers.blocked} color="red" icon="🚫" />
      <StatCard label="Products Listed" value={stats.products.active} sub={`${stats.products.lowStock} low stock`} color="blue" icon="🛒" />
      <StatCard label="Predictions Run" value={stats.predictions.total} sub={`${stats.predictions.thisWeek} this week`} color="purple" icon="🤖" />
      <StatCard label="Chat Sessions" value={stats.chats.total} sub={`${stats.chats.thisWeek} this week`} color="amber" icon="💬" />
    </div>

    {lowStockProducts.length > 0 && (
      <div className="card border-l-4 border-l-red-400 p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-red-500">⚠️</span>
          <p className="text-sm font-bold text-red-700">Low Stock Alert — {lowStockProducts.length} products need restocking</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {lowStockProducts.map((product) => (
            <span key={product.productCode} className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
              {product.name} <span className="text-red-500">({product.stock} left)</span>
            </span>
          ))}
        </div>
      </div>
    )}

    {predAnalytics?.byType?.length > 0 && (
      <div className="card p-5">
        <SectionHeader label="Analytics" title="Prediction Breakdown" subtitle="Aggregated by prediction type across all users" />
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {predAnalytics.byType.map((item) => (
            <div key={item._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{item._id}</p>
              <p className="mt-2 text-4xl font-bold text-slate-900">{item.count}</p>
              <div className="mt-3 flex items-center justify-center gap-1.5">
                <div className="h-2 max-w-[80px] flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${(item.avgConfidence || 0) * 100}%` }} />
                </div>
                <span className="text-xs text-slate-500">
                  {item.avgConfidence ? `${(item.avgConfidence * 100).toFixed(0)}% avg` : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default AdminOverviewTab;
