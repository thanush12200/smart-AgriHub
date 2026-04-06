import { formatINR } from '../../utils/formatINR';

const OrderConfirmation = ({ lastOrder }) => {
  if (!lastOrder) return null;

  return (
    <section className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900">
      <p className="text-xs font-bold uppercase tracking-wider">Order Confirmed</p>
      <p className="mt-1 text-sm">Order ID: <span className="font-semibold">{lastOrder.orderId}</span></p>
      <p className="text-sm">Items: <span className="font-semibold">{lastOrder.itemCount}</span></p>
      <p className="text-sm">Amount: <span className="font-semibold">{formatINR(lastOrder.grandTotal)}</span></p>
      <p className="text-sm">Payment: <span className="font-semibold uppercase">{lastOrder.paymentMode}</span></p>
      <p className="text-sm">Placed at: <span className="font-semibold">{lastOrder.placedAt}</span></p>
    </section>
  );
};

export default OrderConfirmation;
