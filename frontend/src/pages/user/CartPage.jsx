import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiPlus, FiMinus, FiTag, FiX, FiShoppingBag, FiArrowRight, FiGift, FiAlertCircle } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cart, loading, updateItem, removeItem, applyCoupon, removeCoupon, getSubtotal, removingItems, updatingItems } = useCart();
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

  const handleRemoveItem = async (itemId) => {
    try {
      await removeItem(itemId);
      toast.success('Item removed from cart');
    } catch {
      toast.error('Failed to remove item. Please try again.');
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="loader" />
    </div>
  );

  if (!cart?.items?.length) return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pt-20 flex flex-col items-center justify-center text-center px-6"
    >
      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
           style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
        <FiShoppingBag size={40} style={{ color: 'var(--color-gold)' }} />
      </div>
      <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-3" style={{ color: 'var(--color-cream)' }}>
        Your cart is empty
      </h2>
      <p className="mb-8 max-w-xs text-sm sm:text-base" style={{ color: 'var(--color-muted)' }}>
        Discover our luxurious fragrance collection and find your signature scent
      </p>
      <Link to="/products" className="px-8 py-4 rounded-full text-sm font-semibold btn-gold">
        Shop Now
      </Link>
    </motion.div>
  );

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--color-cream)' }}>
            Shopping Cart
          </h1>
          <span className="text-sm font-medium px-3 py-1 rounded-full"
                style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--color-gold)', border: '1px solid rgba(212,175,55,0.2)' }}>
            {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <AnimatePresence mode="popLayout">
              {cart.items.map((item, idx) => {
                const price = item.product.discountPrice || item.product.originalPrice;
                const giftExtra = item.giftPackaging === 'PREMIUM' ? 99 : 0;
                const itemTotal = price * item.quantity + giftExtra;
                const isRemoving = removingItems.has(item.id);
                const isUpdating = updatingItems.has(item.id);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isRemoving ? 0.4 : 1, y: 0, scale: isRemoving ? 0.97 : 1 }}
                    exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                    transition={{ delay: idx * 0.04, layout: { duration: 0.2 } }}
                    className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl gold-border relative overflow-hidden"
                    style={{ background: 'var(--color-surface)' }}
                  >
                    {/* Removing overlay */}
                    {isRemoving && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 rounded-2xl"
                           style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}>
                        <div className="w-5 h-5 border-2 rounded-full animate-spin"
                             style={{ borderColor: 'var(--color-gold)', borderTopColor: 'transparent' }} />
                      </div>
                    )}

                    {/* Image */}
                    <Link to={`/products/${item.product.id}`}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0"
                          style={{ background: 'var(--color-surface-2)' }}>
                      {item.product.primaryImage
                        ? <img src={item.product.primaryImage} alt={item.product.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">🌹</div>}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--color-gold)' }}>
                            {item.product.brand}
                          </p>
                          <Link to={`/products/${item.product.id}`}
                                className="font-display text-sm sm:text-base font-semibold line-clamp-2 hover:text-yellow-400 leading-snug"
                                style={{ color: 'var(--color-cream)' }}>
                            {item.product.name}
                          </Link>
                          {item.giftPackaging === 'PREMIUM' && (
                            <span className="inline-flex items-center gap-1 text-xs mt-1" style={{ color: 'var(--color-gold)' }}>
                              <FiGift size={11} /> Premium Gift Wrap (+₹99)
                            </span>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isRemoving}
                          className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-red-500 hover:bg-opacity-15 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ color: 'var(--color-muted)' }}
                          aria-label="Remove item"
                          id={`remove-item-${item.id}`}
                        >
                          <FiTrash2 size={15} className="hover:text-red-400" />
                        </button>
                      </div>

                      {/* Qty + Price row */}
                      <div className="flex items-center justify-between mt-3">
                        {/* Qty Controls */}
                        <div className="flex items-center gap-1 rounded-lg px-1.5 py-1"
                             style={{ background: 'var(--color-surface-2)' }}>
                          <button
                            onClick={() => updateItem(item.id, item.quantity - 1)}
                            disabled={isRemoving || isUpdating || item.quantity <= 1}
                            className="w-7 h-7 rounded flex items-center justify-center transition-colors hover:text-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ color: 'var(--color-muted)' }}
                            aria-label="Decrease quantity"
                          >
                            <FiMinus size={12} />
                          </button>
                          <span className="w-7 text-center text-sm font-semibold" style={{ color: 'var(--color-cream)' }}>
                            {isUpdating ? (
                              <span className="inline-block w-3 h-3 border border-t-transparent rounded-full animate-spin"
                                    style={{ borderColor: 'var(--color-gold)' }} />
                            ) : item.quantity}
                          </span>
                          <button
                            onClick={() => updateItem(item.id, item.quantity + 1)}
                            disabled={isRemoving || isUpdating}
                            className="w-7 h-7 rounded flex items-center justify-center transition-colors hover:text-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ color: 'var(--color-muted)' }}
                            aria-label="Increase quantity"
                          >
                            <FiPlus size={12} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="font-bold text-base" style={{ color: 'var(--color-gold)' }}>
                            ₹{itemTotal.toLocaleString('en-IN')}
                          </span>
                          {item.quantity > 1 && (
                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                              ₹{price.toLocaleString('en-IN')} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Continue shopping link */}
            <Link to="/products"
                  className="inline-flex items-center gap-2 text-sm mt-2 hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--color-muted)' }}>
              ← Continue Shopping
            </Link>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-4">
            {/* Free shipping progress */}
            {shipping > 0 && (
              <div className="p-4 rounded-2xl"
                   style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <FiAlertCircle size={14} style={{ color: 'var(--color-gold)' }} />
                  <p className="text-xs" style={{ color: 'var(--color-cream)' }}>
                    Add <span className="font-bold" style={{ color: 'var(--color-gold)' }}>
                      ₹{(999 - subtotal + couponDiscount).toFixed(0)}
                    </span> more for <span className="font-bold">FREE shipping</span>
                  </p>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((subtotal - couponDiscount) / 999) * 100)}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, var(--color-gold-dark), var(--color-gold-light))' }}
                  />
                </div>
              </div>
            )}

            {/* Coupon */}
            <div className="p-4 sm:p-5 rounded-2xl gold-border" style={{ background: 'var(--color-surface)' }}>
              <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-cream)' }}>
                <FiTag size={16} style={{ color: 'var(--color-gold)' }} /> Apply Coupon
              </h3>
              {cart.coupon ? (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                     style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
                  <div className="flex items-center gap-2">
                    <FiTag size={16} style={{ color: 'var(--color-gold)' }} />
                    <span className="text-sm font-bold" style={{ color: 'var(--color-gold)' }}>{cart.coupon.code}</span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="p-1 rounded transition-colors hover:text-red-400"
                          style={{ color: 'var(--color-muted)' }} aria-label="Remove coupon">
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      placeholder="COUPON CODE"
                      className="flex-1 px-4 py-3 rounded-xl text-sm input-dark"
                      id="coupon-input"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode.trim()}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium btn-gold disabled:opacity-50 flex-shrink-0"
                    >
                      {applyingCoupon ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : 'Apply'}
                    </button>
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>
                    Try: WELCOME10, FLAT500, FIRST20
                  </p>
                </>
              )}

            </div>

            {/* Summary */}
            <div className="p-4 sm:p-5 rounded-2xl gold-border" style={{ background: 'var(--color-surface)' }}>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--color-cream)' }}>Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-muted)' }}>Subtotal ({cart.items.length} items)</span>
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
                    {shipping === 0 ? '🎉 FREE' : `₹${shipping}`}
                  </span>
                </div>
                <div className="pt-3 border-t flex justify-between font-bold text-lg"
                     style={{ borderColor: 'var(--color-border)', color: 'var(--color-cream)' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--color-gold)' }}>₹{total.toLocaleString('en-IN')}</span>
                </div>
                {couponDiscount > 0 && (
                  <p className="text-xs text-center py-2 rounded-lg"
                     style={{ background: 'rgba(74,222,128,0.08)', color: '#4ADE80' }}>
                    🎉 You save ₹{couponDiscount.toLocaleString('en-IN')} on this order
                  </p>
                )}
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-5 py-4 rounded-xl font-semibold text-sm btn-gold flex items-center justify-center gap-2"
                id="checkout-btn"
              >
                Proceed to Checkout <FiArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
