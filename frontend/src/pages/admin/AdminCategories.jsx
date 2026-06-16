import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', isActive: true });
  const [saving, setSaving] = useState(false);

  const fetch = () => adminAPI.getCategories().then(r => setCategories(r.data.data || []));
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', isActive: true }); setShowModal(true); };
  const openEdit = (cat) => { setEditing(cat); setForm({ name: cat.name, description: cat.description || '', isActive: cat.isActive }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await adminAPI.updateCategory(editing.id, form); toast.success('Updated!'); }
      else { await adminAPI.createCategory(form); toast.success('Created!'); }
      setShowModal(false); fetch();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    await adminAPI.deleteCategory(id); toast.success('Deleted'); fetch();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm btn-gold">
          <FiPlus size={16} /> Add Category
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, i) => (
          <motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl gold-border" style={{ background: 'var(--color-surface)' }}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--color-cream)' }}>{cat.name}</h3>
                <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--color-muted)' }}>{cat.description}</p>
                <span className={`text-xs mt-2 inline-block ${cat.isActive ? 'status-delivered' : 'status-cancelled'} px-2 py-0.5 rounded-full`}>
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(cat)} className="p-2 rounded-lg hover:bg-white hover:bg-opacity-5 transition-colors" style={{ color: 'var(--color-gold)' }}><FiEdit2 size={14} /></button>
                <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg hover:bg-white hover:bg-opacity-5 transition-colors text-red-400"><FiTrash2 size={14} /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-3xl overflow-hidden flex flex-col max-h-[90vh]" style={{ background: 'var(--color-surface)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <div className="flex justify-between items-center px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--color-cream)' }}>{editing ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--color-muted)' }}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1 min-h-0">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Name</label>
                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-sm input-dark" />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-4 py-3 rounded-xl text-sm input-dark resize-none" />
              </div>
              <label className="flex items-center gap-2.5 text-sm cursor-pointer" style={{ color: 'var(--color-cream)' }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} style={{ accentColor: 'var(--color-gold)' }} className="w-4 h-4" />
                Active
              </label>
              <div className="flex gap-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <button type="submit" disabled={saving} className="flex-1 py-3.5 rounded-xl text-sm font-semibold btn-gold disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3.5 rounded-xl text-sm font-semibold btn-outline-gold">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
