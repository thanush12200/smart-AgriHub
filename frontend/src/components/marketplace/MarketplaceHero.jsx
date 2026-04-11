import { Suspense, lazy } from 'react';
import { formatINR } from '../../utils/formatINR';

const MarketCrateScene = lazy(() => import('../3d/MarketCrateScene'));

const MarketplaceHero = ({
  sectionRef,
  itemCount,
  totalAmount,
  query,
  setQuery,
  categories,
  category,
  setCategory,
  sortBy,
  setSortBy,
  productsLength,
  cartNotice,
  productsLoading,
  productsError,
}) => (
  <section ref={sectionRef}>
    <div
      className="relative overflow-hidden rounded-[32px]"
      style={{
        background: 'linear-gradient(160deg, #071510 0%, #0a1e14 60%, #0e2818 100%)',
        border: '1px solid rgba(41,160,100,0.2)',
        minHeight: 260,
      }}
    >
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <MarketCrateScene className="w-full h-full" />
        </Suspense>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6 p-6 md:p-8 lg:flex-row lg:items-end lg:justify-between min-h-[260px]">
        <div className="flex flex-col justify-end">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 w-fit"
            style={{ background: 'rgba(41,160,100,0.15)', border: '1px solid rgba(41,160,100,0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#7ad5a0' }}>
              Marketplace
            </span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white leading-tight tracking-tight">
            Agricultural Products Catalog
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-7" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Browse seeds, fertilizers, tools, machinery, IoT devices, and more in one farm marketplace.
          </p>
        </div>

        {/* Cart Snapshot */}
        <div className="rounded-2xl p-4 lg:min-w-[220px]"
          style={{ background: 'rgba(7,20,13,0.72)', border: '1px solid rgba(41,160,100,0.2)', backdropFilter: 'blur(16px)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>Cart Snapshot</p>
          <p className="text-2xl font-display font-extrabold text-white">{itemCount} items</p>
          <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Subtotal: <span className="font-semibold text-white">{formatINR(totalAmount)}</span>
          </p>
        </div>
      </div>
    </div>

    <div className="mt-5 grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
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

    <p className="mt-4 text-xs text-slate-500">
      Showing <span className="font-semibold text-slate-700">{productsLength}</span> products
    </p>

    {cartNotice.text ? (
      <p className={`mt-2 text-xs font-semibold ${cartNotice.type === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>
        {cartNotice.text}
      </p>
    ) : null}

    {productsLoading ? <p className="mt-2 text-xs font-semibold text-slate-500">Loading products...</p> : null}
    {productsError ? <p className="mt-2 text-xs font-semibold text-red-600">{productsError}</p> : null}
  </section>
);

export default MarketplaceHero;
