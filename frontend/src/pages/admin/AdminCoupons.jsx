import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const TYPES = ['PERCENTAGE', 'FIXED', 'FIRST_ORDER', 'FESTIVAL'];

const EMPTY = { code: '', type: 'PERCENTAGE', discountValue: '', minOrderAmount: '', maxDiscountAmount: '', usageLimit: '', isActive: true, validFrom: '', validUntil: '' };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetch = () => adminAPI.getCoupons().then(r => setCoupons(r.data.data || []));
  useEffect(() => { fetch(); }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await adminAPI.createCoupon({
        ...form, discountValue: parseFloat(form.discountValue),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
        maxDiscountAmount: form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : null,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
        validFrom: form.validFrom || null, validUntil: form.validUntil || null,
      });
      toast.success('Coupon created!'); setShowModal(false); fetch();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    await adminAPI.deleteCoupon(id); toast.success('Deleted'); fetch();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => { setForm(EMPTY); setShowModal(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm btn-gold">
          <FiPlus size={16} /> Add Coupon
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl gold-border" style={{ background: 'var(--color-surface)' }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-mono font-bold text-lg" style={{ color: 'var(--color-gold)' }}>{c.code}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                  {c.type === 'PERCENTAGE' || c.type === 'FESTIVAL' ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                  {c.minOrderAmount ? ` · Min ₹${c.minOrderAmount}` : ''}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                  Used {c.usedCount}/{c.usageLimit || '∞'}
                  {c.validUntil ? ` · Expires ${new Date(c.validUntil).toLocaleDateString('en-IN')}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${c.isActive ? 'status-delivered' : 'status-cancelled'}`}>{c.isActive ? 'Active' : 'Off'}</span>
                <button onClick={() => handleDelete(c.id)} className="text-red-400 p-1"><FiTrash2 size={15} /></button>
              </div>
            </div>
            <p className="text-xs mt-2 font-medium uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>{c.type}</p>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg rounded-3xl overflow-hidden flex flex-col max-h-[90vh]" style={{ background: 'var(--color-surface)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <div className="flex justify-between items-center px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--color-cream)' }}>New Coupon</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--color-muted)' }}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Code</label>
                  <input required value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} className="w-full px-4 py-3 rounded-xl text-sm input-dark font-mono" placeholder="SUMMER20" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Type</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-sm input-dark cursor-pointer">
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Discount Value</label>
                  <input required type="number" value={form.discountValue} onChange={e => setForm(p => ({ ...p, discountValue: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-sm input-dark" placeholder={form.type.includes('PERCENTAGE') || form.type === 'FESTIVAL' ? '10 (%)' : '500 (₹)'} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Min Order (₹)</label>
                  <input type="number" value={form.minOrderAmount} onChange={e => setForm(p => ({ ...p, minOrderAmount: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-sm input-dark" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Max Discount (₹)</label>
                  <input type="number" value={form.maxDiscountAmount} onChange={e => setForm(p => ({ ...p, maxDiscountAmount: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-sm input-dark" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Usage Limit</label>
                  <input type="number" value={form.usageLimit} onChange={e => setForm(p => ({ ...p, usageLimit: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-sm input-dark" placeholder="Unlimited" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Valid From</label>
                  <input type="date" value={form.validFrom} onChange={e => setForm(p => ({ ...p, validFrom: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-sm input-dark" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Valid Until</label>
                  <input type="date" value={form.validUntil} onChange={e => setForm(p => ({ ...p, validUntil: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-sm input-dark" />
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <button type="submit" disabled={saving} className="flex-1 py-3.5 rounded-xl text-sm font-semibold btn-gold disabled:opacity-50">{saving ? 'Creating...' : 'Create Coupon'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3.5 rounded-xl text-sm font-semibold btn-outline-gold">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
