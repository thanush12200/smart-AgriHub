import { useEffect, useState } from 'react';
import api from '../api/axiosClient';

const Badge = ({ status }) => {
  const colors = {
    placed: 'bg-blue-50 text-blue-700 border-blue-200',
    confirmed: 'bg-amber-50 text-amber-700 border-amber-200',
    shipped: 'bg-purple-50 text-purple-700 border-purple-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  };
  const cls = colors[status] || colors.placed;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${cls}`}>
      {status}
    </span>
  );
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my');
        setOrders(data.orders);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatINR = (v) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading orders...</div>;
  if (error) return <div className="p-4 text-red-600 bg-red-50 rounded-xl">{error}</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-display text-3xl text-slate-900">My Orders</h1>
        <p className="mt-1 text-sm text-slate-500">Track and manage your marketplace purchases.</p>
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card overflow-hidden">
              <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Order ID</p>
                  <p className="font-mono text-sm text-slate-900 font-bold">{order.orderId}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Placed On</p>
                  <p className="text-sm text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total</p>
                  <p className="text-sm font-bold text-brand-600">{formatINR(order.totalAmount)}</p>
                </div>
                <div>
                  <Badge status={order.status} />
                </div>
              </div>

              <div className="p-5">
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">Qty: {item.quantity} × {formatINR(item.price)}</p>
                      </div>
                      <p className="font-semibold text-slate-700">{formatINR(item.quantity * item.price)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-5pt-4 border-t border-slate-100 text-sm flex gap-12">
                  <div>
                    <span className="font-semibold text-slate-900">Delivery Address: </span>
                    <span className="text-slate-600">{order.deliveryAddress}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Payment Mode: </span>
                    <span className="text-slate-600 uppercase">{order.paymentMode}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
