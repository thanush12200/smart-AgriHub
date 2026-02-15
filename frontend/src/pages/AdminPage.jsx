import { useEffect, useState } from 'react';
import api from '../api/axiosClient';

const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value || 0));

const AdminPage = () => {
  const [farmers, setFarmers] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [chats, setChats] = useState([]);
  const [models, setModels] = useState([]);
  const [products, setProducts] = useState([]);
  const [productCats, setProductCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upload, setUpload] = useState({ name: 'crop_model', version: 'v2', metadata: '{"note":"latest"}', file: null });
  const [productForm, setProductForm] = useState({
    productCode: '',
    name: '',
    category: 'Seeds',
    brand: '',
    price: '',
    unit: 'unit',
    stock: 0,
    rating: 4.5,
    image: '',
    description: ''
  });
  const [productNotice, setProductNotice] = useState({ type: '', text: '' });
  const [imageEdit, setImageEdit] = useState({ code: '', value: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [farmersRes, predRes, chatsRes, modelsRes, productsRes] = await Promise.all([
        api.get('/admin/farmers'),
        api.get('/admin/predictions'),
        api.get('/admin/chat-logs'),
        api.get('/admin/models'),
        api.get('/admin/products')
      ]);

      setFarmers(farmersRes.data.farmers);
      setPredictions(predRes.data.logs);
      setChats(chatsRes.data.logs);
      setModels(modelsRes.data.models);
      setProducts(productsRes.data.products || []);
      setProductCats(productsRes.data.categories || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleFarmer = async (farmer) => {
    await api.patch(`/admin/farmers/${farmer._id}/status`, { isActive: !farmer.isActive });
    loadData();
  };

  const uploadModel = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('name', upload.name);
    formData.append('version', upload.version);
    formData.append('metadata', upload.metadata);
    if (upload.file) formData.append('modelFile', upload.file);

    await api.post('/admin/models/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    loadData();
  };

  const createProduct = async (event) => {
    event.preventDefault();
    setProductNotice({ type: '', text: '' });

    try {
      const payload = {
        productCode: productForm.productCode.trim() || undefined,
        name: productForm.name.trim(),
        category: productForm.category.trim(),
        brand: productForm.brand.trim(),
        price: Number(productForm.price),
        unit: productForm.unit.trim(),
        stock: Number(productForm.stock),
        rating: Number(productForm.rating),
        image: productForm.image.trim(),
        description: productForm.description.trim()
      };

      if (!payload.name || !payload.category || Number.isNaN(payload.price)) {
        setProductNotice({ type: 'error', text: 'Name, category, and price are required.' });
        return;
      }

      await api.post('/admin/products', payload);
      setProductNotice({ type: 'success', text: 'Product created successfully.' });
      setProductForm({
        productCode: '',
        name: '',
        category: 'Seeds',
        brand: '',
        price: '',
        unit: 'unit',
        stock: 0,
        rating: 4.5,
        image: '',
        description: ''
      });
      loadData();
    } catch (err) {
      setProductNotice({ type: 'error', text: err.response?.data?.message || 'Failed to create product.' });
    }
  };

  const updateProductStock = async (productCode, stock) => {
    setProductNotice({ type: '', text: '' });
    try {
      await api.patch(`/admin/products/${productCode}`, { stock: Math.max(0, Number(stock) || 0) });
      setProductNotice({ type: 'success', text: `Stock updated for ${productCode}.` });
      loadData();
    } catch (err) {
      setProductNotice({ type: 'error', text: err.response?.data?.message || 'Failed to update stock.' });
    }
  };

  const updateProductPrice = async (productCode, price) => {
    setProductNotice({ type: '', text: '' });
    try {
      const nextPrice = Math.max(0, Number(price) || 0);
      await api.patch(`/admin/products/${productCode}`, { price: nextPrice });
      setProductNotice({ type: 'success', text: `Price updated for ${productCode}.` });
      loadData();
    } catch (err) {
      setProductNotice({ type: 'error', text: err.response?.data?.message || 'Failed to update price.' });
    }
  };

  const toggleProductActive = async (product) => {
    setProductNotice({ type: '', text: '' });
    try {
      await api.patch(`/admin/products/${product.productCode}`, { isActive: !product.isActive });
      setProductNotice({ type: 'success', text: `${product.productCode} ${product.isActive ? 'deactivated' : 'activated'}.` });
      loadData();
    } catch (err) {
      setProductNotice({ type: 'error', text: err.response?.data?.message || 'Failed to update product status.' });
    }
  };

  const startEditImage = (product) => {
    setImageEdit({ code: product.productCode, value: product.image || '' });
    setProductNotice({ type: '', text: '' });
  };

  const cancelEditImage = () => {
    setImageEdit({ code: '', value: '' });
  };

  const saveEditImage = async () => {
    if (!imageEdit.code) return;
    setProductNotice({ type: '', text: '' });

    try {
      await api.patch(`/admin/products/${imageEdit.code}`, { image: imageEdit.value.trim() });
      setProductNotice({ type: 'success', text: `Image updated for ${imageEdit.code}.` });
      cancelEditImage();
      loadData();
    } catch (err) {
      setProductNotice({ type: 'error', text: err.response?.data?.message || 'Failed to update image.' });
    }
  };

  if (loading) return <div className="card p-5 text-slate-700">Loading admin controls...</div>;
  if (error) return <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">{error}</div>;

  return (
    <div className="space-y-5 animate-fadeIn">
      <section className="card p-5">
        <h2 className="font-display text-2xl font-bold text-slate-900">Manage Farmers</h2>
        <div className="mt-3 overflow-auto rounded-2xl border border-slate-200">
          <table className="min-w-full text-sm text-slate-800">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Region</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {farmers.map((farmer) => (
                <tr className="border-t border-slate-200 even:bg-slate-50" key={farmer._id}>
                  <td className="px-3 py-2 font-semibold text-slate-900">{farmer.name}</td>
                  <td className="px-3 py-2 text-slate-700">{farmer.email}</td>
                  <td className="px-3 py-2 text-slate-700">{farmer.region}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-black uppercase tracking-wide ${
                        farmer.isActive
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-red-200 bg-red-50 text-red-800'
                      }`}
                    >
                      {farmer.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="px-3 py-2"><button className="btn-secondary" onClick={() => toggleFarmer(farmer)} type="button">Toggle</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-display text-2xl font-bold text-slate-900">Upload ML Model</h2>
        <form className="mt-3 grid gap-2 md:grid-cols-4" onSubmit={uploadModel}>
          <input className="input" value={upload.name} onChange={(e) => setUpload({ ...upload, name: e.target.value })} placeholder="Model name" />
          <input className="input" value={upload.version} onChange={(e) => setUpload({ ...upload, version: e.target.value })} placeholder="Version" />
          <input className="input" value={upload.metadata} onChange={(e) => setUpload({ ...upload, metadata: e.target.value })} placeholder="Metadata JSON" />
          <input className="input" type="file" onChange={(e) => setUpload({ ...upload, file: e.target.files?.[0] || null })} />
          <button className="btn-primary md:col-span-4" type="submit">Upload</button>
        </form>
        <p className="mt-2 text-xs text-slate-500">Total registered models: {models.length}</p>
      </section>

      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.23em] text-emerald-700">Marketplace</p>
            <h2 className="font-display text-2xl font-bold text-slate-900">Products & Stock</h2>
            <p className="mt-1 text-sm text-slate-600">Add products and manipulate stock visible in the farmer marketplace.</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Products</p>
            <p className="text-xl font-bold text-emerald-900">{products.length}</p>
            <p className="text-xs text-emerald-700">Categories: {productCats.length}</p>
          </div>
        </div>

        <form className="mt-4 grid gap-3 lg:grid-cols-3" onSubmit={createProduct}>
          <input
            className="input"
            placeholder="Product code (optional)"
            value={productForm.productCode}
            onChange={(e) => setProductForm((p) => ({ ...p, productCode: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Name"
            value={productForm.name}
            onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Category (e.g. Seeds)"
            value={productForm.category}
            onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}
            required
          />

          <input
            className="input"
            placeholder="Brand"
            value={productForm.brand}
            onChange={(e) => setProductForm((p) => ({ ...p, brand: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Unit (e.g. 10 kg)"
            value={productForm.unit}
            onChange={(e) => setProductForm((p) => ({ ...p, unit: e.target.value }))}
          />
          <input
            className="input"
            type="number"
            placeholder="Price"
            value={productForm.price}
            onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
            required
          />

          <input
            className="input"
            type="number"
            placeholder="Stock"
            value={productForm.stock}
            onChange={(e) => setProductForm((p) => ({ ...p, stock: Number(e.target.value) }))}
          />
          <input
            className="input"
            type="number"
            step="0.1"
            placeholder="Rating (0-5)"
            value={productForm.rating}
            onChange={(e) => setProductForm((p) => ({ ...p, rating: Number(e.target.value) }))}
          />
          <input
            className="input lg:col-span-3"
            placeholder="Image URL (optional)"
            value={productForm.image}
            onChange={(e) => setProductForm((p) => ({ ...p, image: e.target.value }))}
          />
          <input
            className="input lg:col-span-3"
            placeholder="Short description"
            value={productForm.description}
            onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
          />

          {productNotice.text ? (
            <p className={`text-sm lg:col-span-3 ${productNotice.type === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>
              {productNotice.text}
            </p>
          ) : null}

          <button className="btn-primary lg:col-span-3" type="submit">Add Product</button>
        </form>

        <div className="mt-5 overflow-auto rounded-2xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Stock</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr className="border-t border-slate-200" key={product.productCode}>
                  <td className="px-3 py-2 font-mono text-xs">{product.productCode}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 rounded-xl object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(event) => {
                          event.currentTarget.src = `https://loremflickr.com/120/120/agriculture,${encodeURIComponent(String(product.category || 'farm').toLowerCase())}?lock=${encodeURIComponent(product.productCode)}`;
                        }}
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{product.name}</p>
                        <p className="truncate text-xs text-slate-500">{product.brand} {product.unit ? `| ${product.unit}` : ''}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
                            onClick={() => startEditImage(product)}
                          >
                            Change image
                          </button>
                          {imageEdit.code === product.productCode ? (
                            <span className="text-[11px] font-semibold text-slate-500">Editing...</span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {imageEdit.code === product.productCode ? (
                      <div className="mt-2 grid gap-2 md:grid-cols-[1fr_auto_auto]">
                        <input
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                          placeholder="Paste image URL"
                          value={imageEdit.value}
                          onChange={(e) => setImageEdit((current) => ({ ...current, value: e.target.value }))}
                        />
                        <button className="btn-primary" type="button" onClick={saveEditImage}>
                          Save
                        </button>
                        <button className="btn-secondary" type="button" onClick={cancelEditImage}>
                          Cancel
                        </button>
                      </div>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">{product.category}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <input
                        className="w-28 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                        type="number"
                        min={0}
                        defaultValue={product.price}
                        onBlur={(e) => updateProductPrice(product.productCode, e.target.value)}
                      />
                      <button
                        className="btn-secondary"
                        type="button"
                        onClick={() => updateProductPrice(product.productCode, Number(product.price) + 100)}
                      >
                        +100
                      </button>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">{formatINR(product.price)}</p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <input
                        className="w-24 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                        type="number"
                        defaultValue={product.stock}
                        min={0}
                        onBlur={(e) => updateProductStock(product.productCode, e.target.value)}
                      />
                      <button className="btn-secondary" type="button" onClick={() => updateProductStock(product.productCode, Number(product.stock) + 10)}>
                        +10
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2">{product.isActive ? 'Active' : 'Hidden'}</td>
                  <td className="px-3 py-2">
                    <button className="btn-secondary" type="button" onClick={() => toggleProductActive(product)}>
                      {product.isActive ? 'Hide' : 'Show'}
                    </button>
                  </td>
                </tr>
              ))}
              {!products.length ? (
                <tr>
                  <td className="px-3 py-4 text-slate-500" colSpan={7}>No products found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-display text-xl font-bold text-slate-900">Prediction Logs</h2>
          <div className="mt-2 max-h-64 overflow-auto text-xs">
            {predictions.map((item) => (
              <p key={item._id} className="mb-1 rounded border border-slate-200 bg-slate-50 p-2 text-slate-700">
                {item.type} | {item.user?.email} | confidence: {item.confidence}
              </p>
            ))}
          </div>
        </section>
        <section className="card p-5">
          <h2 className="font-display text-xl font-bold text-slate-900">Chat Logs</h2>
          <div className="mt-2 max-h-64 overflow-auto text-xs">
            {chats.map((item) => (
              <p key={item._id} className="mb-1 rounded border border-slate-200 bg-slate-50 p-2 text-slate-700">
                {item.user?.email}: {item.message}
              </p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPage;
