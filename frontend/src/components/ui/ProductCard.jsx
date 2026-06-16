import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiStar, FiZap } from 'react-icons/fi';
import { wishlistAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import toast from 'react-hot-toast';

function StarRating({ rating, count }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1,2,3,4,5].map(i => (
          <FiStar key={i} size={11}
            className={i <= Math.round(rating) ? 'star-filled' : 'star-empty'}
            fill={i <= Math.round(rating) ? '#D4AF37' : 'none'}
          />
        ))}
      </div>
      {count != null && <span className="text-xs" style={{ color: 'var(--color-muted)' }}>({count})</span>}
    </div>
  );
}

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const { isInWishlist, addToWishlistSet, removeFromWishlistSet } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const discountPct = product.discountPrice && product.originalPrice
    ? Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { toast.error('Please login to add to cart'); return; }
    try {
      await addToCart(product.id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { toast.error('Please login'); return; }
    try {
      if (inWishlist) {
        await wishlistAPI.remove(product.id);
        removeFromWishlistSet(product.id);
        toast.success('Removed from wishlist');
      } else {
        await wishlistAPI.add(product.id);
        addToWishlistSet(product.id);
        toast.success('Added to wishlist!');
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="relative card-hover rounded-2xl overflow-hidden gold-border group"
      style={{ background: 'var(--color-surface)' }}
    >
      <Link to={`/products/${product.id}`}>
        {/* Image */}
        <div className="relative overflow-hidden aspect-square" style={{ background: 'var(--color-surface-2)' }}>
          {product.primaryImage ? (
            <img
              src={product.primaryImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl">🌹</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discountPct > 0 && (
              <span className="badge-gold px-2 py-1 rounded-lg text-xs font-bold">-{discountPct}%</span>
            )}
            {product.isNewArrival && (
              <span className="px-2 py-1 rounded-lg text-xs font-bold"
                    style={{ background: 'rgba(34,197,94,0.15)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.3)' }}>
                NEW
              </span>
            )}
            {product.isLuxury && (
              <span className="px-2 py-1 rounded-lg text-xs font-bold"
                    style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}>
                LUXURY
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center glass transition-all duration-200 hover:scale-110"
            style={{ color: inWishlist ? '#EF4444' : 'var(--color-cream)' }}
          >
            <FiHeart size={16} fill={inWishlist ? '#EF4444' : 'none'} />
          </button>

          {/* Out of stock overlay */}
          {!product.isInStock && (
            <div className="absolute inset-0 flex items-center justify-center"
                 style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}>
              <span className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                    style={{ background: 'rgba(239,68,68,0.8)' }}>Out of Stock</span>
            </div>
          )}

          {/* Quick Add Overlay */}
          {product.isInStock && (
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleAddToCart}
                className="w-full py-2.5 rounded-xl text-sm font-semibold btn-gold flex items-center justify-center gap-2"
              >
                <FiShoppingBag size={15} /> Quick Add
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--color-gold)' }}>
            {product.brand}
          </p>
          <h3 className="font-display text-base font-semibold line-clamp-1 mb-1" style={{ color: 'var(--color-cream)' }}>
            {product.name}
          </h3>
          {product.fragranceFamily && (
            <p className="text-xs mb-2" style={{ color: 'var(--color-muted)' }}>{product.fragranceFamily}</p>
          )}
          <StarRating rating={product.avgRating || 0} count={product.reviewCount} />
          <div className="flex items-center gap-2 mt-3">
            {product.discountPrice ? (
              <>
                <span className="font-bold" style={{ color: 'var(--color-gold)' }}>
                  ₹{product.discountPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-sm price-original">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              </>
            ) : (
              <span className="font-bold" style={{ color: 'var(--color-gold)' }}>
                ₹{product.originalPrice?.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
