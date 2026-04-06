import { formatINR } from '../../utils/formatINR';

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
  <section className="page-hero" ref={sectionRef}>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="page-kicker">Marketplace</p>
        <h2 className="page-title">Agricultural Products Catalog</h2>
        <p className="page-copy">
          Browse seeds, fertilizers, tools, machinery, IoT devices, and more in one farm marketplace.
        </p>
      </div>

      <div className="rounded-[28px] border border-white/70 bg-white/74 px-5 py-4 shadow-sm backdrop-blur-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Cart Snapshot</p>
        <p className="mt-2 text-2xl font-display font-extrabold text-slate-950">{itemCount} items</p>
        <p className="mt-1 text-sm text-slate-600">
          Subtotal: <span className="font-semibold text-slate-900">{formatINR(totalAmount)}</span>
        </p>
      </div>
    </div>

    <div className="mt-6 grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
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
