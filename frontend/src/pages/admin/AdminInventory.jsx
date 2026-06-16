import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiPackage } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [values, setValues] = useState({});

  const fetch = () => adminAPI.getInventory().then(r => setProducts(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const handleUpdate = async (productId) => {
    if (!values[productId]) return;
    setUpdating(productId);
    try {
      await adminAPI.updateStock(productId, { stockQuantity: parseInt(values[productId]) });
      toast.success('Stock updated!');
      fetch();
      setValues(prev => { const n = { ...prev }; delete n[productId]; return n; });
    } catch { toast.error('Failed to update stock'); }
    finally { setUpdating(null); }
  };

  return (
    <div className="rounded-2xl overflow-hidden gold-border" style={{ background: 'var(--color-surface)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Product', 'Brand', 'Current Stock', 'Threshold', 'Status', 'Update Stock'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array(8).fill(0).map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                {Array(6).fill(0).map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 shimmer rounded" /></td>)}
              </tr>
            )) : products.map(p => {
              const isLow = p.stockQuantity != null && p.lowStockThreshold != null && p.stockQuantity <= p.lowStockThreshold;
              return (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                           style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'var(--color-surface-2)' }}>
                        {p.primaryImage ? <img src={p.primaryImage} alt="" className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center text-sm">🌹</div>}
                      </div>
                      <span className="font-medium line-clamp-1 max-w-[150px]" style={{ color: 'var(--color-cream)' }}>{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{p.brand}</td>
                  <td className="px-5 py-3">
                    <span className={`font-bold ${isLow ? 'text-yellow-400' : ''} ${p.stockQuantity === 0 ? 'text-red-400' : ''}`}
                          style={!isLow && p.stockQuantity !== 0 ? { color: '#4ADE80' } : {}}>
                      {p.stockQuantity ?? '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{p.lowStockThreshold ?? '—'}</td>
                  <td className="px-5 py-3">
                    {isLow && p.stockQuantity > 0 ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-yellow-400">
                        <FiAlertTriangle size={12} /> Low Stock
                      </span>
                    ) : p.stockQuantity === 0 ? (
                      <span className="text-xs font-semibold text-red-400">Out of Stock</span>
                    ) : (
                      <span className="text-xs font-semibold" style={{ color: '#4ADE80' }}>In Stock</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <input type="number" min="0" placeholder="Qty"
                        value={values[p.id] || ''}
                        onChange={e => setValues(prev => ({ ...prev, [p.id]: e.target.value }))}
                        className="w-20 px-2 py-1.5 rounded-lg text-xs input-dark" />
                      <button onClick={() => handleUpdate(p.id)} disabled={updating === p.id}
                        className="px-3 py-1.5 rounded-lg text-xs btn-gold disabled:opacity-50">
                        {updating === p.id ? '...' : 'Update'}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        {!loading && products.length === 0 && (
          <p className="text-center py-10 text-sm" style={{ color: 'var(--color-muted)' }}>No products found</p>
        )}
      </div>
    </div>
  );
}
