import { useState, useEffect } from 'react';
import { FiUserX, FiUserCheck } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => adminAPI.getCustomers().then(r => setCustomers(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const handleBlock = async (id, isBlocked) => {
    try {
      if (isBlocked) { await adminAPI.unblockCustomer(id); toast.success('Customer unblocked'); }
      else { await adminAPI.blockCustomer(id); toast.success('Customer blocked'); }
      fetch();
    } catch { toast.error('Action failed'); }
  };

  return (
    <div className="rounded-2xl overflow-hidden gold-border" style={{ background: 'var(--color-surface)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Customer', 'Email', 'Phone', 'Joined', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array(8).fill(0).map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                {Array(6).fill(0).map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 shimmer rounded" /></td>)}
              </tr>
            )) : customers.map(c => (
              <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                         style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                         style={{ background: 'var(--color-gold)', color: '#0A0A0A' }}>
                      {c.name?.charAt(0)}
                    </div>
                    <span className="font-medium" style={{ color: 'var(--color-cream)' }}>{c.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{c.email}</td>
                <td className="px-5 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{c.phone || '—'}</td>
                <td className="px-5 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.isBlocked ? 'status-cancelled' : 'status-delivered'}`}>
                    {c.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => handleBlock(c.id, c.isBlocked)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ background: c.isBlocked ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: c.isBlocked ? '#4ADE80' : '#EF4444', border: `1px solid ${c.isBlocked ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                    {c.isBlocked ? <><FiUserCheck size={13} /> Unblock</> : <><FiUserX size={13} /> Block</>}
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {!loading && customers.length === 0 && (
          <p className="text-center py-10 text-sm" style={{ color: 'var(--color-muted)' }}>No customers yet</p>
        )}
      </div>
    </div>
  );
}
