import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiMapPin, FiChevronLeft, FiAlertTriangle } from 'react-icons/fi';
import { orderAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['PENDING', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'];
const STATUS_STYLES = {
  PENDING: 'status-pending', PROCESSING: 'status-processing', PACKED: 'status-packed',
  SHIPPED: 'status-shipped', DELIVERED: 'status-delivered', CANCELLED: 'status-cancelled'
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    orderAPI.getById(id).then(r => setOrder(r.data.data))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const res = await orderAPI.cancel(id);
      setOrder(res.data.data);
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Cannot cancel this order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center"><div className="loader" /></div>
  );
  if (!order) return null;

  const currentStep = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';
  const canCancel = !['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status);

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/orders" className="flex items-center gap-2 text-sm mb-6 hover:text-yellow-400 transition-colors"
              style={{ color: 'var(--color-muted)' }}>
          <FiChevronLeft size={16} /> Back to Orders
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--color-cream)' }}>
              Order #{order.orderNumber}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${STATUS_STYLES[order.status]}`}>
              {order.status}
            </span>
            {canCancel && (
              <button onClick={handleCancel} disabled={cancelling}
                className="px-4 py-2 rounded-full text-sm font-medium disabled:opacity-50 transition-all"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>

        {/* Progress Tracker */}
        {!isCancelled && (
          <div className="p-6 rounded-2xl mb-6 gold-border" style={{ background: 'var(--color-surface)' }}>
            <h2 className="font-semibold mb-6" style={{ color: 'var(--color-cream)' }}>Order Tracking</h2>
            <div className="flex items-center">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                      ${i <= currentStep ? 'btn-gold' : ''}`}
                      style={i > currentStep ? { background: 'var(--color-surface-2)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' } : {}}>
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    <span className="text-xs mt-2 text-center hidden sm:block"
                          style={{ color: i <= currentStep ? 'var(--color-gold)' : 'var(--color-muted)' }}>
                      {step}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2"
                         style={{ background: i < currentStep ? 'var(--color-gold)' : 'var(--color-border)' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Items */}
          <div className="md:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl gold-border" style={{ background: 'var(--color-surface)' }}>
              <h2 className="font-semibold mb-4" style={{ color: 'var(--color-cream)' }}>Items Ordered</h2>
              <div className="space-y-4">
                {order.items?.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                         style={{ background: 'var(--color-surface-2)' }}>
                      {item.productImage
                        ? <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">🌹</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase" style={{ color: 'var(--color-gold)' }}>{item.productBrand}</p>
                      <p className="text-sm font-medium line-clamp-1" style={{ color: 'var(--color-cream)' }}>{item.productName}</p>
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                        Qty: {item.quantity} · ₹{item.unitPrice?.toLocaleString('en-IN')} each
                      </p>
                    </div>
                    <span className="font-bold text-sm" style={{ color: 'var(--color-gold)' }}>
                      ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            {order.address && (
              <div className="p-5 rounded-2xl gold-border" style={{ background: 'var(--color-surface)' }}>
                <h2 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-cream)' }}>
                  <FiMapPin size={16} style={{ color: 'var(--color-gold)' }} /> Delivery Address
                </h2>
                <p className="text-sm font-medium" style={{ color: 'var(--color-cream)' }}>
                  {order.address.fullName} · {order.address.phone}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                  {order.address.addressLine1}
                  {order.address.addressLine2 ? `, ${order.address.addressLine2}` : ''}
                  , {order.address.city}, {order.address.state} - {order.address.pincode}
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="p-5 rounded-2xl gold-border h-fit" style={{ background: 'var(--color-surface)' }}>
            <h2 className="font-semibold mb-4" style={{ color: 'var(--color-cream)' }}>Payment Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-muted)' }}>Subtotal</span>
                <span style={{ color: 'var(--color-cream)' }}>₹{order.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#4ADE80' }}>Discount</span>
                  <span style={{ color: '#4ADE80' }}>-₹{order.discountAmount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-muted)' }}>Shipping</span>
                <span style={{ color: order.shippingCharge === 0 ? '#4ADE80' : 'var(--color-cream)' }}>
                  {order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}
                </span>
              </div>
              <div className="flex justify-between font-bold pt-3 text-lg"
                   style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-cream)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--color-gold)' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Payment Method</p>
              <p className="text-sm font-medium mt-1" style={{ color: 'var(--color-cream)' }}>{order.paymentMethod}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
