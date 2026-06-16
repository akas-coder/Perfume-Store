import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { wishlistAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    wishlistAPI.get().then(r => setWishlist(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    await wishlistAPI.remove(productId);
    setWishlist(prev => prev.filter(w => w.product.id !== productId));
    toast.success('Removed from wishlist');
  };

  const handleMoveToCart = async (productId) => {
    try {
      await wishlistAPI.moveToCart(productId);
      setWishlist(prev => prev.filter(w => w.product.id !== productId));
      toast.success('Moved to cart!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to move to cart');
    }
  };

  if (loading) return <div className="min-h-screen pt-20 flex items-center justify-center"><div className="loader" /></div>;

  if (!wishlist.length) return (
    <div className="min-h-screen pt-20 flex flex-col items-center justify-center text-center px-4">
      <FiHeart size={64} style={{ color: 'var(--color-muted)' }} />
      <h2 className="font-display text-3xl font-semibold mt-6 mb-3" style={{ color: 'var(--color-cream)' }}>
        Your wishlist is empty
      </h2>
      <p className="mb-8" style={{ color: 'var(--color-muted)' }}>Save your favorite fragrances to revisit them later</p>
      <Link to="/products" className="px-8 py-4 rounded-full text-sm font-semibold btn-gold">Browse Collection</Link>
    </div>
  );

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl font-semibold mb-8" style={{ color: 'var(--color-cream)' }}>
          My Wishlist <span className="text-lg font-normal ml-2" style={{ color: 'var(--color-muted)' }}>({wishlist.length})</span>
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {wishlist.map((w, i) => {
            const p = w.product;
            const price = p.discountPrice || p.originalPrice;
            return (
              <motion.div key={w.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-2xl overflow-hidden gold-border group card-hover"
                style={{ background: 'var(--color-surface)' }}>
                <Link to={`/products/${p.id}`}>
                  <div className="relative aspect-square overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
                    {p.primaryImage
                      ? <img src={p.primaryImage} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-5xl">🌹</div>}
                    <button onClick={e => { e.preventDefault(); handleRemove(p.id); }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center glass transition-all hover:scale-110"
                      style={{ color: '#EF4444' }}>
                      <FiHeart size={14} fill="#EF4444" />
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-gold)' }}>{p.brand}</p>
                    <p className="font-display text-sm font-semibold line-clamp-1 mt-0.5" style={{ color: 'var(--color-cream)' }}>{p.name}</p>
                    <p className="font-bold mt-1" style={{ color: 'var(--color-gold)' }}>₹{price?.toLocaleString('en-IN')}</p>
                  </div>
                </Link>
                <div className="px-3 pb-3">
                  <button onClick={() => handleMoveToCart(p.id)}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold btn-gold flex items-center justify-center gap-2">
                    <FiShoppingBag size={13} /> Move to Cart
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
