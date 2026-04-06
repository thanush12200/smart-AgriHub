import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useDocTitle from '../hooks/useDocTitle';
import api from '../api/axiosClient';
import AdminFarmersTab from '../components/admin/AdminFarmersTab';
import AdminLogsTab from '../components/admin/AdminLogsTab';
import AdminMarketplaceTab from '../components/admin/AdminMarketplaceTab';
import AdminModelsTab from '../components/admin/AdminModelsTab';
import AdminOverviewTab from '../components/admin/AdminOverviewTab';
import AdminSettingsTab from '../components/admin/AdminSettingsTab';
import FarmerDetailModal from '../components/admin/FarmerDetailModal';
import { fmtDate, TABS } from '../components/admin/AdminShared';

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

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Debounced re-fetch on search changes
  const farmerSearchRef = useRef(false);
  useEffect(() => {
    if (!farmerSearchRef.current) {
      farmerSearchRef.current = true;
      return;
    }
    const t = setTimeout(() => loadFarmers(), 300);
    return () => clearTimeout(t);
  }, [farmerSearch, farmerStatus, loadFarmers]);

  const chatSearchRef = useRef(false);
  useEffect(() => {
    if (!chatSearchRef.current) {
      chatSearchRef.current = true;
      return;
    }
    const t = setTimeout(() => loadChats(), 300);
    return () => clearTimeout(t);
  }, [chatSearch, loadChats]);

  /* ── Actions ──────────────────────────────────────── */
  const toggleFarmer = async (farmer) => {
    await api.patch(`/admin/farmers/${farmer._id}/status`, { isActive: !farmer.isActive });
    notify(`${farmer.name} ${farmer.isActive ? 'blocked' : 'activated'}`, farmer.isActive ? 'error' : 'success');
    loadFarmers();
    loadStats();
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
    fd.append('name', upload.name);
    fd.append('version', upload.version);
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
      if (!payload.name || !payload.category || Number.isNaN(payload.price)) {
        notify('Name, category, and price are required.', 'error');
        return;
      }
      await api.post('/admin/products', payload);
      notify('Product created');
      setProductForm({ productCode: '', name: '', category: 'Seeds', brand: '', price: '', unit: 'unit', stock: 0, rating: 4.5, image: '', description: '' });
      loadProducts();
      loadStats();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to create product', 'error');
    }
  };

  const saveInlineEdit = async (productCode) => {
    const updates = inlineEdit[productCode];
    if (!updates || !Object.keys(updates).length) return;
    try {
      await api.patch(`/admin/products/${productCode}`, updates);
      notify('Product updated');
      setInlineEdit((p) => {
        const next = { ...p };
        delete next[productCode];
        return next;
      });
      loadProducts();
    } catch (err) {
      notify(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  const updateInlineField = (code, field, value) => {
    setInlineEdit((p) => ({ ...p, [code]: { ...p[code], [field]: value } }));
  };

  const updateProductStock = async (code, stock) => {
    await api.patch(`/admin/products/${code}`, { stock: Math.max(0, Number(stock) || 0) });
    notify('Stock updated');
    loadProducts();
  };

  const updateProductPrice = async (code, price) => {
    await api.patch(`/admin/products/${code}`, { price: Math.max(0, Number(price) || 0) });
    notify('Price updated');
    loadProducts();
  };

  const toggleProductActive = async (product) => {
    await api.patch(`/admin/products/${product.productCode}`, { isActive: !product.isActive });
    notify(`${product.name} ${product.isActive ? 'hidden' : 'shown'}`);
    loadProducts();
  };

  const deleteProduct = async (code) => {
    if (!window.confirm('Permanently delete this product?')) return;
    await api.delete(`/admin/products/${code}`);
    notify('Product deleted');
    loadProducts();
    loadStats();
  };

  const createAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/announcements', annForm);
      notify('Announcement published');
      setAnnForm({ title: '', body: '', type: 'info' });
      const { data } = await api.get('/admin/announcements');
      setAnnouncements(data.announcements);
    } catch (err) {
      notify(err.response?.data?.message || 'Failed', 'error');
    }
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
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 animate-fadeIn">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-surface-200 border-t-brand-500" />
        <p className="text-sm font-medium text-slate-500">Loading admin panel…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-200 bg-red-50 p-6 text-center animate-fadeIn">
        <p className="font-semibold text-red-600">{error}</p>
        <button className="btn-secondary mt-3" onClick={loadAll}>Retry</button>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════ */
  return (
    <div className="space-y-6 animate-fadeIn">
      <section className="page-hero">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="page-kicker">Administration</p>
            <h1 className="page-title">Control Panel</h1>
            <p className="page-copy">Manage your platform across farmers, marketplace inventory, ML models, announcements, and operational logs.</p>
          </div>
          <div className="rounded-[28px] border border-white/70 bg-white/72 px-5 py-4 shadow-sm backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Admin Scope</p>
            <p className="mt-2 text-lg font-bold text-slate-950">{TABS.length} workspaces</p>
            <p className="mt-1 text-sm text-slate-500">Operations, inventory, ML, audit, and broadcast controls</p>
          </div>
        </div>
      </section>

      {notice.text && (
        <div className={`animate-fadeIn rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
          notice.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
        }`}>
          {notice.text}
        </div>
      )}

      <div className="flex gap-1 overflow-x-auto rounded-[28px] border border-white/80 bg-white/70 p-1.5 shadow-sm backdrop-blur-xl">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-3 text-xs font-semibold transition-all ${
              tab === t.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
            }`}
          >
            <span className="text-sm">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && <AdminOverviewTab stats={stats} lowStockProducts={lowStockProducts} predAnalytics={predAnalytics} />}

      {tab === 'farmers' && (
        <AdminFarmersTab
          farmers={farmers}
          farmerSearch={farmerSearch}
          setFarmerSearch={setFarmerSearch}
          farmerStatus={farmerStatus}
          setFarmerStatus={setFarmerStatus}
          exportFarmersCSV={exportFarmersCSV}
          openFarmerModal={openFarmerModal}
          toggleFarmer={toggleFarmer}
        />
      )}

      {tab === 'marketplace' && (
        <AdminMarketplaceTab
          productForm={productForm}
          setProductForm={setProductForm}
          createProduct={createProduct}
          products={products}
          lowStockProducts={lowStockProducts}
          inlineEdit={inlineEdit}
          setInlineEdit={setInlineEdit}
          updateInlineField={updateInlineField}
          updateProductPrice={updateProductPrice}
          updateProductStock={updateProductStock}
          toggleProductActive={toggleProductActive}
          saveInlineEdit={saveInlineEdit}
          deleteProduct={deleteProduct}
        />
      )}

      {tab === 'models' && (
        <AdminModelsTab
          upload={upload}
          setUpload={setUpload}
          uploadModel={uploadModel}
          models={models}
          modelStatusColor={modelStatusColor}
          changeModelStatus={changeModelStatus}
        />
      )}

      {tab === 'logs' && <AdminLogsTab predictions={predictions} chats={chats} chatSearch={chatSearch} setChatSearch={setChatSearch} />}

      {tab === 'settings' && (
        <AdminSettingsTab
          annForm={annForm}
          setAnnForm={setAnnForm}
          createAnnouncement={createAnnouncement}
          announcements={announcements}
          annTypeColor={annTypeColor}
          deleteAnnouncement={deleteAnnouncement}
          auditLog={auditLog}
        />
      )}

      <FarmerDetailModal farmerModal={farmerModal} setFarmerModal={setFarmerModal} toggleFarmer={toggleFarmer} />
    </div>
  );
};

export default AdminPage;
