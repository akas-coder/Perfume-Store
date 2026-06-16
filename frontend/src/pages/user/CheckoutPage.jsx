import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiMapPin, FiCheck, FiChevronDown } from 'react-icons/fi';
import { userAPI, orderAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { value: 'COD', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' },
  { value: 'UPI', label: 'UPI / GPay / PhonePe', icon: '📱', desc: 'Coming soon', disabled: true },
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
                        <p className="font-medium text-sm" style={{ color: 'var(--color-cream)' }}>
                          {addr.fullName} · {addr.phone}
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                          {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        {addr.isDefault && (
                          <span className="text-xs mt-1 inline-block" style={{ color: 'var(--color-gold)' }}>★ Default</span>
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
                  className="flex items-center gap-2 text-sm btn-outline-gold px-4 py-2.5 rounded-xl">
                  <FiPlus size={16} /> Add New Address
                </button>
              ) : (
                <form onSubmit={handleAddAddress} className="space-y-3 p-4 rounded-xl"
                      style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Full Name" value={newAddress.fullName} required
                      onChange={e => setNewAddress(p => ({ ...p, fullName: e.target.value }))}
                      className="px-3 py-2.5 rounded-lg text-sm input-dark" />
                    <input placeholder="Phone" value={newAddress.phone} required
                      onChange={e => setNewAddress(p => ({ ...p, phone: e.target.value }))}
                      className="px-3 py-2.5 rounded-lg text-sm input-dark" />
                  </div>
                  <input placeholder="Address Line 1" value={newAddress.addressLine1} required
                    onChange={e => setNewAddress(p => ({ ...p, addressLine1: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg text-sm input-dark" />
                  <input placeholder="Address Line 2 (optional)" value={newAddress.addressLine2}
                    onChange={e => setNewAddress(p => ({ ...p, addressLine2: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg text-sm input-dark" />
                  <div className="grid grid-cols-3 gap-3">
                    <input placeholder="City" value={newAddress.city} required
                      onChange={e => setNewAddress(p => ({ ...p, city: e.target.value }))}
                      className="px-3 py-2.5 rounded-lg text-sm input-dark" />
                    <input placeholder="State" value={newAddress.state} required
                      onChange={e => setNewAddress(p => ({ ...p, state: e.target.value }))}
                      className="px-3 py-2.5 rounded-lg text-sm input-dark" />
                    <input placeholder="Pincode" value={newAddress.pincode} required
                      onChange={e => setNewAddress(p => ({ ...p, pincode: e.target.value }))}
                      className="px-3 py-2.5 rounded-lg text-sm input-dark" />
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--color-muted)' }}>
                    <input type="checkbox" checked={newAddress.isDefault}
                      onChange={e => setNewAddress(p => ({ ...p, isDefault: e.target.checked }))}
                      style={{ accentColor: 'var(--color-gold)' }} />
                    Set as default address
                  </label>
                  <div className="flex gap-3">
                    <button type="submit" className="px-5 py-2 rounded-lg text-sm btn-gold">Save Address</button>
                    <button type="button" onClick={() => setAddingAddress(false)}
                      className="px-5 py-2 rounded-lg text-sm btn-outline-gold">Cancel</button>
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

              <button onClick={handlePlaceOrder} disabled={loading || !selectedAddress}
                className="w-full mt-5 py-4 rounded-xl font-semibold text-sm btn-gold disabled:opacity-50 flex items-center justify-center gap-2"
                id="place-order-btn">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Placing Order...</>
                ) : `Place Order · ₹${total.toLocaleString('en-IN')}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
