import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useDocTitle from '../hooks/useDocTitle';
import api from '../api/axiosClient';
import Badge from '../components/Badge';
import { formatINR } from '../utils/formatINR';

/* ── Helpers ─────────────────────────────────────────── */
const fmtDate = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const shortDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';

/* ── Sub-components ──────────────────────────────────── */

const StatCard = ({ label, value, sub, color = 'slate', icon }) => {
  const themes = {
    green:  { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', iconBg: 'bg-emerald-100' },
    amber:  { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', iconBg: 'bg-amber-100' },
    blue:   { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', iconBg: 'bg-blue-100' },
    red:    { bg: 'bg-red-50 border-red-200', text: 'text-red-700', iconBg: 'bg-red-100' },
    purple: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', iconBg: 'bg-purple-100' },
    slate:  { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-700', iconBg: 'bg-slate-100' },
  };
  const t = themes[color] || themes.slate;

  return (
    <div className={`rounded-2xl border p-4 ${t.bg} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
          <p className={`mt-1.5 text-3xl font-bold tracking-tight ${t.text}`}>{value ?? '—'}</p>
          {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
        {icon && <span className={`rounded-xl p-2 text-lg ${t.iconBg}`}>{icon}</span>}
      </div>
    </div>
  );
};

const SectionHeader = ({ label, title, subtitle, action }) => (
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
      <p className="section-label">{label}</p>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
    {action}
  </div>
);

const EmptyState = ({ icon = '📭', message }) => (
  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
    <span className="text-4xl mb-3">{icon}</span>
    <p className="text-sm">{message}</p>
  </div>
);

/* ── Tab config ──────────────────────────────────────── */
const TABS = [
  { id: 'overview',    label: 'Overview',     icon: '📊' },
  { id: 'farmers',     label: 'Farmers',      icon: '👨‍🌾' },
  { id: 'marketplace', label: 'Marketplace',  icon: '🛒' },
  { id: 'models',      label: 'ML Models',    icon: '🤖' },
  { id: 'logs',        label: 'Logs',         icon: '📋' },
  { id: 'settings',    label: 'Settings',     icon: '⚙️' },
];

/* ═══════════════════════════════════════════════════════
   AdminPage — Main Component
   ═══════════════════════════════════════════════════════ */
const AdminPage = () => {
  useDocTitle('Admin Dashboard');
  const [tab, setTab] = useState('overview');

  // Data
  const [stats, setStats] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [farmerSearch, setFarmerSearch] = useState('');
  const [farmerStatus, setFarmerStatus] = useState('all');
  const [farmerModal, setFarmerModal] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [predAnalytics, setPredAnalytics] = useState(null);
  const [chats, setChats] = useState([]);
  const [chatSearch, setChatSearch] = useState('');
  const [models, setModels] = useState([]);
  const [products, setProducts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [auditLog, setAuditLog] = useState([]);

  // UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState({ text: '', type: '' });

  // Forms
  const [upload, setUpload] = useState({ name: 'crop_model', version: 'v2', metadata: '{"note":"latest"}', file: null });
  const [productForm, setProductForm] = useState({ productCode: '', name: '', category: 'Seeds', brand: '', price: '', unit: 'unit', stock: 0, rating: 4.5, image: '', description: '' });
  const [inlineEdit, setInlineEdit] = useState({});
  const [annForm, setAnnForm] = useState({ title: '', body: '', type: 'info' });

  const notify = useCallback((text, type = 'success') => {
    setNotice({ text, type });
    setTimeout(() => setNotice({ text: '', type: '' }), 4000);
  }, []);

  /* ── Data loaders ─────────────────────────────────── */
  const loadStats    = useCallback(async () => { const { data } = await api.get('/admin/stats'); setStats(data); }, []);
  const loadFarmers  = useCallback(async () => {
    const params = {};
    if (farmerSearch.trim()) params.search = farmerSearch.trim();
    if (farmerStatus !== 'all') params.status = farmerStatus;
    const { data } = await api.get('/admin/farmers', { params });
    setFarmers(data.farmers);
  }, [farmerSearch, farmerStatus]);
  const loadProducts = useCallback(async () => { const { data } = await api.get('/admin/products'); setProducts(data.products || []); }, []);
  const loadChats    = useCallback(async () => {
    const params = chatSearch.trim() ? { search: chatSearch.trim() } : {};
    const { data } = await api.get('/admin/chat-logs', { params });
    setChats(data.logs);
  }, [chatSearch]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [predRes, modelsRes, annRes, auditRes, analyticsRes] = await Promise.all([
        api.get('/admin/predictions'), api.get('/admin/models'), api.get('/admin/announcements'),
        api.get('/admin/audit-log'), api.get('/admin/predictions/analytics'),
      ]);
      setPredictions(predRes.data.logs);
      setModels(modelsRes.data.models);
      setAnnouncements(annRes.data.announcements);
      setAuditLog(auditRes.data.logs);
      setPredAnalytics(analyticsRes.data);
      await Promise.all([loadStats(), loadFarmers(), loadProducts(), loadChats()]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, [loadStats, loadFarmers, loadProducts, loadChats]);

  useEffect(() => { loadAll(); }, []);

  // Debounced re-fetch on search changes
  const farmerSearchRef = useRef(false);
  useEffect(() => {
    if (!farmerSearchRef.current) { farmerSearchRef.current = true; return; }
    const t = setTimeout(() => loadFarmers(), 300);
    return () => clearTimeout(t);
  }, [farmerSearch, farmerStatus]);

  const chatSearchRef = useRef(false);
  useEffect(() => {
    if (!chatSearchRef.current) { chatSearchRef.current = true; return; }
    const t = setTimeout(() => loadChats(), 300);
    return () => clearTimeout(t);
  }, [chatSearch]);

  /* ── Actions ──────────────────────────────────────── */
  const toggleFarmer = async (farmer) => {
    await api.patch(`/admin/farmers/${farmer._id}/status`, { isActive: !farmer.isActive });
    notify(`${farmer.name} ${farmer.isActive ? 'blocked' : 'activated'}`, farmer.isActive ? 'error' : 'success');
    loadFarmers(); loadStats();
  };

  const openFarmerModal = async (farmer) => {
    const { data } = await api.get(`/admin/farmers/${farmer._id}`);
    setFarmerModal(data);
  };

  const exportFarmersCSV = () => {
    const rows = [['Name', 'Email', 'Region', 'Status', 'Joined']];
    farmers.forEach((f) => rows.push([f.name, f.email, f.region, f.isActive ? 'Active' : 'Blocked', fmtDate(f.createdAt)]));
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: 'farmers.csv' }).click();
    URL.revokeObjectURL(url);
  };

  const uploadModel = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', upload.name); fd.append('version', upload.version);
    fd.append('metadata', upload.metadata);
    if (upload.file) fd.append('modelFile', upload.file);
    await api.post('/admin/models/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    notify('Model uploaded successfully');
    const { data } = await api.get('/admin/models');
    setModels(data.models);
  };

  const changeModelStatus = async (model, status) => {
    await api.patch(`/admin/models/${model._id}/status`, { status });
    notify(`${model.name} → ${status}`);
    const { data } = await api.get('/admin/models');
    setModels(data.models);
  };

  const createProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...productForm, price: Number(productForm.price), stock: Number(productForm.stock), rating: Number(productForm.rating) };
      if (!payload.name || !payload.category || Number.isNaN(payload.price)) { notify('Name, category, and price are required.', 'error'); return; }
      await api.post('/admin/products', payload);
      notify('Product created');
      setProductForm({ productCode: '', name: '', category: 'Seeds', brand: '', price: '', unit: 'unit', stock: 0, rating: 4.5, image: '', description: '' });
      loadProducts(); loadStats();
    } catch (err) { notify(err.response?.data?.message || 'Failed to create product', 'error'); }
  };

  const saveInlineEdit = async (productCode) => {
    const updates = inlineEdit[productCode];
    if (!updates || !Object.keys(updates).length) return;
    try {
      await api.patch(`/admin/products/${productCode}`, updates);
      notify('Product updated');
      setInlineEdit((p) => { const next = { ...p }; delete next[productCode]; return next; });
      loadProducts();
    } catch (err) { notify(err.response?.data?.message || 'Update failed', 'error'); }
  };

  const updateInlineField = (code, field, value) => {
    setInlineEdit((p) => ({ ...p, [code]: { ...p[code], [field]: value } }));
  };

  const updateProductStock = async (code, stock) => {
    await api.patch(`/admin/products/${code}`, { stock: Math.max(0, Number(stock) || 0) });
    notify('Stock updated'); loadProducts();
  };

  const updateProductPrice = async (code, price) => {
    await api.patch(`/admin/products/${code}`, { price: Math.max(0, Number(price) || 0) });
    notify('Price updated'); loadProducts();
  };

  const toggleProductActive = async (product) => {
    await api.patch(`/admin/products/${product.productCode}`, { isActive: !product.isActive });
    notify(`${product.name} ${product.isActive ? 'hidden' : 'shown'}`);
    loadProducts();
  };

  const deleteProduct = async (code) => {
    if (!window.confirm('Permanently delete this product?')) return;
    await api.delete(`/admin/products/${code}`);
    notify('Product deleted'); loadProducts(); loadStats();
  };

  const createAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/announcements', annForm);
      notify('Announcement published');
      setAnnForm({ title: '', body: '', type: 'info' });
      const { data } = await api.get('/admin/announcements');
      setAnnouncements(data.announcements);
    } catch (err) { notify(err.response?.data?.message || 'Failed', 'error'); }
  };

  const deleteAnnouncement = async (id) => {
    await api.delete(`/admin/announcements/${id}`);
    notify('Announcement deleted');
    const { data } = await api.get('/admin/announcements');
    setAnnouncements(data.announcements);
  };

  /* ── Derived ──────────────────────────────────────── */
  const lowStockProducts = useMemo(() => products.filter((p) => p.isActive && p.stock < 10), [products]);
  const modelStatusColor = (s) => ({ deployed: 'green', staging: 'amber', archived: 'slate' }[s] || 'slate');
  const annTypeColor = (t) => ({ info: 'blue', warning: 'amber', success: 'green', alert: 'red' }[t] || 'blue');

  /* ── Loading / Error states ───────────────────────── */
  if (loading) return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 animate-fadeIn">
      <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-surface-200 border-t-brand-500" />
      <p className="text-sm font-medium text-slate-500">Loading admin panel…</p>
    </div>
  );

  if (error) return (
    <div className="card border-red-200 bg-red-50 p-6 text-center animate-fadeIn">
      <p className="text-red-600 font-semibold">{error}</p>
      <button className="btn-secondary mt-3" onClick={loadAll}>Retry</button>
    </div>
  );

  /* ═══════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════ */
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ── Page Header ─────────────────────────────── */}
      <div>
        <p className="section-label">Administration</p>
        <h1 className="font-display text-3xl text-slate-900 mt-1">Control Panel</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your platform — farmers, products, ML models, and system logs.</p>
      </div>

      {/* ── Toast ────────────────────────────────────── */}
      {notice.text && (
        <div className={`rounded-xl px-4 py-3 text-sm font-semibold border transition-all animate-fadeIn ${
          notice.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {notice.text}
        </div>
      )}

      {/* ── Tab Bar ──────────────────────────────────── */}
      <div className="flex gap-1 rounded-2xl border border-surface-200 bg-surface-50 p-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
              tab === t.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <span className="text-sm">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════
         TAB: Overview
         ════════════════════════════════════════════════ */}
      {tab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Primary stats: 2x3 grid on desktop, 2-col on mobile */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard label="Total Farmers" value={stats.farmers.total} sub={`${stats.farmers.newThisWeek} joined this week`} color="green" icon="👨‍🌾" />
            <StatCard label="Active" value={stats.farmers.active} color="green" icon="✅" />
            <StatCard label="Blocked" value={stats.farmers.blocked} color="red" icon="🚫" />
            <StatCard label="Products Listed" value={stats.products.active} sub={`${stats.products.lowStock} low stock`} color="blue" icon="🛒" />
            <StatCard label="Predictions Run" value={stats.predictions.total} sub={`${stats.predictions.thisWeek} this week`} color="purple" icon="🤖" />
            <StatCard label="Chat Sessions" value={stats.chats.total} sub={`${stats.chats.thisWeek} this week`} color="amber" icon="💬" />
          </div>

          {/* Low stock alert */}
          {lowStockProducts.length > 0 && (
            <div className="card border-l-4 border-l-red-400 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-500">⚠️</span>
                <p className="text-sm font-bold text-red-700">Low Stock Alert — {lowStockProducts.length} products need restocking</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {lowStockProducts.map((p) => (
                  <span key={p.productCode} className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    {p.name} <span className="text-red-500">({p.stock} left)</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Prediction breakdown */}
          {predAnalytics?.byType?.length > 0 && (
            <div className="card p-5">
              <SectionHeader label="Analytics" title="Prediction Breakdown" subtitle="Aggregated by prediction type across all users" />
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {predAnalytics.byType.map((item) => (
                  <div key={item._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{item._id}</p>
                    <p className="text-4xl font-bold text-slate-900 mt-2">{item.count}</p>
                    <div className="mt-3 flex items-center justify-center gap-1.5">
                      <div className="h-2 flex-1 rounded-full bg-slate-200 max-w-[80px] overflow-hidden">
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
      )}

      {/* ════════════════════════════════════════════════
         TAB: Farmers
         ════════════════════════════════════════════════ */}
      {tab === 'farmers' && (
        <div className="card p-5 space-y-5">
          <SectionHeader
            label="User Management"
            title={`Farmers (${farmers.length})`}
            action={<button className="btn-secondary text-xs" type="button" onClick={exportFarmersCSV}>⬇ Export CSV</button>}
          />

          {/* Search + filter */}
          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <input className="input" placeholder="Search by name, email, or region…" value={farmerSearch} onChange={(e) => setFarmerSearch(e.target.value)} />
            <select className="input" value={farmerStatus} onChange={(e) => setFarmerStatus(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="active">Active only</option>
              <option value="blocked">Blocked only</option>
            </select>
          </div>

          {/* Table */}
          {farmers.length === 0 ? (
            <EmptyState icon="👨‍🌾" message="No farmers match your search." />
          ) : (
            <div className="overflow-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Farmer</th>
                    <th className="px-4 py-3">Region</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {farmers.map((f) => (
                    <tr key={f._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">
                            {f.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{f.name}</p>
                            <p className="text-xs text-slate-500">{f.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{f.region || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{shortDate(f.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Badge color={f.isActive ? 'green' : 'red'}>{f.isActive ? 'Active' : 'Blocked'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button className="btn-secondary text-xs px-2.5 py-1.5" type="button" onClick={() => openFarmerModal(f)}>View</button>
                          <button
                            className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold border transition-colors ${
                              f.isActive ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                            type="button"
                            onClick={() => toggleFarmer(f)}
                          >
                            {f.isActive ? 'Block' : 'Activate'}
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
      )}

      {/* ════════════════════════════════════════════════
         TAB: Marketplace
         ════════════════════════════════════════════════ */}
      {tab === 'marketplace' && (
        <div className="space-y-6">
          {/* Add product form */}
          <div className="card p-5">
            <SectionHeader label="Inventory" title="Add New Product" />
            <form className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3" onSubmit={createProduct}>
              <input className="input" placeholder="Product code (auto if blank)" value={productForm.productCode} onChange={(e) => setProductForm((p) => ({ ...p, productCode: e.target.value }))} />
              <input className="input" placeholder="Name *" value={productForm.name} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))} required />
              <input className="input" placeholder="Category *" value={productForm.category} onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))} required />
              <input className="input" placeholder="Brand" value={productForm.brand} onChange={(e) => setProductForm((p) => ({ ...p, brand: e.target.value }))} />
              <input className="input" placeholder="Unit (e.g. 10 kg)" value={productForm.unit} onChange={(e) => setProductForm((p) => ({ ...p, unit: e.target.value }))} />
              <input className="input" type="number" placeholder="Price (₹) *" value={productForm.price} onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))} required />
              <input className="input" type="number" placeholder="Stock" value={productForm.stock} onChange={(e) => setProductForm((p) => ({ ...p, stock: Number(e.target.value) }))} />
              <input className="input" type="number" step="0.1" placeholder="Rating (0–5)" value={productForm.rating} onChange={(e) => setProductForm((p) => ({ ...p, rating: Number(e.target.value) }))} />
              <input className="input" placeholder="Image URL" value={productForm.image} onChange={(e) => setProductForm((p) => ({ ...p, image: e.target.value }))} />
              <input className="input md:col-span-2 lg:col-span-3" placeholder="Description" value={productForm.description} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} />
              <div className="md:col-span-2 lg:col-span-3">
                <button className="btn-primary w-full" type="submit">Add Product</button>
              </div>
            </form>
          </div>

          {/* Products table */}
          <div className="card p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-display text-xl text-slate-900">Products ({products.length})</h3>
              {lowStockProducts.length > 0 && <Badge color="red">⚠ {lowStockProducts.length} low stock</Badge>}
            </div>

            {products.length === 0 ? (
              <EmptyState icon="🛒" message="No products in the catalog yet." />
            ) : (
              <div className="overflow-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((product) => {
                      const isLow = product.isActive && product.stock < 10;
                      const edit = inlineEdit[product.productCode] || {};
                      const isEditing = !!Object.keys(edit).length;

                      return (
                        <tr key={product.productCode} className={`transition-colors ${isLow ? 'bg-red-50/30' : 'hover:bg-slate-50/60'}`}>
                          {/* Product info */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 min-w-[200px]">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-10 w-10 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                                loading="lazy"
                                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=80&h=80&fit=crop'; }}
                              />
                              <div className="min-w-0">
                                {isEditing && edit.name !== undefined ? (
                                  <input className="w-36 rounded border border-slate-300 px-2 py-1 text-xs" value={edit.name} onChange={(e) => updateInlineField(product.productCode, 'name', e.target.value)} />
                                ) : (
                                  <p className="font-semibold text-slate-900 truncate">{product.name}</p>
                                )}
                                <p className="text-[10px] text-slate-400 font-mono">{product.productCode}</p>
                                {isLow && <span className="text-[10px] font-bold text-red-600">LOW STOCK</span>}
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-3 text-slate-600">
                            {isEditing && edit.category !== undefined ? (
                              <input className="w-24 rounded border border-slate-300 px-2 py-1 text-xs" value={edit.category} onChange={(e) => updateInlineField(product.productCode, 'category', e.target.value)} />
                            ) : product.category}
                          </td>

                          {/* Price */}
                          <td className="px-4 py-3">
                            <input
                              className="w-20 rounded border border-slate-300 px-2 py-1 text-xs font-semibold"
                              type="number"
                              defaultValue={product.price}
                              onBlur={(e) => updateProductPrice(product.productCode, e.target.value)}
                            />
                          </td>

                          {/* Stock */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <input
                                className={`w-16 rounded border px-2 py-1 text-xs font-semibold ${isLow ? 'border-red-300 bg-red-50 text-red-700' : 'border-slate-300'}`}
                                type="number"
                                defaultValue={product.stock}
                                min={0}
                                onBlur={(e) => updateProductStock(product.productCode, e.target.value)}
                              />
                              <button className="rounded bg-slate-100 px-1.5 py-1 text-[10px] text-slate-600 hover:bg-slate-200" type="button" onClick={() => updateProductStock(product.productCode, product.stock + 10)}>+10</button>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <Badge color={product.isActive ? 'green' : 'slate'}>{product.isActive ? 'Active' : 'Hidden'}</Badge>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1 justify-end">
                              {!isEditing ? (
                                <button className="rounded bg-blue-50 border border-blue-200 px-2 py-1 text-[10px] font-semibold text-blue-700 hover:bg-blue-100" type="button"
                                  onClick={() => setInlineEdit((p) => ({ ...p, [product.productCode]: { name: product.name, category: product.category, brand: product.brand, image: product.image ?? '', description: product.description ?? '' } }))}>
                                  Edit
                                </button>
                              ) : (
                                <>
                                  <button className="rounded bg-emerald-50 border border-emerald-200 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100" type="button" onClick={() => saveInlineEdit(product.productCode)}>Save</button>
                                  <button className="rounded bg-slate-50 border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-100" type="button" onClick={() => setInlineEdit((p) => { const n = { ...p }; delete n[product.productCode]; return n; })}>Cancel</button>
                                </>
                              )}
                              <button className={`rounded px-2 py-1 text-[10px] font-semibold border ${product.isActive ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                                type="button" onClick={() => toggleProductActive(product)}>
                                {product.isActive ? 'Hide' : 'Show'}
                              </button>
                              <button className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-700 hover:bg-red-100" type="button" onClick={() => deleteProduct(product.productCode)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
         TAB: ML Models
         ════════════════════════════════════════════════ */}
      {tab === 'models' && (
        <div className="space-y-6">
          <div className="card p-5">
            <SectionHeader label="Machine Learning" title="Register New Model" subtitle="Upload a trained model file to the registry" />
            <form className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4" onSubmit={uploadModel}>
              <input className="input" value={upload.name} onChange={(e) => setUpload({ ...upload, name: e.target.value })} placeholder="Model name" />
              <input className="input" value={upload.version} onChange={(e) => setUpload({ ...upload, version: e.target.value })} placeholder="Version (e.g. v2.1)" />
              <input className="input" value={upload.metadata} onChange={(e) => setUpload({ ...upload, metadata: e.target.value })} placeholder='Metadata JSON' />
              <input className="input text-xs" type="file" onChange={(e) => setUpload({ ...upload, file: e.target.files?.[0] || null })} />
              <div className="md:col-span-2 lg:col-span-4">
                <button className="btn-primary w-full" type="submit">Upload Model</button>
              </div>
            </form>
          </div>

          <div className="card p-5">
            <h3 className="font-display text-xl text-slate-900 mb-4">Model Registry ({models.length})</h3>
            {models.length === 0 ? (
              <EmptyState icon="🤖" message="No models registered yet." />
            ) : (
              <div className="space-y-3">
                {models.map((m) => (
                  <div key={m._id} className="rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-4 hover:bg-slate-50/60 transition-colors">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">{m.name}</p>
                        <span className="font-mono text-xs text-slate-400">{m.version}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Uploaded by {m.uploadedBy?.name || '—'} · {shortDate(m.createdAt)}
                      </p>
                    </div>
                    <Badge color={modelStatusColor(m.status)}>{m.status}</Badge>
                    <div className="flex gap-1">
                      {['staging', 'deployed', 'archived'].filter((s) => s !== m.status).map((s) => (
                        <button key={s} type="button"
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors ${
                            s === 'deployed' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' :
                            s === 'archived' ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100' :
                            'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                          }`}
                          onClick={() => changeModelStatus(m, s)}
                        >→ {s}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
         TAB: Logs
         ════════════════════════════════════════════════ */}
      {tab === 'logs' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Prediction logs */}
          <div className="card p-5">
            <SectionHeader label="AI Predictions" title={`Prediction Logs (${predictions.length})`} />
            <div className="mt-4 max-h-[540px] overflow-auto space-y-2 pr-1">
              {predictions.length === 0 ? (
                <EmptyState icon="🤖" message="No prediction logs yet." />
              ) : predictions.map((item) => (
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
                      <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                        <span>Confidence</span>
                        <span className="font-semibold">{(item.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${(item.confidence * 100).toFixed(0)}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat logs */}
          <div className="card p-5">
            <SectionHeader label="Conversations" title={`Chat Logs (${chats.length})`} />
            <input className="input mt-3" placeholder="Search messages…" value={chatSearch} onChange={(e) => setChatSearch(e.target.value)} />
            <div className="mt-3 max-h-[480px] overflow-auto space-y-2 pr-1">
              {chats.length === 0 ? (
                <EmptyState icon="💬" message="No chat logs found." />
              ) : chats.map((item) => (
                <div key={item._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-xs font-semibold text-slate-800">{item.user?.name || item.user?.email || 'Unknown'}</p>
                    <span className="text-[10px] text-slate-400">{shortDate(item.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-700"><span className="font-semibold text-brand-600">Q:</span> {item.message}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2"><span className="font-semibold">A:</span> {item.response}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge color="slate">{item.source}</Badge>
                    {item.confidence != null && <span className="text-[10px] text-slate-400">{(item.confidence * 100).toFixed(0)}% confident</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
         TAB: Settings
         ════════════════════════════════════════════════ */}
      {tab === 'settings' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Announcements */}
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
              <h3 className="font-display text-xl text-slate-900 mb-3">Announcements ({announcements.length})</h3>
              <div className="space-y-2 max-h-64 overflow-auto">
                {announcements.length === 0 ? (
                  <EmptyState icon="📢" message="No announcements yet." />
                ) : announcements.map((a) => (
                  <div key={a._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge color={annTypeColor(a.type)}>{a.type}</Badge>
                        <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                      </div>
                      <button type="button" className="text-xs font-semibold text-red-600 hover:text-red-700 flex-shrink-0" onClick={() => deleteAnnouncement(a._id)}>Delete</button>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{a.body}</p>
                    <p className="mt-1.5 text-[10px] text-slate-400">{shortDate(a.createdAt)} — {a.createdBy?.name || 'Admin'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Log */}
          <div className="card p-5">
            <SectionHeader label="Security" title="Admin Activity Log" subtitle="All admin actions are recorded here" />
            <div className="mt-4 max-h-[540px] overflow-auto space-y-2 pr-1">
              {auditLog.length === 0 ? (
                <EmptyState icon="📋" message="No activity logged yet." />
              ) : auditLog.map((log) => (
                <div key={log._id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-brand-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-800">{log.action.replace(/_/g, ' ').toUpperCase()}</p>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{shortDate(log.createdAt)}</span>
                    </div>
                    {log.detail && <p className="text-xs text-slate-500 mt-0.5 truncate">{log.detail}</p>}
                    <p className="text-[10px] text-slate-400 mt-1">{log.admin?.email || 'Admin'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
         Modal: Farmer Detail
         ════════════════════════════════════════════════ */}
      {farmerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={() => setFarmerModal(null)}>
          <div className="card m-4 w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl text-slate-900">Farmer Details</h3>
              <button className="text-slate-400 hover:text-slate-600 text-lg transition-colors" onClick={() => setFarmerModal(null)}>✕</button>
            </div>

            {/* Profile header */}
            <div className="flex items-center gap-4 mb-5">
              <div className="h-14 w-14 rounded-full bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-700">
                {farmerModal.farmer.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-lg text-slate-900">{farmerModal.farmer.name}</p>
                <p className="text-sm text-slate-500">{farmerModal.farmer.email}</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Region</p>
                <p className="font-semibold text-slate-900 mt-0.5">{farmerModal.farmer.region || '—'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Status</p>
                <div className="mt-0.5"><Badge color={farmerModal.farmer.isActive ? 'green' : 'red'}>{farmerModal.farmer.isActive ? 'Active' : 'Blocked'}</Badge></div>
              </div>
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                <p className="text-[10px] uppercase tracking-wider text-emerald-600">Predictions</p>
                <p className="text-2xl font-bold text-emerald-700 mt-0.5">{farmerModal.predCount}</p>
              </div>
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
                <p className="text-[10px] uppercase tracking-wider text-blue-600">Chat Sessions</p>
                <p className="text-2xl font-bold text-blue-700 mt-0.5">{farmerModal.chatCount}</p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 mt-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Member Since</p>
              <p className="font-semibold text-slate-900 mt-0.5">{fmtDate(farmerModal.farmer.createdAt)}</p>
            </div>

            <button
              className={`w-full mt-4 rounded-xl py-2.5 text-sm font-semibold border transition-all ${
                farmerModal.farmer.isActive
                  ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
              type="button"
              onClick={() => { toggleFarmer(farmerModal.farmer); setFarmerModal(null); }}
            >
              {farmerModal.farmer.isActive ? 'Block this Farmer' : 'Activate this Farmer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
