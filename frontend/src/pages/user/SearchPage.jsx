import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { productAPI } from '../../services/api';
import ProductCard from '../../components/ui/ProductCard';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    productAPI.search(query, 0, 20)
      .then(r => setResults(r.data.data?.content || []))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-3">
          <FiSearch size={20} style={{ color: 'var(--color-gold)' }} />
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--color-cream)' }}>
            Search Results
          </h1>
        </div>
        <p className="mb-8 text-sm" style={{ color: 'var(--color-muted)' }}>
          {loading ? 'Searching...' : `${results.length} results for "${query}"`}
        </p>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)' }}>
                <div className="aspect-square shimmer" />
                <div className="p-4 space-y-2"><div className="h-3 w-20 shimmer rounded" /><div className="h-4 w-full shimmer rounded" /></div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-7xl">🔍</span>
            <h3 className="font-display text-2xl mt-4 mb-2" style={{ color: 'var(--color-cream)' }}>No results found</h3>
            <p className="mb-6" style={{ color: 'var(--color-muted)' }}>Try a different search term</p>
            <Link to="/products" className="px-6 py-3 rounded-full text-sm btn-outline-gold">Browse All</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {results.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
