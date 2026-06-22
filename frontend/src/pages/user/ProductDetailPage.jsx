import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiStar, FiTruck, FiShield, FiMinus, FiPlus, FiGift, FiChevronRight } from 'react-icons/fi';
import { productAPI, reviewAPI, wishlistAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../../components/ui/ProductCard';
import toast from 'react-hot-toast';

function StarRating({ rating, count, size = 16 }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(i => (
          <FiStar key={i} size={size} fill={i <= Math.round(rating) ? '#D4AF37' : 'none'}
                  stroke={i <= Math.round(rating) ? '#D4AF37' : '#555'} />
        ))}
      </div>
      {count != null && <span className="text-sm" style={{ color: 'var(--color-muted)' }}>({count} reviews)</span>}
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [giftPackaging, setGiftPackaging] = useState('NORMAL');
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('notes');
  const [addingToCart, setAddingToCart] = useState(false);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const { isInWishlist, addToWishlistSet, removeFromWishlistSet } = useWishlist();
  const inWishlist = isInWishlist(parseInt(id));
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    Promise.all([
      productAPI.getById(id),
      productAPI.getRelated(id),
      reviewAPI.getByProduct(id),
    ]).then(([p, r, rev]) => {
      setProduct(p.data.data);
      setRelated(r.data.data || []);
      setReviews(rev.data.data?.content || []);
    }).catch(() => navigate('/products'))
    .finally(() => {
      setLoading(false);
      const tab = searchParams.get('tab');
      if (tab === 'reviews') {
        setActiveTab('reviews');
        if (searchParams.get('write') === 'true') {
          setShowReviewForm(true);
        }
      }
    });
  }, [id, searchParams]);

  const handleAddToCart = async () => {
    if (!isLoggedIn) { toast.error('Please login to add to cart'); navigate('/login'); return; }
    setAddingToCart(true);
    try {
      await addToCart(product.id, qty, giftPackaging);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!isLoggedIn) { toast.error('Please login'); navigate('/login'); return; }
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
    } catch { toast.error('Action failed'); }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { toast.error('Please login to write a review'); return; }
    setSubmittingReview(true);
    try {
      const res = await reviewAPI.add(id, { rating: reviewRating, title: reviewTitle, body: reviewBody });
      setReviews(prev => [res.data.data, ...prev]);
      setShowReviewForm(false);
      setReviewTitle(''); setReviewBody(''); setReviewRating(5);
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-square shimmer rounded-2xl" />
          <div className="space-y-4">
            {Array(6).fill(0).map((_, i) => <div key={i} className="h-6 shimmer rounded" style={{ width: `${80 - i * 10}%` }} />)}
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const images = product.images?.length > 0 ? product.images.map(img => img.imageUrl || img) : [null];
  const currentPrice = product.discountPrice || product.originalPrice;
  const discountPct = product.discountPrice
    ? Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: 'var(--color-muted)' }}>
          <Link to="/" className="hover:text-yellow-400">Home</Link>
          <FiChevronRight size={12} />
          <Link to="/products" className="hover:text-yellow-400">Collections</Link>
          <FiChevronRight size={12} />
          <span style={{ color: 'var(--color-gold)' }}>{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)' }}>
              {images[activeImage] ? (
                <img src={images[activeImage]} alt={product.name}
                     className="w-full h-full object-cover transition-all duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">🌹</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all"
                    style={{ border: `2px solid ${activeImage === i ? 'var(--color-gold)' : 'transparent'}` }}>
                    {img ? <img src={img} alt="" className="w-full h-full object-cover" />
                         : <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: 'var(--color-surface-2)' }}>🌹</div>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand + Name */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-gold)' }}>
                {product.brand}
              </p>
              <h1 className="font-display text-4xl font-semibold" style={{ color: 'var(--color-cream)' }}>{product.name}</h1>
            </div>

            {/* Rating */}
            <StarRating rating={product.avgRating || 0} count={product.reviewCount} />

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.gender && <span className="px-3 py-1 rounded-full text-xs font-medium glass">{product.gender}</span>}
              {product.fragranceFamily && <span className="px-3 py-1 rounded-full text-xs font-medium glass">{product.fragranceFamily}</span>}
              {product.isLuxury && <span className="badge-gold px-3 py-1 rounded-full text-xs font-bold">LUXURY</span>}
              {product.isNewArrival && <span className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#4ADE80' }}>NEW ARRIVAL</span>}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-bold text-gold-gradient">
                ₹{currentPrice?.toLocaleString('en-IN')}
              </span>
              {product.discountPrice && (
                <>
                  <span className="text-xl price-original">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
                  <span className="px-2 py-1 rounded badge-gold text-xs font-bold">{discountPct}% OFF</span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.isInStock ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm" style={{ color: product.isInStock ? '#4ADE80' : '#F87171' }}>
                {product.isInStock ? `In Stock${product.stockQuantity != null ? ` (${product.stockQuantity} left)` : ''}` : 'Out of Stock'}
              </span>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{product.description}</p>

            {/* Quantity + Gift */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium" style={{ color: 'var(--color-cream)' }}>Quantity</span>
                <div className="flex items-center gap-2 rounded-xl p-1" style={{ background: 'var(--color-surface)' }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-yellow-400 hover:text-black"
                    style={{ color: 'var(--color-muted)' }}>
                    <FiMinus size={14} />
                  </button>
                  <span className="w-8 text-center font-semibold" style={{ color: 'var(--color-cream)' }}>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-yellow-400 hover:text-black"
                    style={{ color: 'var(--color-muted)' }}>
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>

              {/* Gift Packaging */}
              <div className="flex items-center gap-3">
                <FiGift size={16} style={{ color: 'var(--color-gold)' }} />
                <span className="text-sm" style={{ color: 'var(--color-cream)' }}>Gift Packaging:</span>
                {['NORMAL', 'PREMIUM'].map(opt => (
                  <button key={opt} onClick={() => setGiftPackaging(opt)}
                    className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
                    style={{
                      border: '1px solid',
                      borderColor: giftPackaging === opt ? 'var(--color-gold)' : 'var(--color-border)',
                      color: giftPackaging === opt ? 'var(--color-gold)' : 'var(--color-muted)',
                      background: giftPackaging === opt ? 'rgba(212,175,55,0.1)' : 'transparent',
                    }}>
                    {opt === 'NORMAL' ? 'Standard' : 'Premium (+₹99)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button onClick={handleAddToCart} disabled={!product.isInStock || addingToCart}
                className="flex-1 py-4 rounded-xl font-semibold text-sm btn-gold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <FiShoppingBag size={18} />
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button onClick={handleWishlist}
                className="w-14 h-14 rounded-xl flex items-center justify-center gold-border transition-all hover:scale-105"
                style={{ color: inWishlist ? '#EF4444' : 'var(--color-muted)' }}>
                <FiHeart size={20} fill={inWishlist ? '#EF4444' : 'none'} />
              </button>
            </div>

            <button onClick={handleBuyNow} disabled={!product.isInStock}
              className="w-full py-4 rounded-xl font-semibold text-sm btn-outline-gold disabled:opacity-50">
              Buy Now
            </button>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { icon: FiTruck, text: 'Free delivery above ₹999' },
                { icon: FiShield, text: '100% Authentic Product' },
              ].map(f => (
                <div key={f.text} className="flex items-center gap-2 p-3 rounded-xl"
                     style={{ background: 'var(--color-surface)' }}>
                  <f.icon size={16} style={{ color: 'var(--color-gold)' }} />
                  <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs: Notes, Details, Reviews */}
        <div className="mt-16">
          <div className="flex gap-6 border-b mb-8" style={{ borderColor: 'var(--color-border)' }}>
            {['notes', 'details', 'reviews'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium tracking-wider uppercase transition-colors border-b-2 -mb-px ${activeTab === tab ? '' : 'border-transparent'}`}
                style={{
                  color: activeTab === tab ? 'var(--color-gold)' : 'var(--color-muted)',
                  borderBottomColor: activeTab === tab ? 'var(--color-gold)' : 'transparent',
                }}>
                {tab === 'notes' ? 'Fragrance Notes' : tab === 'details' ? 'Details' : `Reviews (${reviews.length})`}
              </button>
            ))}
          </div>

          {activeTab === 'notes' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Top Notes', value: product.topNotes, desc: 'First impression (0-15 min)' },
                { label: 'Heart Notes', value: product.middleNotes, desc: 'Core character (30 min - 4 hrs)' },
                { label: 'Base Notes', value: product.baseNotes, desc: 'Lasting signature (4-8+ hrs)' },
              ].map(note => note.value && (
                <div key={note.label} className="p-6 rounded-2xl gold-border" style={{ background: 'var(--color-surface)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-gold)' }}>{note.label}</p>
                  <p className="font-display text-lg font-semibold mb-2" style={{ color: 'var(--color-cream)' }}>{note.value}</p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{note.desc}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['Brand', product.brand],
                ['Category', product.category?.name],
                ['Gender', product.gender],
                ['Fragrance Family', product.fragranceFamily],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="flex justify-between items-center px-5 py-3 rounded-xl"
                     style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <span className="text-sm" style={{ color: 'var(--color-muted)' }}>{label}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-cream)' }}>{value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Write Review */}
              {isLoggedIn ? (
                <div className="p-6 rounded-2xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  {!showReviewForm ? (
                    <button onClick={() => setShowReviewForm(true)} className="text-sm btn-outline-gold px-6 py-3 rounded-xl">
                      Write a Review
                    </button>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map(r => (
                          <button key={r} type="button" onClick={() => setReviewRating(r)}>
                            <FiStar size={24} fill={r <= reviewRating ? '#D4AF37' : 'none'}
                                    stroke={r <= reviewRating ? '#D4AF37' : '#555'} />
                          </button>
                        ))}
                      </div>
                      <input value={reviewTitle} onChange={e => setReviewTitle(e.target.value)}
                        placeholder="Review title" required
                        className="w-full px-4 py-3 rounded-xl text-sm input-dark" />
                      <textarea value={reviewBody} onChange={e => setReviewBody(e.target.value)}
                        placeholder="Share your experience..." rows={4} required
                        className="w-full px-4 py-3 rounded-xl text-sm input-dark resize-none" />
                      <div className="flex gap-3">
                        <button type="submit" disabled={submittingReview}
                          className="px-6 py-2.5 rounded-xl text-sm btn-gold disabled:opacity-50">
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                        <button type="button" onClick={() => setShowReviewForm(false)}
                          className="px-6 py-2.5 rounded-xl text-sm btn-outline-gold">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-2xl text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <p style={{ color: 'var(--color-muted)' }} className="text-sm">
                    Have you purchased this product? <Link to="/login" className="font-semibold transition-opacity hover:opacity-85" style={{ color: 'var(--color-gold)' }}>Log in</Link> to share your rating and review.
                  </p>
                </div>
              )}

              {reviews.length === 0 ? (
                <p className="text-center py-10" style={{ color: 'var(--color-muted)' }}>
                  No reviews yet. Be the first to review!
                </p>
              ) : (
                reviews.map(r => (
                  <div key={r.id} className="p-5 rounded-2xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                             style={{ background: 'var(--color-gold)', color: '#0A0A0A' }}>
                          {r.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--color-cream)' }}>{r.user?.name}</p>
                          {r.isVerifiedPurchase && <span className="text-xs" style={{ color: '#4ADE80' }}>✓ Verified Purchase</span>}
                        </div>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                        {new Date(r.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <StarRating rating={r.rating} />
                    {r.title && <p className="font-semibold mt-2 mb-1" style={{ color: 'var(--color-cream)' }}>{r.title}</p>}
                    <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{r.body}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-3xl font-semibold mb-8" style={{ color: 'var(--color-cream)' }}>
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
