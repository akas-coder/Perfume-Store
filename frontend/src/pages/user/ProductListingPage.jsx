import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiX, FiChevronDown, FiGrid, FiList } from 'react-icons/fi';
import { productAPI, categoryAPI } from '../../services/api';
import ProductCard from '../../components/ui/ProductCard';

const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Newest First' },
  { value: 'discountPrice,asc', label: 'Price: Low to High' },
  { value: 'discountPrice,desc', label: 'Price: High to Low' },
  { value: 'avgRating,desc', label: 'Highest Rated' },
  { value: 'soldCount,desc', label: 'Best Selling' },
];

const FRAGRANCE_FAMILIES = ['Floral', 'Oriental', 'Woody', 'Fresh', 'Citrus', 'Gourmand', 'Aquatic', 'Chypre'];

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filters state from URL params
  const page = parseInt(searchParams.get('page') || '0');
  const [sort, setSort] = useState('createdAt,desc');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
  const [selectedGender, setSelectedGender] = useState(searchParams.get('gender') || '');
  const [selectedFamily, setSelectedFamily] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');

  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data.data || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const [sortBy, sortDir] = sort.split(',');
    const params = {
      page, size: 12, sortBy, sortDir,
      ...(selectedCategory && { categoryId: selectedCategory }),
      ...(selectedGender && { gender: selectedGender }),
      ...(selectedFamily && { fragranceFamily: selectedFamily }),
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
      ...(minRating && { minRating }),
    };
    productAPI.getAll(params).then(r => {
      setProducts(r.data.data?.content || []);
      setTotalPages(r.data.data?.totalPages || 0);
      setTotalElements(r.data.data?.totalElements || 0);
    }).catch(() => setProducts([]))
    .finally(() => setLoading(false));
  }, [page, sort, selectedCategory, selectedGender, selectedFamily, minPrice, maxPrice, minRating]);

  const clearFilters = () => {
    setSelectedCategory(''); setSelectedGender(''); setSelectedFamily('');
    setMinPrice(''); setMaxPrice(''); setMinRating('');
    setSearchParams({});
  };

  const hasFilters = selectedCategory || selectedGender || selectedFamily || minPrice || maxPrice || minRating;

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-cream)' }}>Category</h3>
        <div className="space-y-2">
          {[{ id: '', name: 'All Categories' }, ...categories].map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                color: selectedCategory === cat.id ? 'var(--color-gold)' : 'var(--color-muted)',
                background: selectedCategory === cat.id ? 'rgba(212,175,55,0.1)' : 'transparent',
              }}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-cream)' }}>Gender</h3>
        <div className="flex flex-wrap gap-2">
          {['', 'MEN', 'WOMEN', 'UNISEX'].map(g => (
            <button key={g} onClick={() => setSelectedGender(g)}
              className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                border: '1px solid',
                borderColor: selectedGender === g ? 'var(--color-gold)' : 'var(--color-border)',
                color: selectedGender === g ? 'var(--color-gold)' : 'var(--color-muted)',
                background: selectedGender === g ? 'rgba(212,175,55,0.1)' : 'transparent',
              }}>
              {g || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Fragrance Family */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-cream)' }}>Fragrance Family</h3>
        <div className="flex flex-wrap gap-2">
          {FRAGRANCE_FAMILIES.map(f => (
            <button key={f} onClick={() => setSelectedFamily(selectedFamily === f ? '' : f)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                border: '1px solid',
                borderColor: selectedFamily === f ? 'var(--color-gold)' : 'var(--color-border)',
                color: selectedFamily === f ? 'var(--color-gold)' : 'var(--color-muted)',
                background: selectedFamily === f ? 'rgba(212,175,55,0.1)' : 'transparent',
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-cream)' }}>Price Range (₹)</h3>
        <div className="flex gap-3">
          <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm input-dark" />
          <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm input-dark" />
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-cream)' }}>Min Rating</h3>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(r => (
            <button key={r} onClick={() => setMinRating(minRating == r ? '' : r)}
              className="w-9 h-9 rounded-lg text-sm font-medium transition-all"
              style={{
                background: minRating == r ? 'var(--color-gold)' : 'var(--color-surface-2)',
                color: minRating == r ? '#0A0A0A' : 'var(--color-muted)',
              }}>
              {r}★
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button onClick={clearFilters} className="w-full py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--color-cream)' }}>
              {selectedGender === 'MEN' ? "Men's Fragrances" : selectedGender === 'WOMEN' ? "Women's Fragrances" : 'All Fragrances'}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
              {loading ? '...' : `${totalElements} fragrances found`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg text-sm btn-outline-gold">
              <FiFilter size={16} /> Filters {hasFilters && <span className="badge-gold rounded-full px-1.5 text-xs">{[selectedCategory,selectedGender,selectedFamily,minPrice,minRating].filter(Boolean).length}</span>}
            </button>
            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="px-5 py-2.5 rounded-xl text-sm input-dark cursor-pointer">
              {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 rounded-2xl p-6 gold-border" style={{ background: 'var(--color-surface)' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold" style={{ color: 'var(--color-cream)' }}>Filters</h2>
                {hasFilters && <button onClick={clearFilters} className="text-xs" style={{ color: '#EF4444' }}>Clear all</button>}
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Mobile Filter Drawer */}
          <AnimatePresence>
            {filtersOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 lg:hidden" style={{ background: 'rgba(0,0,0,0.7)' }}
                  onClick={() => setFiltersOpen(false)} />
                <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
                  className="fixed left-0 top-0 bottom-0 z-50 w-72 overflow-y-auto p-6 lg:hidden"
                  style={{ background: 'var(--color-surface)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold" style={{ color: 'var(--color-cream)' }}>Filters</h2>
                    <button onClick={() => setFiltersOpen(false)} style={{ color: 'var(--color-muted)' }}><FiX size={20} /></button>
                  </div>
                  <FilterPanel />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array(12).fill(0).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)' }}>
                    <div className="aspect-square shimmer" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 w-20 shimmer rounded" />
                      <div className="h-4 w-full shimmer rounded" />
                      <div className="h-5 w-24 shimmer rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <span className="text-7xl">🌹</span>
                <h3 className="font-display text-2xl mt-4" style={{ color: 'var(--color-cream)' }}>No fragrances found</h3>
                <p className="mt-2" style={{ color: 'var(--color-muted)' }}>Try adjusting your filters</p>
                <button onClick={clearFilters} className="mt-4 px-6 py-2 rounded-full text-sm btn-outline-gold">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                  {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button key={i}
                        onClick={() => setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('page', i); return p; })}
                        className="w-9 h-9 rounded-lg text-sm font-medium transition-all"
                        style={{
                          background: page === i ? 'var(--color-gold)' : 'var(--color-surface)',
                          color: page === i ? '#0A0A0A' : 'var(--color-muted)',
                          border: '1px solid',
                          borderColor: page === i ? 'var(--color-gold)' : 'var(--color-border)',
                        }}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
