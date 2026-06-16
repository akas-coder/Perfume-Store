import { useState, useEffect } from 'react';
import { FiStar, FiCheck, FiX, FiTrash2 } from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => adminAPI.getReviews().then(r => setReviews(r.data.data?.content || [])).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const handleApprove = async (id) => {
    await adminAPI.approveReview(id); toast.success('Approved'); fetch();
  };
  const handleReject = async (id) => {
    await adminAPI.rejectReview(id); toast.success('Rejected'); fetch();
  };
  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    await adminAPI.deleteReview(id); toast.success('Deleted'); fetch();
  };

  return (
    <div className="space-y-4">
      {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="h-24 shimmer rounded-2xl" />) :
       reviews.length === 0 ? <p className="text-center py-10 text-sm" style={{ color: 'var(--color-muted)' }}>No reviews found</p> :
       reviews.map((r, i) => (
        <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="p-5 rounded-2xl gold-border" style={{ background: 'var(--color-surface)' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="font-medium text-sm" style={{ color: 'var(--color-cream)' }}>{r.user?.name}</span>
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>on <span style={{ color: 'var(--color-gold)' }}>{r.product?.name}</span></span>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => <FiStar key={s} size={12} fill={s <= r.rating ? '#D4AF37' : 'none'} stroke={s <= r.rating ? '#D4AF37' : '#555'} />)}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.isApproved ? 'status-delivered' : r.isRejected ? 'status-cancelled' : 'status-pending'}`}>
                  {r.isApproved ? 'Approved' : r.isRejected ? 'Rejected' : 'Pending'}
                </span>
              </div>
              {r.title && <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-cream)' }}>{r.title}</p>}
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{r.body}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {!r.isApproved && <button onClick={() => handleApprove(r.id)} className="p-2 rounded-lg transition-colors" style={{ background: 'rgba(34,197,94,0.1)', color: '#4ADE80' }}><FiCheck size={15} /></button>}
              {!r.isRejected && <button onClick={() => handleReject(r.id)} className="p-2 rounded-lg transition-colors" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}><FiX size={15} /></button>}
              <button onClick={() => handleDelete(r.id)} className="p-2 rounded-lg text-red-400 hover:bg-white hover:bg-opacity-5"><FiTrash2 size={15} /></button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
