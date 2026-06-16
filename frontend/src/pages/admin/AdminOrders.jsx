import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiChevronDown, FiEye, FiX, FiUser, FiMapPin, FiShoppingBag } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUSES = ['PENDING', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const STATUS_STYLES = {
  PENDING: 'status-pending', PROCESSING: 'status-processing', PACKED: 'status-packed',
  SHIPPED: 'status-shipped', DELIVERED: 'status-delivered', CANCELLED: 'status-cancelled'
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetch = () => adminAPI.getOrders().then(r => setOrders(r.data.data?.content || [])).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      const res = await adminAPI.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? res.data.data : o));
      // Update selectedOrder if it is currently open
      setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status } : prev);
      toast.success(`Order status → ${status}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl overflow-hidden gold-border" style={{ background: 'var(--color-surface)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Order #', 'Date', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array(8).fill(0).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  {Array(8).fill(0).map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 shimmer rounded" /></td>)}
                </tr>
              )) : orders.map(order => (
                <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                           style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td className="px-5 py-3 font-mono font-bold" style={{ color: 'var(--color-gold)' }}>#{order.orderNumber}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--color-cream)' }}>{order.customerName || 'User'}</p>
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{order.customerEmail}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{order.items?.length || 0}</td>
                  <td className="px-5 py-3 font-bold" style={{ color: 'var(--color-gold)' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{order.paymentMethod}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status] || ''}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <select value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)}
                        className="px-2 py-1.5 rounded-lg text-xs cursor-pointer input-dark">
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button onClick={() => setSelectedOrder(order)}
                        className="p-2 rounded-lg hover:bg-white hover:bg-opacity-5 transition-colors"
                        style={{ color: 'var(--color-gold)' }}
                        title="View Details">
                        <FiEye size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {!loading && orders.length === 0 && (
            <p className="text-center py-10 text-sm" style={{ color: 'var(--color-muted)' }}>No orders yet</p>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
            style={{ background: 'var(--color-surface)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-3">
                <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--color-cream)' }}>Order Details</h2>
                <span className="font-mono text-xs px-2.5 py-1 rounded-full badge-gold">#{selectedOrder.orderNumber}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ color: 'var(--color-muted)' }}><FiX size={20} /></button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
              {/* Top Row: Info and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Customer Details</h3>
                  <div className="space-y-1.5 text-sm">
                    <p className="flex items-center gap-2" style={{ color: 'var(--color-cream)' }}><FiUser size={14} style={{ color: 'var(--color-gold)' }} /> {selectedOrder.customerName || 'User'}</p>
                    <p className="ml-5" style={{ color: 'var(--color-muted)' }}>{selectedOrder.customerEmail}</p>
                    <p className="ml-5" style={{ color: 'var(--color-muted)' }}>Phone: {selectedOrder.address?.phone || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Order Metadata</h3>
                  <div className="space-y-1 text-sm text-cream">
                    <p>Date: <span style={{ color: 'var(--color-muted)' }}>{new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</span></p>
                    <p>Payment: <span style={{ color: 'var(--color-muted)' }}>{selectedOrder.paymentMethod} ({selectedOrder.paymentStatus || 'PENDING'})</span></p>
                    <p className="flex items-center gap-2">Status: <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[selectedOrder.status] || ''}`}>{selectedOrder.status}</span></p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="pb-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--color-muted)' }}>
                  <FiMapPin size={14} style={{ color: 'var(--color-gold)' }} /> Delivery Address
                </h3>
                {selectedOrder.address ? (
                  <div className="text-sm space-y-1 p-4 rounded-xl border" style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
                    <p className="font-semibold text-cream">{selectedOrder.address.fullName}</p>
                    <p style={{ color: 'var(--color-cream)' }}>{selectedOrder.address.addressLine1}{selectedOrder.address.addressLine2 ? `, ${selectedOrder.address.addressLine2}` : ''}</p>
                    <p style={{ color: 'var(--color-cream)' }}>{selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Contact: {selectedOrder.address.phone}</p>
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No delivery address provided</p>
                )}
              </div>

              {/* Products Ordered */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--color-muted)' }}>
                  <FiShoppingBag size={14} style={{ color: 'var(--color-gold)' }} /> Products Ordered
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center p-3 rounded-xl border" style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'var(--color-surface)' }}>
                        {item.productImage ? <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                                          : <div className="w-full h-full flex items-center justify-center text-sm">🌹</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold line-clamp-1" style={{ color: 'var(--color-cream)' }}>{item.productName}</p>
                        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                          {item.productBrand} {item.giftPackaging === 'PREMIUM' && <span style={{ color: 'var(--color-gold)' }}>· Premium Gift Pack (₹99)</span>}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium" style={{ color: 'var(--color-cream)' }}>₹{item.unitPrice?.toLocaleString('en-IN')} × {item.quantity}</p>
                        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Total: ₹{item.totalPrice?.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculations */}
              <div className="p-4 rounded-xl border space-y-2 text-sm" style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
                <div className="flex justify-between" style={{ color: 'var(--color-cream)' }}>
                  <span style={{ color: 'var(--color-muted)' }}>Subtotal</span>
                  <span>₹{selectedOrder.subtotal?.toLocaleString('en-IN')}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-red-400">
                    <span>Coupon Discount {selectedOrder.couponCode && `(${selectedOrder.couponCode})`}</span>
                    <span>-₹{selectedOrder.discountAmount?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between" style={{ color: 'var(--color-cream)' }}>
                  <span style={{ color: 'var(--color-muted)' }}>Shipping Charge</span>
                  <span>{selectedOrder.shippingCharge > 0 ? `₹${selectedOrder.shippingCharge}` : 'Free'}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold" style={{ borderColor: 'var(--color-border)', color: 'var(--color-gold)' }}>
                  <span>Grand Total</span>
                  <span>₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="p-4 rounded-xl border" style={{ background: 'rgba(212,175,55,0.03)', borderColor: 'rgba(212,175,55,0.2)' }}>
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-gold)' }}>Notes</h4>
                  <p className="text-sm italic" style={{ color: 'var(--color-cream)' }}>"{selectedOrder.notes}"</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
