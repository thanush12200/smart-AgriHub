import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '../api/axiosClient';

/* ── Helpers ──────────────────────────────────────────── */
const formatINR = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(v || 0));

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const Badge = ({ children, color = 'slate' }) => {
  const cls = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  }[color] || 'bg-slate-100 text-slate-600 border-slate-200';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
};

const StatCard = ({ label, value, sub, color = 'slate', icon }) => {
  const ring = { green: 'border-emerald-200 bg-emerald-50', amber: 'border-amber-200 bg-amber-50', blue: 'border-blue-200 bg-blue-50', red: 'border-red-200 bg-red-50', purple: 'border-purple-200 bg-purple-50', slate: 'border-slate-200 bg-slate-50' }[color];
  const text = { green: 'text-emerald-700', amber: 'text-amber-700', blue: 'text-blue-700', red: 'text-red-700', purple: 'text-purple-700', slate: 'text-slate-700' }[color];
  return (
    <div className={`rounded-2xl border p-4 ${ring}`}>
      <div className="flex items-center justify-between">
        <p className={`text-[10px] font-black uppercase tracking-widest ${text}`}>{label}</p>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <p className={`mt-1 text-3xl font-bold ${text}`}>{value ?? '—'}</p>
      {sub && <p className={`mt-1 text-xs ${text} opacity-75`}>{sub}</p>}
    </div>
  );
};

const TABS = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'farmers', label: '👨‍🌾 Farmers' },
  { id: 'marketplace', label: '🛒 Marketplace' },
  { id: 'models', label: '🤖 ML Models' },
  { id: 'logs', label: '📋 Logs' },
  { id: 'settings', label: '📢 Settings' },
];

