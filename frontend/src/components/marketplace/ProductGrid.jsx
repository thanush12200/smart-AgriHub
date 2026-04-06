import { formatINR } from '../../utils/formatINR';

const ProductGrid = ({ products, cartQuantityById, handleAddToCart, handleRemoveFromCart }) => (
  <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {products.map((item) => {
      const inCartQty = cartQuantityById[item.id] || 0;
      const reachedStock = inCartQty >= item.stock;

      return (
        <article key={item.id} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-xl">
          <div className="mb-4 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100">
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
              <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                {item.category}
              </span>
              <h3 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-slate-900">{item.name}</h3>
            </div>
            <span className="text-xs font-semibold text-amber-600">{item.rating} ★</span>
          </div>

          <p className="text-sm leading-6 text-slate-600">{item.description}</p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Brand</p>
              <p className="font-semibold">{item.brand}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Pack</p>
              <p className="font-semibold">{item.unit}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Stock</p>
              <p className="font-semibold">{item.stock} units</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
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
);

export default ProductGrid;
