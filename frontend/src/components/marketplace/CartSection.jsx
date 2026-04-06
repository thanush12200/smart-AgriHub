import { formatINR } from '../../utils/formatINR';

const CartSection = ({
  cartItems,
  clearCart,
  handleCheckoutOpen,
  updateQuantity,
  handleRemoveFromCart,
  totalAmount,
  shippingFee,
  grandTotal,
}) => (
  <section className="card p-5 md:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="section-label">Cart Details</p>
        <h3 className="section-title mt-1">Your selected products</h3>
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
          <div key={item.id} className="grid gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-[64px_1fr_auto_auto] md:items-center">
            <img src={item.image} alt={item.name} className="h-16 w-16 rounded-2xl object-cover" />

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
);

export default CartSection;
