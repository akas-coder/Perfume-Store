import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrash2, FiPlus, FiMinus, FiTag, FiX, FiShoppingBag, FiArrowRight, FiGift } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cart, loading, updateItem, removeItem, applyCoupon, removeCoupon, getSubtotal } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const navigate = useNavigate();

  const subtotal = getSubtotal();
  const couponDiscount = cart?.coupon ? Math.min(
    subtotal * (cart.coupon.discountValue / 100),
    cart.coupon.maxDiscountAmount || Infinity
  ) : 0;
  const shipping = subtotal - couponDiscount >= 999 ? 0 : 99;
  const total = subtotal - couponDiscount + shipping;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await applyCoupon(couponCode.trim().toUpperCase());
      if (res?.success) toast.success('Coupon applied!');
      else toast.error(res?.message || 'Invalid coupon');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    await removeCoupon();
    setCouponCode('');
    toast.success('Coupon removed');
  };

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="loader" />
    </div>
  );

  if (!cart?.items?.length) return (
    <div className="min-h-screen pt-20 flex flex-col items-center justify-center text-center px-4">
      <span className="text-8xl mb-6">🛍️</span>
      <h2 className="font-display text-3xl font-semibold mb-3" style={{ color: 'var(--color-cream)' }}>Your cart is empty</h2>
      <p className="mb-8" style={{ color: 'var(--color-muted)' }}>Discover our luxurious fragrance collection</p>
      <Link to="/products" className="px-8 py-4 rounded-full text-sm font-semibold btn-gold">
        Shop Now
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl font-semibold mb-8" style={{ color: 'var(--color-cream)' }}>
          Shopping Cart <span className="text-lg font-normal ml-2" style={{ color: 'var(--color-muted)' }}>({cart.items.length} items)</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item, idx) => {
              const price = item.product.discountPrice || item.product.originalPrice;
              const giftExtra = item.giftPackaging === 'PREMIUM' ? 99 : 0;
              const itemTotal = price * item.quantity + giftExtra;
              return (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                  className="flex gap-4 p-4 rounded-2xl gold-border"
                  style={{ background: 'var(--color-surface)' }}>
                  {/* Image */}
                  <Link to={`/products/${item.product.id}`}
                        className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ background: 'var(--color-surface-2)' }}>
                    {item.product.primaryImage
                      ? <img src={item.product.primaryImage} alt={item.product.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">🌹</div>}
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-gold)' }}>
                          {item.product.brand}
                        </p>
                        <Link to={`/products/${item.product.id}`}
                              className="font-display text-base font-semibold line-clamp-1 hover:text-yellow-400"
                              style={{ color: 'var(--color-cream)' }}>
                          {item.product.name}
                        </Link>
                        {item.giftPackaging === 'PREMIUM' && (
                          <span className="inline-flex items-center gap-1 text-xs mt-1" style={{ color: 'var(--color-gold)' }}>
                            <FiGift size={11} /> Premium Gift Wrap (+₹99)
                          </span>
                        )}
                      </div>
                      <button onClick={() => removeItem(item.id)} className="ml-2 p-1 rounded-lg transition-colors hover:text-red-400"
                              style={{ color: 'var(--color-muted)' }}>
                        <FiTrash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Qty */}
                      <div className="flex items-center gap-2 rounded-lg px-2 py-1" style={{ background: 'var(--color-surface-2)' }}>
                        <button onClick={() => updateItem(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded flex items-center justify-center transition-colors hover:text-yellow-400"
                          style={{ color: 'var(--color-muted)' }}>
                          <FiMinus size={12} />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold" style={{ color: 'var(--color-cream)' }}>
                          {item.quantity}
                        </span>
                        <button onClick={() => updateItem(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded flex items-center justify-center transition-colors hover:text-yellow-400"
                          style={{ color: 'var(--color-muted)' }}>
                          <FiPlus size={12} />
                        </button>
                      </div>
                      {/* Price */}
                      <span className="font-bold text-base" style={{ color: 'var(--color-gold)' }}>
                        ₹{itemTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            {/* Coupon */}
            <div className="p-5 rounded-2xl gold-border" style={{ background: 'var(--color-surface)' }}>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--color-cream)' }}>Apply Coupon</h3>
              {cart.coupon ? (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                     style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
                  <div className="flex items-center gap-2">
                    <FiTag size={16} style={{ color: 'var(--color-gold)' }} />
                    <span className="text-sm font-bold" style={{ color: 'var(--color-gold)' }}>{cart.coupon.code}</span>
                  </div>
                  <button onClick={handleRemoveCoupon} style={{ color: 'var(--color-muted)' }}>
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="COUPON CODE" className="flex-1 px-4 py-3 rounded-xl text-sm input-dark"
                    id="coupon-input"
                  />
                  <button onClick={handleApplyCoupon} disabled={applyingCoupon}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium btn-gold disabled:opacity-50">
                    Apply
                  </button>
                </div>
              )}
              <div className="mt-3 space-y-1">
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Try: WELCOME10, FLAT500, FIRST20</p>
              </div>
            </div>

            {/* Summary */}
            <div className="p-5 rounded-2xl gold-border" style={{ background: 'var(--color-surface)' }}>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--color-cream)' }}>Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-muted)' }}>Subtotal</span>
                  <span style={{ color: 'var(--color-cream)' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#4ADE80' }}>Coupon Discount</span>
                    <span style={{ color: '#4ADE80' }}>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-muted)' }}>Shipping</span>
                  <span style={{ color: shipping === 0 ? '#4ADE80' : 'var(--color-cream)' }}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    Add ₹{(999 - subtotal + couponDiscount).toFixed(0)} more for free shipping
                  </p>
                )}
                <div className="pt-3 border-t flex justify-between font-bold text-lg"
                     style={{ borderColor: 'var(--color-border)', color: 'var(--color-cream)' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--color-gold)' }}>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button onClick={() => navigate('/checkout')}
                className="w-full mt-5 py-4 rounded-xl font-semibold text-sm btn-gold flex items-center justify-center gap-2"
                id="checkout-btn">
                Proceed to Checkout <FiArrowRight size={16} />
              </button>
              <Link to="/products" className="block text-center text-sm mt-3" style={{ color: 'var(--color-muted)' }}>
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
