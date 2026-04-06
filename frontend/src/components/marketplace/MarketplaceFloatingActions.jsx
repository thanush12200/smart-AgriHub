const MarketplaceFloatingActions = ({ handleCartQuickOpen, handleCheckoutOpen, cartItemsLength, itemCount }) => (
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
      disabled={!cartItemsLength}
      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
    >
      Quick Checkout
    </button>
  </div>
);

export default MarketplaceFloatingActions;