/* ═══════════════════════════════════════════════════════ */
/*  Main Component                                         */
/* ═══════════════════════════════════════════════════════ */
const AdminPage = () => {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [farmerSearch, setFarmerSearch] = useState('');
  const [farmerStatus, setFarmerStatus] = useState('all');
  const [farmerModal, setFarmerModal] = useState(null); // { farmer, predCount, chatCount }
  const [predictions, setPredictions] = useState([]);
  const [predAnalytics, setPredAnalytics] = useState(null);
  const [chats, setChats] = useState([]);
  const [chatSearch, setChatSearch] = useState('');
  const [models, setModels] = useState([]);
  const [products, setProducts] = useState([]);
  const [productCats, setProductCats] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState({ text: '', type: '' });

  // ML upload
  const [upload, setUpload] = useState({ name: 'crop_model', version: 'v2', metadata: '{"note":"latest"}', file: null });
  // Product form
  const [productForm, setProductForm] = useState({ productCode: '', name: '', category: 'Seeds', brand: '', price: '', unit: 'unit', stock: 0, rating: 4.5, image: '', description: '' });
  // Inline edits
  const [inlineEdit, setInlineEdit] = useState({}); // { [productCode]: { field: value } }
  // Announcement form
  const [annForm, setAnnForm] = useState({ title: '', body: '', type: 'info' });

  const notify = useCallback((text, type = 'success') => {
    setNotice({ text, type });
    setTimeout(() => setNotice({ text: '', type: '' }), 4000);
  }, []);

  /* ── Data loaders ─────────────────────────────────────── */
  const loadStats = useCallback(async () => {
    const { data } = await api.get('/admin/stats');
    setStats(data);
  }, []);

  const loadFarmers = useCallback(async () => {
    const params = {};
    if (farmerSearch.trim()) params.search = farmerSearch.trim();
    if (farmerStatus !== 'all') params.status = farmerStatus;
    const { data } = await api.get('/admin/farmers', { params });
    setFarmers(data.farmers);
  }, [farmerSearch, farmerStatus]);

  const loadProducts = useCallback(async () => {
    const { data } = await api.get('/admin/products');
    setProducts(data.products || []);
    setProductCats(data.categories || []);
  }, []);

  const loadChats = useCallback(async () => {
    const params = chatSearch.trim() ? { search: chatSearch.trim() } : {};
    const { data } = await api.get('/admin/chat-logs', { params });
    setChats(data.logs);
  }, [chatSearch]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [predRes, modelsRes, annRes, auditRes, analyticsRes] = await Promise.all([
        api.get('/admin/predictions'),
        api.get('/admin/models'),
        api.get('/admin/announcements'),
        api.get('/admin/audit-log'),
        api.get('/admin/predictions/analytics'),
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

  // Re-fetch farmers on search/filter change
  const farmerSearchRef = useRef(false);
  useEffect(() => {
    if (!farmerSearchRef.current) { farmerSearchRef.current = true; return; }
    const t = setTimeout(() => loadFarmers(), 300);
    return () => clearTimeout(t);
  }, [farmerSearch, farmerStatus]);

  // Re-fetch chats on search change
  const chatSearchRef = useRef(false);
  useEffect(() => {
    if (!chatSearchRef.current) { chatSearchRef.current = true; return; }
    const t = setTimeout(() => loadChats(), 300);
    return () => clearTimeout(t);
  }, [chatSearch]);

  /* ── Actions ──────────────────────────────────────────── */
  const toggleFarmer = async (farmer) => {
    await api.patch(`/admin/farmers/${farmer._id}/status`, { isActive: !farmer.isActive });
    notify(`${farmer.name} ${farmer.isActive ? 'blocked' : 'activated'}.`, farmer.isActive ? 'error' : 'success');
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
    const a = document.createElement('a'); a.href = url; a.download = 'farmers.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const uploadModel = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', upload.name); fd.append('version', upload.version);
    fd.append('metadata', upload.metadata);
    if (upload.file) fd.append('modelFile', upload.file);
    await api.post('/admin/models/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    notify('Model uploaded.');
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
      notify('Product created.');
      setProductForm({ productCode: '', name: '', category: 'Seeds', brand: '', price: '', unit: 'unit', stock: 0, rating: 4.5, image: '', description: '' });
      loadProducts(); loadStats();
    } catch (err) { notify(err.response?.data?.message || 'Failed to create product.', 'error'); }
  };

  const saveInlineEdit = async (productCode) => {
    const updates = inlineEdit[productCode];
    if (!updates || !Object.keys(updates).length) return;
    try {
      await api.patch(`/admin/products/${productCode}`, updates);
      notify('Product updated.');
      setInlineEdit((p) => { const next = { ...p }; delete next[productCode]; return next; });
      loadProducts();
    } catch (err) { notify(err.response?.data?.message || 'Failed to update.', 'error'); }
  };

  const updateInlineField = (productCode, field, value) => {
    setInlineEdit((p) => ({ ...p, [productCode]: { ...p[productCode], [field]: value } }));
  };

  const updateProductStock = async (productCode, stock) => {
    await api.patch(`/admin/products/${productCode}`, { stock: Math.max(0, Number(stock) || 0) });
    notify(`Stock updated.`); loadProducts();
  };

  const updateProductPrice = async (productCode, price) => {
    await api.patch(`/admin/products/${productCode}`, { price: Math.max(0, Number(price) || 0) });
    notify(`Price updated.`); loadProducts();
  };

  const toggleProductActive = async (product) => {
    await api.patch(`/admin/products/${product.productCode}`, { isActive: !product.isActive });
    notify(`${product.productCode} ${product.isActive ? 'hidden' : 'shown'}.`);
    loadProducts();
  };

  const deleteProduct = async (productCode) => {
    if (!window.confirm('Permanently delete this product?')) return;
    await api.delete(`/admin/products/${productCode}`);
    notify('Product deleted.'); loadProducts(); loadStats();
  };

  const createAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/announcements', annForm);
      notify('Announcement published.');
      setAnnForm({ title: '', body: '', type: 'info' });
      const { data } = await api.get('/admin/announcements');
      setAnnouncements(data.announcements);
    } catch (err) { notify(err.response?.data?.message || 'Failed.', 'error'); }
  };

  const deleteAnnouncement = async (id) => {
    await api.delete(`/admin/announcements/${id}`);
    notify('Announcement deleted.');
    const { data } = await api.get('/admin/announcements');
    setAnnouncements(data.announcements);
  };

  /* ── Derived ──────────────────────────────────────────── */
  const lowStockProducts = useMemo(() => products.filter((p) => p.isActive && p.stock < 10), [products]);

  const modelStatusColor = (s) => ({ deployed: 'green', staging: 'amber', archived: 'slate' }[s] || 'slate');

  const annTypeColor = (t) => ({ info: 'blue', warning: 'amber', success: 'green', alert: 'red' }[t] || 'blue');

  /* ── Render ───────────────────────────────────────────── */
  if (loading) return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      <p className="text-sm font-semibold">Loading admin panel…</p>
    </div>
  );
  if (error) return <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">{error}</div>;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Global notice */}
      {notice.text && (
        <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${notice.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
          {notice.text}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 min-w-[100px] rounded-xl px-3 py-2 text-xs font-semibold transition-all ${tab === t.id ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ───────────────────────────────────────── */}
      {tab === 'overview' && stats && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard label="Total Farmers" value={stats.farmers.total} sub={`${stats.farmers.newThisWeek} new this week`} color="green" icon="👨‍🌾" />
            <StatCard label="Active Farmers" value={stats.farmers.active} color="green" icon="✅" />
            <StatCard label="Blocked" value={stats.farmers.blocked} color="red" icon="🚫" />
            <StatCard label="Products" value={stats.products.active} sub={`${stats.products.lowStock} low stock`} color="blue" icon="🛒" />
            <StatCard label="Predictions" value={stats.predictions.total} sub={`${stats.predictions.thisWeek} this week`} color="purple" icon="🤖" />
            <StatCard label="Chats" value={stats.chats.total} sub={`${stats.chats.thisWeek} this week`} color="amber" icon="💬" />
          </div>

          {/* Low Stock Alert */}
          {lowStockProducts.length > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-red-600">⚠️ Low Stock Alert</p>
              <p className="mt-1 text-sm text-red-700">{lowStockProducts.length} products have fewer than 10 units remaining.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {lowStockProducts.map((p) => (
                  <span key={p.productCode} className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                    {p.name} ({p.stock})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Prediction breakdown */}
          {predAnalytics && predAnalytics.byType.length > 0 && (
            <div className="card p-5">
              <p className="section-label">Prediction Breakdown</p>
              <h3 className="section-title text-xl mt-1">By Type</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {predAnalytics.byType.map((item) => (
                  <div key={item._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item._id}</p>
                    <p className="text-2xl font-bold text-slate-900">{item.count}</p>
                    <p className="text-xs text-slate-500">Avg confidence: {item.avgConfidence ? (item.avgConfidence * 100).toFixed(0) + '%' : '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FARMERS ────────────────────────────────────────── */}
      {tab === 'farmers' && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="section-label">Farmer Management</p>
                <h2 className="section-title">All Farmers ({farmers.length})</h2>
              </div>
              <button className="btn-secondary" type="button" onClick={exportFarmersCSV}>⬇ Export CSV</button>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_200px]">
              <input className="input" placeholder="Search by name, email, region..." value={farmerSearch} onChange={(e) => setFarmerSearch(e.target.value)} />
              <select className="input" value={farmerStatus} onChange={(e) => setFarmerStatus(e.target.value)}>
                <option value="all">All statuses</option>
                <option value="active">Active only</option>
                <option value="blocked">Blocked only</option>
              </select>
            </div>

            <div className="mt-4 overflow-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-sm text-slate-800">
                <thead className="bg-slate-100 text-left text-slate-600 text-xs">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Region</th>
                    <th className="px-3 py-2">Joined</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {farmers.map((f) => (
                    <tr key={f._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 font-semibold text-slate-900">{f.name}</td>
                      <td className="px-3 py-2 text-slate-600">{f.email}</td>
                      <td className="px-3 py-2 text-slate-600">{f.region || '—'}</td>
                      <td className="px-3 py-2 text-xs text-slate-500">{fmtDate(f.createdAt)}</td>
                      <td className="px-3 py-2">
                        <Badge color={f.isActive ? 'green' : 'red'}>{f.isActive ? 'Active' : 'Blocked'}</Badge>
                      </td>
                      <td className="px-3 py-2 flex items-center gap-2">
                        <button className="btn-secondary text-xs px-3 py-1.5" type="button" onClick={() => openFarmerModal(f)}>View</button>
                        <button
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition-colors ${f.isActive ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                          type="button"
                          onClick={() => toggleFarmer(f)}
                        >
                          {f.isActive ? 'Block' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!farmers.length && <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-400">No farmers found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MARKETPLACE ────────────────────────────────────── */}
      {tab === 'marketplace' && (
        <div className="space-y-5">
          {/* Add product */}
          <div className="card p-5">
            <p className="section-label">Marketplace</p>
            <h2 className="section-title">Add New Product</h2>
            <form className="mt-4 grid gap-3 lg:grid-cols-3" onSubmit={createProduct}>
              <input className="input" placeholder="Product code (auto if blank)" value={productForm.productCode} onChange={(e) => setProductForm((p) => ({ ...p, productCode: e.target.value }))} />
              <input className="input" placeholder="Name *" value={productForm.name} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))} required />
              <input className="input" placeholder="Category *" value={productForm.category} onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))} required />
              <input className="input" placeholder="Brand" value={productForm.brand} onChange={(e) => setProductForm((p) => ({ ...p, brand: e.target.value }))} />
              <input className="input" placeholder="Unit (e.g. 10 kg)" value={productForm.unit} onChange={(e) => setProductForm((p) => ({ ...p, unit: e.target.value }))} />
              <input className="input" type="number" placeholder="Price *" value={productForm.price} onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))} required />
              <input className="input" type="number" placeholder="Stock" value={productForm.stock} onChange={(e) => setProductForm((p) => ({ ...p, stock: Number(e.target.value) }))} />
              <input className="input" type="number" step="0.1" placeholder="Rating (0–5)" value={productForm.rating} onChange={(e) => setProductForm((p) => ({ ...p, rating: Number(e.target.value) }))} />
              <input className="input" placeholder="Image URL" value={productForm.image} onChange={(e) => setProductForm((p) => ({ ...p, image: e.target.value }))} />
              <input className="input lg:col-span-3" placeholder="Description" value={productForm.description} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} />
              <button className="btn-primary lg:col-span-3" type="submit">Add Product</button>
            </form>
          </div>

          {/* Products table */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-xl font-bold text-slate-900">Products ({products.length})</h3>
              {lowStockProducts.length > 0 && (
                <Badge color="red">⚠ {lowStockProducts.length} low stock</Badge>
              )}
            </div>
            <div className="overflow-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-100 text-left text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Product</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Brand</th>
                    <th className="px-3 py-2">Price (₹)</th>
                    <th className="px-3 py-2">Stock</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => {
                    const isLow = product.isActive && product.stock < 10;
                    const edit = inlineEdit[product.productCode] || {};
                    const isEditing = !!Object.keys(edit).length;
                    return (
                      <tr key={product.productCode} className={`hover:bg-slate-50 transition-colors ${isLow ? 'bg-red-50/40' : ''}`}>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2 min-w-[180px]">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-9 w-9 rounded-lg object-cover flex-shrink-0"
                              loading="lazy"
                              onError={(e) => { e.currentTarget.src = `https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=80&h=80&fit=crop`; }}
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
                          {isEditing && edit.image !== undefined && (
                            <div className="mt-1">
                              <input className="w-full rounded border border-slate-300 px-2 py-1 text-xs" placeholder="Image URL" value={edit.image} onChange={(e) => updateInlineField(product.productCode, 'image', e.target.value)} />
                            </div>
                          )}
                          {isEditing && edit.description !== undefined && (
                            <div className="mt-1">
                              <input className="w-full rounded border border-slate-300 px-2 py-1 text-xs" placeholder="Description" value={edit.description} onChange={(e) => updateInlineField(product.productCode, 'description', e.target.value)} />
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {isEditing && edit.category !== undefined ? (
                            <input className="w-24 rounded border border-slate-300 px-2 py-1 text-xs" value={edit.category} onChange={(e) => updateInlineField(product.productCode, 'category', e.target.value)} />
                          ) : product.category}
                        </td>
                        <td className="px-3 py-2">
                          {isEditing && edit.brand !== undefined ? (
                            <input className="w-24 rounded border border-slate-300 px-2 py-1 text-xs" value={edit.brand} onChange={(e) => updateInlineField(product.productCode, 'brand', e.target.value)} />
                          ) : product.brand}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <input
                              className="w-20 rounded border border-slate-300 px-2 py-1 text-xs"
                              type="number"
                              defaultValue={product.price}
                              onBlur={(e) => updateProductPrice(product.productCode, e.target.value)}
                            />
                            <button className="rounded bg-slate-100 px-1.5 py-1 text-[10px] text-slate-600 hover:bg-slate-200" type="button" onClick={() => updateProductPrice(product.productCode, product.price + 100)}>+₹100</button>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <input
                              className={`w-14 rounded border px-2 py-1 text-xs ${isLow ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
                              type="number"
                              defaultValue={product.stock}
                              min={0}
                              onBlur={(e) => updateProductStock(product.productCode, e.target.value)}
                            />
                            <button className="rounded bg-slate-100 px-1.5 py-1 text-[10px] text-slate-600 hover:bg-slate-200" type="button" onClick={() => updateProductStock(product.productCode, product.stock + 10)}>+10</button>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <Badge color={product.isActive ? 'green' : 'slate'}>{product.isActive ? 'Active' : 'Hidden'}</Badge>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {!isEditing ? (
                              <button className="rounded bg-blue-50 border border-blue-200 px-2 py-1 text-[10px] font-semibold text-blue-700 hover:bg-blue-100" type="button"
                                onClick={() => setInlineEdit((p) => ({ ...p, [product.productCode]: { name: product.name, category: product.category, brand: product.brand, image: product.image ?? '', description: product.description ?? '' } }))}>
                                ✏ Edit
                              </button>
                            ) : (
                              <>
                                <button className="rounded bg-emerald-50 border border-emerald-200 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100" type="button" onClick={() => saveInlineEdit(product.productCode)}>✓ Save</button>
                                <button className="rounded bg-slate-50 border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-100" type="button" onClick={() => setInlineEdit((p) => { const n = { ...p }; delete n[product.productCode]; return n; })}>✕</button>
                              </>
                            )}
                            <button className={`rounded px-2 py-1 text-[10px] font-semibold border transition-colors ${product.isActive ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                              type="button" onClick={() => toggleProductActive(product)}>
                              {product.isActive ? 'Hide' : 'Show'}
                            </button>
                            <button className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-700 hover:bg-red-100" type="button" onClick={() => deleteProduct(product.productCode)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!products.length && <tr><td colSpan={7} className="px-3 py-6 text-center text-slate-400">No products found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── ML MODELS ──────────────────────────────────────── */}
      {tab === 'models' && (
        <div className="space-y-5">
          <div className="card p-5">
            <p className="section-label">ML Models</p>
            <h2 className="section-title">Upload New Model</h2>
            <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={uploadModel}>
              <input className="input" value={upload.name} onChange={(e) => setUpload({ ...upload, name: e.target.value })} placeholder="Model name" />
              <input className="input" value={upload.version} onChange={(e) => setUpload({ ...upload, version: e.target.value })} placeholder="Version" />
              <input className="input" value={upload.metadata} onChange={(e) => setUpload({ ...upload, metadata: e.target.value })} placeholder='Metadata JSON' />
              <input className="input" type="file" onChange={(e) => setUpload({ ...upload, file: e.target.files?.[0] || null })} />
              <button className="btn-primary md:col-span-4" type="submit">Upload Model</button>
            </form>
          </div>

          <div className="card p-5">
            <h3 className="font-display text-xl font-bold text-slate-900 mb-3">Registered Models ({models.length})</h3>
            <div className="overflow-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-left text-xs text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Version</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Uploaded By</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {models.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-semibold text-slate-900">{m.name}</td>
                      <td className="px-3 py-2 font-mono text-xs text-slate-600">{m.version}</td>
                      <td className="px-3 py-2"><Badge color={modelStatusColor(m.status)}>{m.status}</Badge></td>
                      <td className="px-3 py-2 text-slate-600">{m.uploadedBy?.name || '—'}</td>
                      <td className="px-3 py-2 text-xs text-slate-500">{fmtDate(m.createdAt)}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          {['staging', 'deployed', 'archived'].filter((s) => s !== m.status).map((s) => (
                            <button key={s} type="button"
                              className={`rounded px-2 py-1 text-[10px] font-semibold border transition-colors ${
                                s === 'deployed' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' :
                                s === 'archived' ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100' :
                                'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                              }`}
                              onClick={() => changeModelStatus(m, s)}
                            >→ {s}</button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!models.length && <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-400">No models registered.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── LOGS ───────────────────────────────────────────── */}
      {tab === 'logs' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="card p-5">
            <p className="section-label">Predictions</p>
            <h3 className="section-title text-xl mt-1">Prediction Logs ({predictions.length})</h3>
            <div className="mt-3 max-h-[520px] overflow-auto space-y-2">
              {predictions.map((item) => (
                <div key={item._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge color={item.type === 'crop' ? 'green' : item.type === 'fertilizer' ? 'blue' : 'purple'}>{item.type}</Badge>
                    <span className="text-[10px] text-slate-400">{fmtDate(item.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-700">{item.user?.email || 'unknown'}</p>
                  {item.confidence != null && (
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                        <span>Confidence</span><span>{(item.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-200">
                        <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${(item.confidence * 100).toFixed(0)}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {!predictions.length && <p className="text-sm text-slate-400 py-4 text-center">No prediction logs yet.</p>}
            </div>
          </div>

          <div className="card p-5">
            <p className="section-label">Chatbot</p>
            <h3 className="section-title text-xl mt-1">Chat Logs ({chats.length})</h3>
            <input className="input mt-3" placeholder="Search messages..." value={chatSearch} onChange={(e) => setChatSearch(e.target.value)} />
            <div className="mt-3 max-h-[460px] overflow-auto space-y-2">
              {chats.map((item) => (
                <div key={item._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-700">{item.user?.email || 'unknown'}</p>
                    <span className="text-[10px] text-slate-400">{fmtDate(item.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600"><span className="font-semibold text-slate-800">Q:</span> {item.message}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2"><span className="font-semibold">A:</span> {item.response}</p>
                  <div className="mt-1 flex gap-2">
                    <Badge color="slate">{item.source}</Badge>
                    {item.confidence != null && <span className="text-[10px] text-slate-500">conf: {(item.confidence * 100).toFixed(0)}%</span>}
                  </div>
                </div>
              ))}
              {!chats.length && <p className="text-sm text-slate-400 py-4 text-center">No chat logs found.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS ───────────────────────────────────────── */}
      {tab === 'settings' && (
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Announcements */}
          <div className="space-y-4">
            <div className="card p-5">
              <p className="section-label">Communication</p>
              <h2 className="section-title">Broadcast Announcement</h2>
              <form className="mt-4 space-y-3" onSubmit={createAnnouncement}>
                <input className="input" placeholder="Title *" value={annForm.title} onChange={(e) => setAnnForm((p) => ({ ...p, title: e.target.value }))} required />
                <textarea className="input min-h-[80px] resize-none" placeholder="Body / message..." value={annForm.body} onChange={(e) => setAnnForm((p) => ({ ...p, body: e.target.value }))} required />
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
              <h3 className="font-display text-xl font-bold text-slate-900 mb-3">Announcements ({announcements.length})</h3>
              <div className="space-y-2 max-h-64 overflow-auto">
                {announcements.map((a) => (
                  <div key={a._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge color={annTypeColor(a.type)}>{a.type}</Badge>
                        <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                      </div>
                      <button type="button" className="text-xs font-semibold text-red-600 hover:text-red-700 flex-shrink-0" onClick={() => deleteAnnouncement(a._id)}>Delete</button>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{a.body}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{fmtDate(a.createdAt)} — {a.createdBy?.name || 'Admin'}</p>
                  </div>
                ))}
                {!announcements.length && <p className="text-sm text-slate-400 py-2 text-center">No announcements yet.</p>}
              </div>
            </div>
          </div>

          {/* Audit Log */}
          <div className="card p-5">
            <p className="section-label">Security</p>
            <h2 className="section-title">Admin Activity Log</h2>
            <div className="mt-4 max-h-[520px] overflow-auto space-y-2">
              {auditLog.map((log) => (
                <div key={log._id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800">{log.action.replace(/_/g, ' ').toUpperCase()}</p>
                    {log.detail && <p className="text-xs text-slate-500 mt-0.5 truncate">{log.detail}</p>}
                    <p className="text-[10px] text-slate-400 mt-1">{log.admin?.email || 'Admin'} · {fmtDate(log.createdAt)}</p>
                  </div>
                </div>
              ))}
              {!auditLog.length && <p className="text-sm text-slate-400 py-4 text-center">No activity logged yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Farmer Detail Modal */}
      {farmerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setFarmerModal(null)}>
          <div className="card m-4 w-full max-w-md p-6 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-slate-900">Farmer Profile</h3>
              <button className="text-slate-400 hover:text-slate-600 text-lg" onClick={() => setFarmerModal(null)}>✕</button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-xl font-bold text-emerald-700">
                  {farmerModal.farmer.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{farmerModal.farmer.name}</p>
                  <p className="text-sm text-slate-500">{farmerModal.farmer.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Region</p>
                  <p className="font-semibold text-slate-900">{farmerModal.farmer.region || '—'}</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Status</p>
                  <Badge color={farmerModal.farmer.isActive ? 'green' : 'red'}>{farmerModal.farmer.isActive ? 'Active' : 'Blocked'}</Badge>
                </div>
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-600">Predictions Made</p>
                  <p className="text-2xl font-bold text-emerald-700">{farmerModal.predCount}</p>
                </div>
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-blue-600">Chats Sent</p>
                  <p className="text-2xl font-bold text-blue-700">{farmerModal.chatCount}</p>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Joined</p>
                <p className="font-semibold text-slate-900">{fmtDate(farmerModal.farmer.createdAt)}</p>
              </div>
              <button
                className={`w-full mt-2 rounded-xl py-2.5 text-sm font-semibold border transition-colors ${farmerModal.farmer.isActive ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                type="button"
                onClick={() => { toggleFarmer(farmerModal.farmer); setFarmerModal(null); }}
              >
                {farmerModal.farmer.isActive ? 'Block this Farmer' : 'Activate this Farmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
