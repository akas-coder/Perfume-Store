import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiChevronRight } from 'react-icons/fi';
import { orderAPI } from '../../services/api';

const STATUS_STYLES = {
  PENDING: 'status-pending', PROCESSING: 'status-processing', PACKED: 'status-packed',
  SHIPPED: 'status-shipped', DELIVERED: 'status-delivered', CANCELLED: 'status-cancelled'
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getAll().then(r => setOrders(r.data.data?.content || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="loader" />
    </div>
  );

  if (!orders.length) return (
    <div className="min-h-screen pt-20 flex flex-col items-center justify-center text-center px-4">
      <FiPackage size={64} style={{ color: 'var(--color-muted)' }} />
      <h2 className="font-display text-3xl font-semibold mt-6 mb-3" style={{ color: 'var(--color-cream)' }}>
        No orders yet
      </h2>
      <p className="mb-8" style={{ color: 'var(--color-muted)' }}>Start shopping to see your orders here</p>
      <Link to="/products" className="px-8 py-4 rounded-full text-sm font-semibold btn-gold">Shop Now</Link>
    </div>
  );

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl font-semibold mb-8" style={{ color: 'var(--color-cream)' }}>My Orders</h1>
        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div key={order.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/orders/${order.id}`}
                className="block p-5 rounded-2xl gold-border hover:border-yellow-400 transition-all"
                style={{ background: 'var(--color-surface)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-mono text-sm font-bold" style={{ color: 'var(--color-gold)' }}>
                        #{order.orderNumber}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status] || ''}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs mb-2" style={{ color: 'var(--color-muted)' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      · {order.items?.length} item{order.items?.length > 1 ? 's' : ''}
                    </p>
                    {/* Item previews */}
                    <div className="flex gap-2">
                      {order.items?.slice(0, 3).map(item => (
                        <div key={item.id} className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0"
                             style={{ background: 'var(--color-surface-2)' }}>
                          {item.productImage
                            ? <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-sm">🌹</div>}
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-medium"
                             style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}>
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg" style={{ color: 'var(--color-gold)' }}>
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>{order.paymentMethod}</p>
                    <FiChevronRight size={16} className="ml-auto mt-2" style={{ color: 'var(--color-muted)' }} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
