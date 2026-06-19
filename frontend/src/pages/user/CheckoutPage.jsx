import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMapPin, FiCheck, FiChevronDown, FiX, FiInfo, FiArrowLeft } from 'react-icons/fi';
import { userAPI, orderAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { value: 'COD', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' },
  { value: 'UPI', label: 'UPI / GPay / PhonePe', icon: '📱', desc: 'Pay securely using any UPI app' },
  { value: 'CARD', label: 'Credit / Debit Card', icon: '💳', desc: 'Coming soon', disabled: true },
];

export default function CheckoutPage() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false });
  const { cart, getSubtotal, fetchCart } = useCart();
  const navigate = useNavigate();

  // UPI payment simulation states
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiStep, setUpiStep] = useState('select'); // 'select' | 'payId' | 'qr' | 'loading'
  const [selectedApp, setSelectedApp] = useState(null); // 'GPay' | 'PhonePe' | 'Paytm' | 'UPI'
  const [upiId, setUpiId] = useState('');
  const [timer, setTimer] = useState(300);

  // Timer countdown hook for UPI checkout
  useEffect(() => {
    let interval;
    if (showUpiModal && timer > 0 && upiStep !== 'loading') {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setShowUpiModal(false);
            toast.error('Payment session expired. Please try again.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showUpiModal, timer, upiStep]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const subtotal = getSubtotal();
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  useEffect(() => {
    userAPI.getAddresses().then(r => {
      const addrs = r.data.data || [];
      setAddresses(addrs);
      const def = addrs.find(a => a.isDefault) || addrs[0];
      if (def) setSelectedAddress(def.id);
    });
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await userAPI.addAddress(newAddress);
      const added = res.data.data;
      setAddresses(prev => [...prev, added]);
      setSelectedAddress(added.id);
      setAddingAddress(false);
      setNewAddress({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false });
      toast.success('Address added');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return; }
    setLoading(true);
    try {
      const res = await orderAPI.place({ addressId: selectedAddress, paymentMethod, notes, couponCode: cart?.coupon?.code });
      await fetchCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${res.data.data.id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return; }
    if (paymentMethod === 'UPI') {
      setUpiStep('select');
      setSelectedApp(null);
      setUpiId('');
      setTimer(300);
      setShowUpiModal(true);
    } else {
      handlePlaceOrder();
    }
  };

  const handleUpiPaymentSuccess = async () => {
    setUpiStep('loading');
    setLoading(true);
    // Simulate payment verification delay of 3 seconds
    setTimeout(async () => {
      try {
        const res = await orderAPI.place({
          addressId: selectedAddress,
          paymentMethod: 'UPI',
          notes: notes + (upiId ? ` (UPI ID: ${upiId})` : selectedApp ? ` (via ${selectedApp})` : ' (UPI Modal Scan)'),
          couponCode: cart?.coupon?.code
        });
        await fetchCart();
        toast.success('Payment verified & order placed successfully! 🎉');
        setShowUpiModal(false);
        navigate(`/orders/${res.data.data.id}`);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to place order');
        setUpiStep('select');
      } finally {
        setLoading(false);
      }
    }, 3000);
  };

  if (!cart?.items?.length) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl font-semibold mb-8" style={{ color: 'var(--color-cream)' }}>Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Address + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="p-6 rounded-2xl gold-border" style={{ background: 'var(--color-surface)' }}>
              <h2 className="font-semibold text-lg mb-5 flex items-center gap-2" style={{ color: 'var(--color-cream)' }}>
                <FiMapPin size={18} style={{ color: 'var(--color-gold)' }} /> Delivery Address
              </h2>
              <div className="space-y-3 mb-4">
                {addresses.map(addr => (
                  <button key={addr.id} onClick={() => setSelectedAddress(addr.id)}
                    className="w-full text-left p-4 rounded-xl transition-all"
                    style={{
                      border: `1px solid ${selectedAddress === addr.id ? 'var(--color-gold)' : 'var(--color-border)'}`,
                      background: selectedAddress === addr.id ? 'rgba(212,175,55,0.05)' : 'var(--color-surface-2)',
                    }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm tracking-wide mb-2" style={{ color: 'var(--color-cream)' }}>
                          {addr.fullName} &nbsp;·&nbsp; <span className="font-normal text-xs opacity-85" style={{ color: 'var(--color-gold)' }}>{addr.phone}</span>
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)', letterSpacing: '0.03em' }}>
                          {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        {addr.isDefault && (
                          <span className="text-xs mt-2.5 inline-block font-medium" style={{ color: 'var(--color-gold)' }}>★ Default Address</span>
                        )}
                      </div>
                      {selectedAddress === addr.id && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                             style={{ background: 'var(--color-gold)' }}>
                           <FiCheck size={12} color="#0A0A0A" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {!addingAddress ? (
                <button onClick={() => setAddingAddress(true)}
                  className="flex items-center gap-2 text-sm btn-outline-gold px-5 py-3 rounded-xl mt-2">
                  <FiPlus size={16} /> Add New Address
                </button>
              ) : (
                <form onSubmit={handleAddAddress} className="space-y-4 p-5 rounded-xl mt-3"
                      style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Full Name" value={newAddress.fullName} required
                      onChange={e => setNewAddress(p => ({ ...p, fullName: e.target.value }))}
                      className="px-4 py-3 rounded-lg text-sm input-dark" />
                    <input placeholder="Phone" value={newAddress.phone} required
                      onChange={e => setNewAddress(p => ({ ...p, phone: e.target.value }))}
                      className="px-4 py-3 rounded-lg text-sm input-dark" />
                  </div>
                  <input placeholder="Address Line 1" value={newAddress.addressLine1} required
                    onChange={e => setNewAddress(p => ({ ...p, addressLine1: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg text-sm input-dark" />
                  <input placeholder="Address Line 2 (optional)" value={newAddress.addressLine2}
                    onChange={e => setNewAddress(p => ({ ...p, addressLine2: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg text-sm input-dark" />
                  <div className="grid grid-cols-3 gap-4">
                    <input placeholder="City" value={newAddress.city} required
                      onChange={e => setNewAddress(p => ({ ...p, city: e.target.value }))}
                      className="px-4 py-3 rounded-lg text-sm input-dark" />
                    <input placeholder="State" value={newAddress.state} required
                      onChange={e => setNewAddress(p => ({ ...p, state: e.target.value }))}
                      className="px-4 py-3 rounded-lg text-sm input-dark" />
                    <input placeholder="Pincode" value={newAddress.pincode} required
                      onChange={e => setNewAddress(p => ({ ...p, pincode: e.target.value }))}
                      className="px-4 py-3 rounded-lg text-sm input-dark" />
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer mt-1" style={{ color: 'var(--color-muted)' }}>
                    <input type="checkbox" checked={newAddress.isDefault}
                      onChange={e => setNewAddress(p => ({ ...p, isDefault: e.target.checked }))}
                      style={{ accentColor: 'var(--color-gold)' }} />
                    Set as default address
                  </label>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="px-6 py-2.5 rounded-lg text-sm btn-gold">Save Address</button>
                    <button type="button" onClick={() => setAddingAddress(false)}
                      className="px-6 py-2.5 rounded-lg text-sm btn-outline-gold">Cancel</button>
                  </div>
                </form>
              )}
            </div>

            {/* Payment Method */}
            <div className="p-6 rounded-2xl gold-border" style={{ background: 'var(--color-surface)' }}>
              <h2 className="font-semibold text-lg mb-5" style={{ color: 'var(--color-cream)' }}>Payment Method</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(pm => (
                  <button key={pm.value} disabled={pm.disabled}
                    onClick={() => !pm.disabled && setPaymentMethod(pm.value)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      border: `1px solid ${paymentMethod === pm.value ? 'var(--color-gold)' : 'var(--color-border)'}`,
                      background: paymentMethod === pm.value ? 'rgba(212,175,55,0.05)' : 'var(--color-surface-2)',
                    }}>
                    <span className="text-2xl">{pm.icon}</span>
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--color-cream)' }}>{pm.label}</p>
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{pm.desc}</p>
                    </div>
                    {paymentMethod === pm.value && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center"
                           style={{ background: 'var(--color-gold)' }}>
                        <FiCheck size={12} color="#0A0A0A" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Notes */}
            <div className="p-6 rounded-2xl gold-border" style={{ background: 'var(--color-surface)' }}>
              <h2 className="font-semibold text-lg mb-3" style={{ color: 'var(--color-cream)' }}>Order Notes (Optional)</h2>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Special instructions for your order..."
                rows={3} className="w-full px-4 py-3 rounded-xl text-sm input-dark resize-none" />
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl gold-border sticky top-24" style={{ background: 'var(--color-surface)' }}>
              <h2 className="font-semibold text-lg mb-4" style={{ color: 'var(--color-cream)' }}>Order Summary</h2>
              <div className="space-y-3 mb-4">
                {cart.items.map(item => {
                  const price = item.product.discountPrice || item.product.originalPrice;
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                           style={{ background: 'var(--color-surface-2)' }}>
                        {item.product.primaryImage
                          ? <img src={item.product.primaryImage} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-sm">🌹</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs line-clamp-1 font-medium" style={{ color: 'var(--color-cream)' }}>{item.product.name}</p>
                        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium" style={{ color: 'var(--color-gold)' }}>
                        ₹{(price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-muted)' }}>Subtotal</span>
                  <span style={{ color: 'var(--color-cream)' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-muted)' }}>Shipping</span>
                  <span style={{ color: shipping === 0 ? '#4ADE80' : 'var(--color-cream)' }}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2"
                     style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-cream)' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--color-gold)' }}>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button onClick={handleProceedToPayment} disabled={loading || !selectedAddress}
                className="w-full mt-5 py-4 rounded-xl font-semibold text-sm btn-gold disabled:opacity-50 flex items-center justify-center gap-2"
                id="place-order-btn">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> {paymentMethod === 'UPI' && showUpiModal ? 'Verifying Payment...' : 'Placing Order...'}</>
                ) : paymentMethod === 'UPI' ? `Proceed to Payment · ₹${total.toLocaleString('en-IN')}` : `Place Order · ₹${total.toLocaleString('en-IN')}`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* UPI Payment Modal */}
      <AnimatePresence>
        {showUpiModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full max-w-md bg-[#0D0D0D] border border-[rgba(212,175,55,0.25)] rounded-2xl p-6 relative overflow-hidden"
              style={{
                boxShadow: '0 15px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.05)',
              }}
            >
              {/* Close Button */}
              {upiStep !== 'loading' && (
                <button
                  onClick={() => setShowUpiModal(false)}
                  className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <FiX size={20} />
                </button>
              )}

              {/* Back Button */}
              {(upiStep === 'payId' || upiStep === 'qr') && (
                <button
                  onClick={() => setUpiStep('select')}
                  className="absolute top-4 left-4 text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
                >
                  <FiArrowLeft size={16} /> Back
                </button>
              )}

              {/* Header */}
              <div className="text-center mb-6 mt-2">
                <h3 className="font-display text-2xl tracking-widest text-gold-gradient font-bold uppercase mb-1">
                  Liorix Pay
                </h3>
                <p className="text-xs text-zinc-500 font-medium">Secured Instant UPI Transfer</p>
                
                <div className="mt-4 bg-[rgba(212,175,55,0.05)] border border-[rgba(212,175,55,0.1)] rounded-xl py-3 px-5 inline-block w-full max-w-[240px]">
                  <span className="text-[10px] text-zinc-400 block uppercase tracking-wider mb-0.5">Amount to Pay</span>
                  <span className="text-xl font-bold text-gold-gradient">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Step 1: Select payment method */}
              {upiStep === 'select' && (
                <div className="space-y-3">
                  <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-2">Select a UPI option:</p>
                  
                  {/* Google Pay */}
                  <button
                    onClick={() => {
                      setSelectedApp('Google Pay');
                      handleUpiPaymentSuccess();
                    }}
                    className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-[rgba(212,175,55,0.4)] transition-all text-left group cursor-pointer animate-none"
                    type="button"
                  >
                    <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center font-bold text-sm text-[#4285F4] group-hover:scale-105 transition-transform">
                      G
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-zinc-200">Google Pay</p>
                      <p className="text-xs text-zinc-500">Pay directly using GPay app</p>
                    </div>
                    <span className="text-[9px] text-gold border border-gold/25 px-1.5 py-0.5 rounded font-medium tracking-wide">POPULAR</span>
                  </button>

                  {/* PhonePe */}
                  <button
                    onClick={() => {
                      setSelectedApp('PhonePe');
                      handleUpiPaymentSuccess();
                    }}
                    className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-[rgba(212,175,55,0.4)] transition-all text-left group cursor-pointer animate-none"
                    type="button"
                  >
                    <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center font-bold text-sm text-[#8B5CF6] group-hover:scale-105 transition-transform">
                      P
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-zinc-200">PhonePe</p>
                      <p className="text-xs text-zinc-500">Pay directly using PhonePe app</p>
                    </div>
                  </button>

                  {/* Paytm */}
                  <button
                    onClick={() => {
                      setSelectedApp('Paytm');
                      handleUpiPaymentSuccess();
                    }}
                    className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-[rgba(212,175,55,0.4)] transition-all text-left group cursor-pointer animate-none"
                    type="button"
                  >
                    <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center font-bold text-[11px] text-[#00b9f5] group-hover:scale-105 transition-transform font-mono">
                      Pay
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-zinc-200">Paytm</p>
                      <p className="text-xs text-zinc-500">Checkout via Paytm App</p>
                    </div>
                  </button>

                  {/* Scan QR */}
                  <button
                    onClick={() => setUpiStep('qr')}
                    className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-[rgba(212,175,55,0.4)] transition-all text-left group cursor-pointer animate-none"
                    type="button"
                  >
                    <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center text-gold-light group-hover:scale-105 transition-transform">
                      {/* Custom SVG QR Mini Icon */}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7"/>
                        <rect x="14" y="3" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-zinc-200">Scan QR Code</p>
                      <p className="text-xs text-zinc-500">Scan QR using any UPI app</p>
                    </div>
                  </button>

                  {/* UPI ID */}
                  <button
                    onClick={() => setUpiStep('payId')}
                    className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-[rgba(212,175,55,0.4)] transition-all text-left group cursor-pointer animate-none"
                    type="button"
                  >
                    <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-400 group-hover:scale-105 transition-transform font-bold text-sm">
                      @
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-zinc-200">Enter UPI ID</p>
                      <p className="text-xs text-zinc-500">Pay using UPI ID / VPA</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Step 2: Pay via UPI ID */}
              {upiStep === 'payId' && (
                <div className="space-y-4">
                  <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Enter your UPI ID / VPA:</p>
                  
                  <div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. mobile@upi or name@okaxis"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl text-sm input-dark text-zinc-100 placeholder:text-zinc-600"
                        style={{ paddingRight: '3.5rem' }}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 font-bold text-sm">
                        @
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-2 tracking-wide leading-relaxed">
                      UPI ID is usually your mobile number or name followed by bank extension.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (!upiId.trim()) {
                        toast.error('Please enter a UPI ID');
                        return;
                      }
                      if (!upiId.includes('@')) {
                        toast.error('Invalid UPI ID. Must contain "@" (e.g. username@upi)');
                        return;
                      }
                      setSelectedApp('UPI');
                      handleUpiPaymentSuccess();
                    }}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm btn-gold mt-2 cursor-pointer animate-none"
                    type="button"
                  >
                    Verify & Send Request
                  </button>
                </div>
              )}

              {/* Step 3: Scan QR Code */}
              {upiStep === 'qr' && (
                <div className="text-center space-y-4">
                  <div className="font-mono text-xs font-semibold tracking-wider text-amber-500 bg-amber-500/10 py-1.5 px-3 rounded-lg inline-block">
                    Session expires in: {formatTime(timer)}
                  </div>

                  {/* QR SVG */}
                  <div className="relative inline-block">
                    <svg width="180" height="180" viewBox="0 0 100 100" className="mx-auto bg-white p-3 rounded-2xl" style={{ border: '4px solid var(--color-gold)' }}>
                      {/* Corner Anchor top-left */}
                      <rect x="5" y="5" width="25" height="25" fill="#0A0A0A" />
                      <rect x="10" y="10" width="15" height="15" fill="#FFFFFF" />
                      <rect x="13" y="13" width="9" height="9" fill="#0A0A0A" />
                      
                      {/* Corner Anchor top-right */}
                      <rect x="70" y="5" width="25" height="25" fill="#0A0A0A" />
                      <rect x="75" y="10" width="15" height="15" fill="#FFFFFF" />
                      <rect x="78" y="13" width="9" height="9" fill="#0A0A0A" />
                      
                      {/* Corner Anchor bottom-left */}
                      <rect x="5" y="70" width="25" height="25" fill="#0A0A0A" />
                      <rect x="10" y="75" width="15" height="15" fill="#FFFFFF" />
                      <rect x="13" y="78" width="9" height="9" fill="#0A0A0A" />

                      {/* Small Anchor bottom-right */}
                      <rect x="75" y="75" width="10" height="10" fill="#0A0A0A" />
                      <rect x="78" y="78" width="4" height="4" fill="#FFFFFF" />
                      
                      {/* Random mock QR dots */}
                      <rect x="35" y="5" width="5" height="10" fill="#0A0A0A" />
                      <rect x="45" y="5" width="10" height="5" fill="#0A0A0A" />
                      <rect x="60" y="10" width="5" height="15" fill="#0A0A0A" />
                      <rect x="35" y="20" width="15" height="5" fill="#0A0A0A" />
                      <rect x="55" y="20" width="5" height="5" fill="#0A0A0A" />
                      
                      <rect x="5" y="35" width="10" height="5" fill="#0A0A0A" />
                      <rect x="20" y="35" width="5" height="15" fill="#0A0A0A" />
                      <rect x="30" y="30" width="10" height="10" fill="#0A0A0A" />
                      <rect x="45" y="30" width="5" height="5" fill="#0A0A0A" />
                      <rect x="55" y="30" width="15" height="5" fill="#0A0A0A" />
                      <rect x="75" y="35" width="20" height="5" fill="#0A0A0A" />
                      
                      <rect x="5" y="45" width="5" height="15" fill="#0A0A0A" />
                      <rect x="15" y="55" width="15" height="5" fill="#0A0A0A" />
                      <rect x="35" y="45" width="5" height="15" fill="#0A0A0A" />
                      <rect x="45" y="45" width="20" height="10" fill="#0A0A0A" />
                      <rect x="70" y="45" width="10" height="5" fill="#0A0A0A" />
                      <rect x="85" y="45" width="10" height="20" fill="#0A0A0A" />
                      
                      <rect x="30" y="65" width="15" height="5" fill="#0A0A0A" />
                      <rect x="50" y="60" width="10" height="15" fill="#0A0A0A" />
                      <rect x="65" y="65" width="5" height="5" fill="#0A0A0A" />
                      <rect x="75" y="70" width="5" height="5" fill="#0A0A0A" />
                      
                      <rect x="35" y="80" width="20" height="5" fill="#0A0A0A" />
                      <rect x="60" y="80" width="10" height="15" fill="#0A0A0A" />
                      
                      <rect x="35" y="90" width="5" height="5" fill="#0A0A0A" />
                      <rect x="45" y="90" width="10" height="5" fill="#0A0A0A" />
                      
                      {/* Center brand logo overlay */}
                      <rect x="42" y="42" width="16" height="16" rx="3" fill="#0A0A0A" />
                      <text x="50" y="52" fill="#D4AF37" fontSize="8" fontWeight="bold" textAnchor="middle">L</text>
                    </svg>
                  </div>

                  <p className="text-xs text-zinc-500 max-w-[280px] mx-auto leading-relaxed">
                    Scan using Google Pay, PhonePe, Paytm, BHIM or any banking UPI App to pay.
                  </p>

                  <button
                    onClick={handleUpiPaymentSuccess}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm btn-gold mt-2 cursor-pointer animate-none"
                    type="button"
                  >
                    I Have Completed the Payment
                  </button>
                </div>
              )}

              {/* Step 4: Loading / Processing state */}
              {upiStep === 'loading' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center animate-none">
                  <div className="loader animate-spin" style={{ width: '48px', height: '48px' }} />
                  
                  <div>
                    {selectedApp === 'UPI' ? (
                      <>
                        <h4 className="font-semibold text-zinc-200 text-lg mb-2">
                          Sending request to {upiId}
                        </h4>
                        <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                          Please open your UPI app, check notifications, and approve the payment request of ₹{total.toLocaleString('en-IN')}.
                        </p>
                      </>
                    ) : selectedApp ? (
                      <>
                        <h4 className="font-semibold text-zinc-200 text-lg mb-2">
                          Awaiting authorization on {selectedApp}
                        </h4>
                        <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                          We've sent a payment request to your {selectedApp} app. Open the app to complete the transaction.
                        </p>
                      </>
                    ) : (
                      <>
                        <h4 className="font-semibold text-zinc-200 text-lg mb-2">
                          Verifying transaction status
                        </h4>
                        <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                          Checking reference status with the NPCI UPI gateway. Please do not close or refresh this page.
                        </p>
                      </>
                    )}
                  </div>
                  
                  <div className="text-[10px] text-zinc-600 bg-zinc-950 py-1.5 px-3 rounded border border-zinc-900 tracking-wider uppercase font-mono">
                    Awaiting Callback Response...
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
