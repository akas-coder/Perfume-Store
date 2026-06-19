import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiX, FiImage } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const EMPTY = { title: '', subtitle: '', buttonText: 'Shop Now', linkUrl: '/products', displayOrder: 0, isActive: true };

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetch = () => adminAPI.getBanners().then(r => setBanners(r.data.data || []));
  useEffect(() => { fetch(); }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const formData = new FormData();
      formData.append('banner', new Blob([JSON.stringify(form)], { type: 'application/json' }));
      if (image) formData.append('image', image);
      await adminAPI.createBanner(formData);
      toast.success('Banner created!'); setShowModal(false); fetch();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete banner?')) return;
    await adminAPI.deleteBanner(id); toast.success('Deleted'); fetch();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => { setForm(EMPTY); setImage(null); setShowModal(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm btn-gold">
          <FiPlus size={16} /> Add Banner
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((b, i) => (
          <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="relative rounded-2xl overflow-hidden gold-border" style={{ aspectRatio: '16/7', background: 'var(--color-surface-2)' }}>
            {b.imageUrl && <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />}
            <div className="absolute inset-0 flex flex-col justify-end p-4"
                 style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }}>
              <p className="font-display text-lg font-semibold" style={{ color: 'var(--color-cream)' }}>{b.title}</p>
              <p className="text-xs" style={{ color: 'rgba(245,245,240,0.7)' }}>{b.subtitle}</p>
            </div>
            <button onClick={() => handleDelete(b.id)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.8)', color: 'white' }}>
              <FiTrash2 size={14} />
            </button>
            {!b.isActive && (
              <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs status-cancelled">Inactive</div>
            )}
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg rounded-3xl overflow-hidden flex flex-col max-h-[90vh]" style={{ background: 'var(--color-surface)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <div className="flex justify-between items-center px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--color-cream)' }}>New Banner</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--color-muted)' }}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1 min-h-0">
              <div><label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Title</label>
                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm input-dark" /></div>
              <div><label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Subtitle</label>
                <input value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm input-dark" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Button Text</label>
                  <input value={form.buttonText} onChange={e => setForm(p => ({ ...p, buttonText: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm input-dark" /></div>
                <div><label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Link URL</label>
                  <input value={form.linkUrl} onChange={e => setForm(p => ({ ...p, linkUrl: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm input-dark" /></div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Banner Image</label>
                <label className="flex items-center gap-2 px-4 py-3 rounded-xl cursor-pointer border border-dashed transition-all hover:border-yellow-400"
                       style={{ borderColor: image ? 'var(--color-gold)' : 'var(--color-border)', color: 'var(--color-muted)' }}>
                  <FiImage size={16} />
                  <span className="text-sm">{image ? image.name : 'Upload banner image'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setImage(e.target.files[0])} />
                </label>
              </div>
              <div className="flex gap-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <button type="submit" disabled={saving} className="flex-1 py-3.5 rounded-xl text-sm font-semibold btn-gold disabled:opacity-50">{saving ? 'Creating...' : 'Create Banner'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3.5 rounded-xl text-sm font-semibold btn-outline-gold">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
