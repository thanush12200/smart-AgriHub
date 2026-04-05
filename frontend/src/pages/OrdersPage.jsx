import { useEffect, useState } from 'react';
import useDocTitle from '../hooks/useDocTitle';
import api from '../api/axiosClient';
import Badge from '../components/Badge';
import { formatINR } from '../utils/formatINR';

const STATUS_COLORS = {
  placed: 'blue',
  confirmed: 'amber',
  shipped: 'purple',
  delivered: 'green',
  cancelled: 'red',
};

const OrdersPage = () => {
  useDocTitle('My Orders');
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
                  <Badge color={STATUS_COLORS[order.status] || 'slate'}>{order.status}</Badge>
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
                
                <div className="mt-5 pt-4 border-t border-slate-100 text-sm flex gap-12">
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
