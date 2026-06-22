import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { FiArrowRight, FiStar, FiAward, FiTruck, FiShield, FiGift } from 'react-icons/fi';
import { productAPI, bannerAPI, categoryAPI } from '../../services/api';
import ProductCard from '../../components/ui/ProductCard';

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)' }}>
      <div className="aspect-square shimmer" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-20 shimmer rounded" />
        <div className="h-4 w-full shimmer rounded" />
        <div className="h-3 w-16 shimmer rounded" />
        <div className="h-5 w-24 shimmer rounded" />
      </div>
    </div>
  );
}

function SectionHeader({ tag, title, subtitle, linkTo, linkLabel }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
      <div>
        {tag && <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--color-gold)' }}>{tag}</p>}
        <h2 className="font-display text-3xl md:text-4xl font-semibold" style={{ color: 'var(--color-cream)' }}>{title}</h2>
        {subtitle && <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>{subtitle}</p>}
      </div>
      {linkTo && (
        <Link to={linkTo} className="flex items-center gap-2 text-sm font-medium group" style={{ color: 'var(--color-gold)' }}>
          {linkLabel || 'View All'}
          <FiArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

const getCategoryImageUrl = (catName, index) => {
  const name = catName.toLowerCase();
  if (name.includes('men')) {
    return 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&auto=format&fit=crop&q=80';
  } else if (name.includes('women') || name.includes('female')) {
    return 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80';
  } else if (name.includes('unisex')) {
    return 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=600&auto=format&fit=crop&q=80';
  } else if (name.includes('luxury')) {
    return 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=600&auto=format&fit=crop&q=80';
  }
  // Fallback by index
  const fallbacks = [
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=600&auto=format&fit=crop&q=80'
  ];
  return fallbacks[index % fallbacks.length];
};

export default function HomePage() {
  const [banners, setBanners] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [luxury, setLuxury] = useState([]);
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      bannerAPI.getActive(),
      productAPI.getFeatured(),
      productAPI.getBestSellers(),
      productAPI.getNewArrivals(),
      productAPI.getLuxury(),
      productAPI.getTrending(),
      categoryAPI.getAll(),
    ]).then(([b, f, bs, na, lux, tr, cats]) => {
      setBanners(b.data.data || []);
      setFeatured(f.data.data || []);
      setBestSellers(bs.data.data || []);
      setNewArrivals(na.data.data || []);
      setLuxury(lux.data.data || []);
      setTrending(tr.data.data || []);
      setCategories(cats.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const testimonials = [
    { name: 'Priya Sharma', rating: 5, text: 'Absolutely divine! The Rose Élégance is my new signature scent. Fast delivery and beautiful packaging.', city: 'Mumbai' },
    { name: 'Rahul Mehta', rating: 5, text: 'Black Oud Intense is exactly what I was looking for — deep, mysterious, and long-lasting.', city: 'Delhi' },
    { name: 'Ananya Singh', rating: 5, text: 'The fragrance quiz helped me discover Velvet Oud Rose and I am obsessed! Highly recommend.', city: 'Bangalore' },
    { name: 'Karan Patel', rating: 4, text: 'Premium quality at reasonable prices. Will definitely order again for gifting.', city: 'Pune' },
  ];

  const features = [
    { icon: FiTruck, title: 'Free Delivery', desc: 'On orders above ₹999', color: '#60A5FA' },
    { icon: FiShield, title: '100% Authentic', desc: 'Genuine products guaranteed', color: '#4ADE80' },
    { icon: FiGift, title: 'Gift Wrapping', desc: 'Premium packaging available', color: '#D4AF37' },
    { icon: FiAward, title: 'Expert Curation', desc: 'Handpicked by perfumers', color: '#A78BFA' },
  ];

  return (
    <div className="pt-20">
      {/* Hero Slider */}
      {banners.length > 0 ? (
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{ delay: 2000, disableOnInteraction: false, stopOnLastSlide: true }}
          pagination={{ clickable: true }}
          navigation
          loop={false}
          className="h-[60vh] md:h-[80vh]"
        >
          {banners.map((banner, index) => {
            const fallbackBanners = ['/banners/banner2.png', '/banners/banner3.png', '/banners/banner4.png', '/banners/banner5.png'];
            const fallbackImg = fallbackBanners[index % fallbackBanners.length];
            const hasValidImage = banner.imageUrl && (banner.imageUrl.startsWith('http') || banner.imageUrl.startsWith('/'));
            const finalImageUrl = hasValidImage ? banner.imageUrl : fallbackImg;

            return (
              <SwiperSlide key={banner.id}>
                <div className="relative h-full flex items-center justify-center">
                  <img 
                    src={finalImageUrl} 
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover" 
                    onError={(e) => {
                      e.target.src = fallbackImg;
                    }}
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.2) 100%)' }} />
                <div className="relative z-10 text-left max-w-7xl mx-auto px-6 w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--color-gold)' }}>
                      Premium Collection
                    </p>
                    <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold leading-tight mb-4 max-w-2xl"
                        style={{ color: 'var(--color-cream)' }}>
                      {banner.title}
                    </h1>
                    <p className="text-base md:text-lg max-w-xl mb-8" style={{ color: 'rgba(245,245,240,0.7)' }}>
                      {banner.subtitle}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Link to={banner.linkUrl || '/products'}
                            className="px-8 py-4 rounded-full text-sm font-semibold tracking-wider btn-gold">
                        {banner.buttonText || 'Shop Now'}
                      </Link>
                      <Link to="/quiz"
                            className="px-8 py-4 rounded-full text-sm font-semibold tracking-wider btn-outline-gold">
                        Take the Quiz
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
            );
          })}
        </Swiper>
      ) : (
        /* Default Hero if no banners */
        <div className="relative h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0"
               style={{ background: 'radial-gradient(ellipse at center, #1A1208 0%, #0A0A0A 70%)' }} />
          <div className="absolute inset-0 opacity-40"
               style={{ backgroundImage: 'url(/banners/banner3.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
          <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                      className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--color-gold)' }}>
              The Art of Fragrance
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                       className="font-display text-5xl md:text-7xl font-semibold leading-tight mb-6" style={{ color: 'var(--color-cream)' }}>
              Discover Your<br /><span className="text-gold-gradient">Signature Scent</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                      className="text-lg mb-10" style={{ color: 'rgba(245,245,240,0.7)' }}>
              Curated luxury fragrances from the world's finest perfume houses
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                        className="flex flex-wrap gap-4 justify-center">
              <Link to="/products" className="px-8 py-4 rounded-full text-sm font-semibold tracking-wider btn-gold">
                Shop Now
              </Link>
              <Link to="/quiz" className="px-8 py-4 rounded-full text-sm font-semibold tracking-wider btn-outline-gold">
                Fragrance Quiz
              </Link>
            </motion.div>
          </div>
        </div>
      )}

      {/* Features Bar */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
                className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                  <f.icon size={18} style={{ color: f.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-cream)' }}>{f.title}</p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <SectionHeader tag="Browse" title="Shop by Category" linkTo="/products" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.slice(0, 4).map((cat, i) => (
                <motion.div key={cat.id}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}>
                  <Link to={`/products?categoryId=${cat.id}`}
                        className="block relative rounded-2xl overflow-hidden aspect-square gold-border group card-hover">
                    <div className="absolute inset-0 w-full h-full overflow-hidden">
                      <img 
                        src={getCategoryImageUrl(cat.name, i)} 
                        alt={cat.name} 
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
                      />
                    </div>
                    <div className="absolute inset-0 transition-opacity duration-500"
                         style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }} />
                    <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                      <span className="font-display text-lg md:text-xl font-semibold tracking-wide transition-colors duration-300 group-hover:text-yellow-400"
                            style={{ color: 'var(--color-cream)' }}>
                        {cat.name}
                      </span>
                      <div className="w-8 h-0.5 mt-2 transition-all duration-300 group-hover:w-16" 
                           style={{ background: 'var(--color-gold)' }} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Perfumes */}
      {(featured.length > 0 || loading) && (
        <section className="py-20 px-6" style={{ background: 'var(--color-surface)' }}>
          <div className="max-w-7xl mx-auto">
            <SectionHeader tag="Handpicked" title="Featured Fragrances"
                           subtitle="Our experts' top picks for a memorable olfactory experience"
                           linkTo="/products?isFeatured=true" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {loading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
                       : featured.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {(bestSellers.length > 0 || loading) && (
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <SectionHeader tag="Most Loved" title="Best Sellers"
                           subtitle="The fragrances our customers can't stop buying"
                           linkTo="/products?isBestSeller=true" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {loading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
                       : bestSellers.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* Luxury Collection Banner */}
      {luxury.length > 0 && (
        <section className="py-20 px-6" style={{ background: 'var(--color-surface)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A1208, #0A0A0A)' }}>
              <div className="absolute inset-0 opacity-10"
                   style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1588514912908-6b02438d1e74?w=1400)', backgroundSize: 'cover' }} />
              <div className="relative z-10 p-10 md:p-16">
                <SectionHeader tag="Exclusive" title="Luxury Collection"
                               subtitle="The pinnacle of perfumery — rare ingredients, master craftsmanship"
                               linkTo="/products?isLuxury=true" linkLabel="Explore Luxury" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {luxury.slice(0, 3).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <SectionHeader tag="Just In" title="New Arrivals"
                           subtitle="Fresh additions to our ever-growing fragrance universe"
                           linkTo="/products?isNewArrival=true" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {newArrivals.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* Brand Story */}
      <section className="py-24 px-6" style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--color-gold)' }}>Our Story</p>
              <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-6" style={{ color: 'var(--color-cream)' }}>
                Where Luxury Meets<br /><span className="text-gold-gradient">Artistry</span>
              </h2>
              <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--color-muted)' }}>
                Liorix was born from a passion for the world's most exquisite fragrances. 
                We travel the globe to source the finest ingredients, partnering with legendary 
                perfume houses and emerging artisans alike.
              </p>
              <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--color-muted)' }}>
                Every bottle in our collection is a masterpiece — a story told in scent. 
                Our expert curators personally experience each fragrance before it earns a place on our shelves.
              </p>
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[['500+', 'Fragrances'], ['50+', 'Luxury Brands'], ['10K+', 'Happy Customers']].map(([num, label]) => (
                  <div key={label}>
                    <p className="font-display text-3xl font-semibold text-gold-gradient">{num}</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>{label}</p>
                  </div>
                ))}
              </div>
              <Link to="/products" className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold btn-gold">
                Explore Collection <FiArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
                        className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden"
                   style={{ background: 'var(--color-surface-2)' }}>
                <img src="https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800"
                     alt="Perfume artistry"
                     className="w-full h-full object-cover opacity-80" />
              </div>
              <div className="absolute -bottom-6 -left-6 p-6 rounded-2xl glass"
                   style={{ border: '1px solid rgba(212,175,55,0.3)' }}>
                <FiAward size={28} style={{ color: 'var(--color-gold)' }} />
                <p className="font-display text-lg font-semibold mt-2" style={{ color: 'var(--color-cream)' }}>100% Authentic</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Every product verified</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--color-gold)' }}>
              What Our Customers Say
            </p>
            <h2 className="font-display text-4xl font-semibold" style={{ color: 'var(--color-cream)' }}>
              Loved by Fragrance Enthusiasts
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl gold-border"
                style={{ background: 'var(--color-surface)' }}
              >
                <div className="flex mb-3">
                  {[1,2,3,4,5].map(s => (
                    <FiStar key={s} size={14} fill="#D4AF37" stroke="#D4AF37" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4 line-clamp-3" style={{ color: 'var(--color-muted)' }}>
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                       style={{ background: 'var(--color-gold)', color: 'var(--color-black)' }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-cream)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{t.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
