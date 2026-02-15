import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../api/axiosClient';
import { useCart } from '../context/CartContext';

const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);

const MarketplacePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [cartNotice, setCartNotice] = useState({ text: '', type: 'success' });

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [lastOrder, setLastOrder] = useState(null);
  const cartSectionRef = useRef(null);
  const checkoutSectionRef = useRef(null);
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    paymentMode: 'cod'
  });

  const { items: cartItems, itemCount, totalAmount, addToCart, updateQuantity, removeFromCart, clearCart } = useCart();

  const loadProducts = async (options) => {
    const active = options || { query, category, sortBy };
    setProductsLoading(true);
    setProductsError('');

    try {
      const params = {
        page: 1,
        limit: 200,
        sort: active.sortBy || 'featured'
      };

      if (String(active.query || '').trim()) params.search = String(active.query).trim();
      if (active.category && active.category !== 'All') params.category = active.category;

      const { data } = await api.get('/products', { params });
      setProducts(Array.isArray(data.products) ? data.products : []);
      const apiCats = Array.isArray(data.categories) ? data.categories : [];
      setCategories(['All', ...apiCats.filter((c) => c && c !== 'All')]);
    } catch (err) {
      setProductsError(err.response?.data?.message || 'Failed to load marketplace products');
      setProducts([]);
      setCategories(['All']);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      loadProducts({ query, category, sortBy });
    }, 250);

    return () => window.clearTimeout(handle);
  }, [query, category, sortBy]);

  const cartQuantityById = useMemo(
    () =>
      cartItems.reduce((acc, item) => {
        acc[item.id] = item.quantity;
        return acc;
      }, {}),
    [cartItems]
  );

  const shippingFee = totalAmount === 0 ? 0 : totalAmount >= 5000 ? 0 : 79;
  const grandTotal = totalAmount + shippingFee;

  const handleAddToCart = (product) => {
    const result = addToCart(product);
    setCartNotice({ text: result.message, type: result.ok ? 'success' : 'error' });
  };

  const handleRemoveFromCart = (productId, name) => {
    removeFromCart(productId);
    setCartNotice({ text: `${name} removed from cart.`, type: 'success' });
  };

  const handleCheckoutOpen = () => {
    if (!cartItems.length) {
      setCartNotice({ text: 'Add products to cart before checkout.', type: 'error' });
      return;
    }

    setCheckoutError('');
    setCheckoutOpen(true);
    setLastOrder(null);
    window.setTimeout(() => {
      checkoutSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  const handleCartQuickOpen = () => {
    cartSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCheckoutChange = (event) => {
    const { name, value } = event.target;
    setCheckoutForm((current) => ({ ...current, [name]: value }));
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setCheckoutError('');

    const requiredFields = ['fullName', 'phone', 'addressLine', 'city', 'state', 'pincode'];
    const missing = requiredFields.find((field) => !String(checkoutForm[field]).trim());
    if (missing) {
      setCheckoutError('Please fill all required checkout fields.');
      return;
    }

    if (!/^\d{10}$/.test(checkoutForm.phone.trim())) {
      setCheckoutError('Phone number must be 10 digits.');
      return;
    }

    if (!/^\d{6}$/.test(checkoutForm.pincode.trim())) {
      setCheckoutError('Pincode must be 6 digits.');
      return;
    }

    setCheckoutLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));

      const orderId = `SAH-${Date.now()}`;
      setLastOrder({
        orderId,
        itemCount,
        grandTotal,
        placedAt: new Date().toLocaleString(),
        paymentMode: checkoutForm.paymentMode
      });

      clearCart();
      setCheckoutOpen(false);
      setCartNotice({ text: `Order placed successfully. Order ID: ${orderId}`, type: 'success' });
      setCheckoutForm({
        fullName: '',
        phone: '',
        addressLine: '',
        city: '',
        state: 'Tamil Nadu',
        pincode: '',
        paymentMode: 'cod'
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <section className="card p-5" ref={cartSectionRef}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.23em] text-emerald-700">Marketplace</p>
            <h2 className="font-display text-2xl font-bold text-slate-900">Agricultural Products Catalog</h2>
            <p className="mt-1 text-sm text-slate-600">
              Browse seeds, fertilizers, tools, machinery, IoT devices, and more in one farm marketplace.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Cart</p>
            <p className="text-xl font-bold text-emerald-900">{itemCount} items</p>
            <p className="text-xs text-emerald-700">Subtotal: {formatINR(totalAmount)}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
          <input
            className="input"
            placeholder="Search products, brands, or use-cases..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="stock">Highest Stock</option>
          </select>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{products.length}</span> products
        </p>

        {cartNotice.text ? (
          <p className={`mt-2 text-xs font-semibold ${cartNotice.type === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>
            {cartNotice.text}
          </p>
        ) : null}

        {productsLoading ? <p className="mt-2 text-xs font-semibold text-slate-500">Loading products...</p> : null}
        {productsError ? <p className="mt-2 text-xs font-semibold text-red-600">{productsError}</p> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((item) => {
          const inCartQty = cartQuantityById[item.id] || 0;
          const reachedStock = inCartQty >= item.stock;

          return (
            <article key={item.id} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-xl">
              <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-44 w-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(event) => {
                    event.currentTarget.src = `https://loremflickr.com/900/650/agriculture,${encodeURIComponent(item.category.toLowerCase())}?lock=${encodeURIComponent(`${item.id}-fallback`)}`;
                  }}
                />
              </div>

              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                    {item.category}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-bold text-slate-900">{item.name}</h3>
                </div>
                <span className="text-xs font-semibold text-amber-600">{item.rating} ★</span>
              </div>

              <p className="text-sm text-slate-600">{item.description}</p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Brand</p>
                  <p className="font-semibold">{item.brand}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Pack</p>
                  <p className="font-semibold">{item.unit}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Stock</p>
                  <p className="font-semibold">{item.stock} units</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Price</p>
                  <p className="font-semibold">{formatINR(item.price)}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  className="btn-primary w-full"
                  type="button"
                  disabled={reachedStock}
                  onClick={() => handleAddToCart(item)}
                >
                  {reachedStock
                    ? `Stock limit (${item.stock})`
                    : inCartQty
                      ? `Add More (${inCartQty})`
                      : 'Add to Cart'}
                </button>

                <button
                  className="btn-secondary w-full disabled:opacity-50"
                  type="button"
                  disabled={!inCartQty}
                  onClick={() => handleRemoveFromCart(item.id, item.name)}
                >
                  Remove
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.23em] text-slate-600">Cart details</p>
            <h3 className="font-display text-xl font-bold text-slate-900">Your selected products</h3>
          </div>
          {cartItems.length ? (
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary" type="button" onClick={clearCart}>
                Clear Cart
              </button>
              <button className="btn-primary" type="button" onClick={handleCheckoutOpen}>
                Checkout
              </button>
            </div>
          ) : null}
        </div>

        {!cartItems.length ? (
          <p className="mt-3 text-sm text-slate-500">Your cart is empty. Add products from the catalog.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[64px_1fr_auto_auto] md:items-center">
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover" />

                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-600">{item.brand} - {item.unit}</p>
                  <p className="text-xs text-slate-500">{formatINR(item.price)} each</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="h-8 w-8 rounded-lg border border-slate-300 bg-white text-slate-700"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="min-w-8 text-center text-sm font-semibold text-slate-800">{item.quantity}</span>
                  <button
                    type="button"
                    className="h-8 w-8 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-50"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                  >
                    +
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 md:justify-end">
                  <p className="text-sm font-bold text-slate-900">{formatINR(item.quantity * item.price)}</p>
                  <button type="button" className="text-xs font-semibold text-red-600" onClick={() => handleRemoveFromCart(item.id, item.name)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="space-y-1 border-t border-slate-200 pt-3 text-right text-sm">
              <p className="text-slate-700">Subtotal: <span className="font-semibold">{formatINR(totalAmount)}</span></p>
              <p className="text-slate-700">Shipping: <span className="font-semibold">{shippingFee ? formatINR(shippingFee) : 'Free'}</span></p>
              <p className="text-base text-slate-900">Total: <span className="font-bold">{formatINR(grandTotal)}</span></p>
            </div>
          </div>
        )}
      </section>

      {checkoutOpen && cartItems.length ? (
        <section className="card p-5" ref={checkoutSectionRef}>
          <p className="text-[10px] font-black uppercase tracking-[0.23em] text-slate-600">Checkout</p>
          <h3 className="font-display text-2xl font-bold text-slate-900">Delivery and payment</h3>

          <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handlePlaceOrder}>
            <input className="input" name="fullName" placeholder="Full name" value={checkoutForm.fullName} onChange={handleCheckoutChange} />
            <input className="input" name="phone" placeholder="Phone (10 digits)" value={checkoutForm.phone} onChange={handleCheckoutChange} />
            <input className="input md:col-span-2" name="addressLine" placeholder="Address" value={checkoutForm.addressLine} onChange={handleCheckoutChange} />
            <input className="input" name="city" placeholder="City" value={checkoutForm.city} onChange={handleCheckoutChange} />
            <input className="input" name="state" placeholder="State" value={checkoutForm.state} onChange={handleCheckoutChange} />
            <input className="input" name="pincode" placeholder="Pincode" value={checkoutForm.pincode} onChange={handleCheckoutChange} />

            <select className="input" name="paymentMode" value={checkoutForm.paymentMode} onChange={handleCheckoutChange}>
              <option value="cod">Cash on Delivery</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
            </select>

            {checkoutError ? <p className="text-sm text-red-600 md:col-span-2">{checkoutError}</p> : null}

            <div className="md:col-span-2 flex flex-wrap justify-end gap-2">
              <button className="btn-secondary" type="button" onClick={() => setCheckoutOpen(false)}>
                Cancel
              </button>
              <button className="btn-primary" type="submit" disabled={checkoutLoading}>
                {checkoutLoading ? 'Placing order...' : `Place Order (${formatINR(grandTotal)})`}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {lastOrder ? (
        <section className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900">
          <p className="text-xs font-bold uppercase tracking-wider">Order Confirmed</p>
          <p className="mt-1 text-sm">Order ID: <span className="font-semibold">{lastOrder.orderId}</span></p>
          <p className="text-sm">Items: <span className="font-semibold">{lastOrder.itemCount}</span></p>
          <p className="text-sm">Amount: <span className="font-semibold">{formatINR(lastOrder.grandTotal)}</span></p>
          <p className="text-sm">Payment: <span className="font-semibold uppercase">{lastOrder.paymentMode}</span></p>
          <p className="text-sm">Placed at: <span className="font-semibold">{lastOrder.placedAt}</span></p>
        </section>
      ) : null}

      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={handleCartQuickOpen}
          className="flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/35 hover:bg-emerald-700"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="9" cy="20" r="1.4" />
            <circle cx="18" cy="20" r="1.4" />
            <path d="M3 4h2l2.1 10.3a1 1 0 0 0 1 .7h9.8a1 1 0 0 0 1-.8L21 7H7" />
          </svg>
          <span>Cart</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{itemCount}</span>
        </button>

        <button
          type="button"
          onClick={handleCheckoutOpen}
          disabled={!cartItems.length}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          Quick Checkout
        </button>
      </div>

      {!products.length ? (
        <div className="card p-6 text-center text-slate-600">
          No products matched your search/filter. Try a different keyword or category.
        </div>
      ) : null}
    </div>
  );
};

export default MarketplacePage;
