import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiImage, FiX, FiCheck } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const GENDERS = ['MEN', 'WOMEN', 'UNISEX'];
const FAMILIES = ['Floral', 'Oriental', 'Woody', 'Fresh', 'Citrus', 'Gourmand', 'Aquatic', 'Chypre'];

const EMPTY_PRODUCT = {
  name: '', brand: '', description: '', originalPrice: '', discountPrice: '',
  categoryId: '', gender: 'UNISEX', fragranceFamily: '',
  topNotes: '', middleNotes: '', baseNotes: '',
  isFeatured: false, isBestSeller: false, isNewArrival: false, isLuxury: false, isActive: true,
  stockQuantity: 100, lowStockThreshold: 10,
};

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>{label}</label>
    {children}
  </div>
);

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchProducts = () => {
    adminAPI.getProducts({ page: 0, size: 50 }).then(r => setProducts(r.data.data?.content || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    adminAPI.getCategories().then(r => setCategories(r.data.data || []));
  }, []);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(EMPTY_PRODUCT);
    setImages([]);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name, brand: product.brand, description: product.description,
      originalPrice: product.originalPrice, discountPrice: product.discountPrice || '',
      categoryId: product.category?.id || '', gender: product.gender,
      fragranceFamily: product.fragranceFamily || '',
      topNotes: product.topNotes || '', middleNotes: product.middleNotes || '',
      baseNotes: product.baseNotes || '',
      isFeatured: product.isFeatured, isBestSeller: product.isBestSeller,
      isNewArrival: product.isNewArrival, isLuxury: product.isLuxury, isActive: product.isActive,
      stockQuantity: product.stockQuantity || 100, lowStockThreshold: product.lowStockThreshold || 10,
    });
    setImages([]);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const productJson = JSON.stringify({
        ...form,
        originalPrice: parseFloat(form.originalPrice),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        stockQuantity: parseInt(form.stockQuantity),
        lowStockThreshold: parseInt(form.lowStockThreshold),
      });
      const formData = new FormData();
      formData.append('product', new Blob([productJson], { type: 'application/json' }));
      images.forEach(img => formData.append('images', img));


      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct.id, formData);
        toast.success('Product updated!');
      } else {
        await adminAPI.createProduct(formData);
        toast.success('Product created!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await adminAPI.deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  const inputCls = "w-full px-3 py-2.5 rounded-lg text-sm input-dark";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--color-muted)' }} />
          <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm input-dark" />
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm btn-gold">
          <FiPlus size={16} /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden gold-border" style={{ background: 'var(--color-surface)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Product', 'Brand', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--color-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array(5).fill(0).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  {Array(6).fill(0).map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 shimmer rounded" /></td>)}
                </tr>
              )) : filtered.map(p => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                           style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                           style={{ background: 'var(--color-surface-2)' }}>
                        {p.primaryImage ? <img src={p.primaryImage} alt="" className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center text-sm">🌹</div>}
                      </div>
                      <span className="font-medium line-clamp-1 max-w-[160px]" style={{ color: 'var(--color-cream)' }}>{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{p.brand}</td>
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-bold" style={{ color: 'var(--color-gold)' }}>₹{(p.discountPrice || p.originalPrice)?.toLocaleString('en-IN')}</p>
                      {p.discountPrice && <p className="text-xs price-original">₹{p.originalPrice?.toLocaleString('en-IN')}</p>}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold ${p.isInStock ? '' : 'text-red-400'}`}
                          style={p.isInStock ? { color: '#4ADE80' } : {}}>
                      {p.isInStock ? (p.stockQuantity != null ? `${p.stockQuantity} units` : 'In Stock') : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.isActive ? 'status-delivered' : 'status-cancelled'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)}
                        className="p-2 rounded-lg hover:bg-white hover:bg-opacity-5 transition-colors"
                        style={{ color: 'var(--color-gold)' }}>
                        <FiEdit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(p.id)}
                        className="p-2 rounded-lg hover:bg-white hover:bg-opacity-5 transition-colors text-red-400">
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <p className="text-center py-10 text-sm" style={{ color: 'var(--color-muted)' }}>No products found</p>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
            style={{ background: 'var(--color-surface)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--color-cream)' }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--color-muted)' }}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Product Name"><input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls} /></Field>
                <Field label="Brand"><input required value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} className={inputCls} /></Field>
              </div>
              <Field label="Description">
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3} className={inputCls + ' resize-none'} />
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Field label="Original Price (₹)"><input type="number" required value={form.originalPrice} onChange={e => setForm(p => ({ ...p, originalPrice: e.target.value }))} className={inputCls} /></Field>
                <Field label="Discount Price (₹)"><input type="number" value={form.discountPrice} onChange={e => setForm(p => ({ ...p, discountPrice: e.target.value }))} className={inputCls} /></Field>
                <Field label="Category">
                  <select value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))} className={inputCls + ' cursor-pointer'}>
                    <option value="">No Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Gender">
                  <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} className={inputCls + ' cursor-pointer'}>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </Field>
                <Field label="Fragrance Family">
                  <select value={form.fragranceFamily} onChange={e => setForm(p => ({ ...p, fragranceFamily: e.target.value }))} className={inputCls + ' cursor-pointer'}>
                    <option value="">Select Family</option>
                    {FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Field label="Top Notes"><input value={form.topNotes} onChange={e => setForm(p => ({ ...p, topNotes: e.target.value }))} placeholder="e.g. Bergamot, Lemon" className={inputCls} /></Field>
                <Field label="Middle Notes"><input value={form.middleNotes} onChange={e => setForm(p => ({ ...p, middleNotes: e.target.value }))} placeholder="e.g. Rose, Jasmine" className={inputCls} /></Field>
                <Field label="Base Notes"><input value={form.baseNotes} onChange={e => setForm(p => ({ ...p, baseNotes: e.target.value }))} placeholder="e.g. Musk, Sandalwood" className={inputCls} /></Field>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Stock Quantity"><input type="number" value={form.stockQuantity} onChange={e => setForm(p => ({ ...p, stockQuantity: e.target.value }))} className={inputCls} /></Field>
                <Field label="Low Stock Threshold"><input type="number" value={form.lowStockThreshold} onChange={e => setForm(p => ({ ...p, lowStockThreshold: e.target.value }))} className={inputCls} /></Field>
              </div>
              {/* Flags */}
              <div className="flex flex-wrap gap-x-6 gap-y-3 py-1">
                {[
                  { key: 'isFeatured', label: 'Featured' },
                  { key: 'isBestSeller', label: 'Best Seller' },
                  { key: 'isNewArrival', label: 'New Arrival' },
                  { key: 'isLuxury', label: 'Luxury' },
                  { key: 'isActive', label: 'Active' },
                ].map(f => (
                  <label key={f.key} className="flex items-center gap-2.5 cursor-pointer text-sm" style={{ color: 'var(--color-cream)' }}>
                    <div onClick={() => setForm(p => ({ ...p, [f.key]: !p[f.key] }))}
                      className="w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-all flex-shrink-0"
                      style={{ background: form[f.key] ? 'var(--color-gold)' : 'var(--color-surface-2)', border: `1px solid ${form[f.key] ? 'var(--color-gold)' : 'var(--color-border)'}` }}>
                      {form[f.key] && <FiCheck size={12} color="#0A0A0A" />}
                    </div>
                    {f.label}
                  </label>
                ))}
              </div>
              {/* Image upload */}
              <Field label="Product Images">
                <label className="flex items-center gap-2 px-4 py-3.5 rounded-xl cursor-pointer border border-dashed transition-all hover:border-yellow-400"
                       style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}>
                  <FiImage size={16} />
                  <span className="text-sm">Click to upload images</span>
                  <input type="file" multiple accept="image/*" className="hidden"
                    onChange={e => setImages(Array.from(e.target.files))} />
                </label>
                {images.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {images.map((img, i) => (
                      <div key={i} className="w-14 h-14 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}>
                        <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </Field>
              <div className="flex gap-4 pt-4 border-t flex-shrink-0" style={{ borderColor: 'var(--color-border)' }}>
                <button type="submit" disabled={saving} className="flex-1 py-3.5 rounded-xl text-sm font-semibold btn-gold disabled:opacity-50">
                  {saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-3.5 rounded-xl text-sm font-semibold btn-outline-gold">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
