import { formatINR } from '../../utils/formatINR';

const CheckoutSection = ({
  checkoutOpen,
  cartItems,
  sectionRef,
  checkoutForm,
  handleCheckoutChange,
  checkoutError,
  setCheckoutOpen,
  handlePlaceOrder,
  checkoutLoading,
  grandTotal,
}) => {
  if (!checkoutOpen || !cartItems.length) return null;

  return (
    <section className="card p-5 md:p-6" ref={sectionRef}>
      <p className="section-label">Checkout</p>
      <h3 className="section-title mt-1">Delivery and payment</h3>

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
  );
};

export default CheckoutSection;
