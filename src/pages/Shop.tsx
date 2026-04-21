import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { Filter, ChevronDown, Search } from 'lucide-react';
import { productService, settingsService } from '../services/dataService';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [search, setSearch] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const category = searchParams.get('category') || 'all';

  useEffect(() => {
    settingsService.getSettings().then(s => {
      if (s?.categories) {
        setCategories(['all', ...s.categories]);
      }
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Scroll to top immediately when category selection changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [category]);

  useEffect(() => {
    setLoading(true);
    productService.getProducts({ category })
      .then(data => {
        setProducts(data || []);
        setLoading(false);
      });
  }, [category]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white">
      <div className="py-0">
        {/* Search & Categories - Sleeker Black & Pink look */}
        <div className="flex flex-col lg:flex-row gap-4 mb-2 items-center justify-between">
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSearchParams({ category: cat })}
                className={`px-6 py-2.5 border-2 font-boxy font-black uppercase text-[10px] tracking-widest transition-all active:scale-95
                  ${category === cat 
                    ? 'bg-pink-hot text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                    : 'bg-white text-black border-black/10 hover:border-black'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-[350px]">
            <input
              type="text"
              placeholder="SEARCH PIECES..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border-2 border-black p-3 font-boxy font-black uppercase text-[10px] tracking-[0.2em] focus:outline-none focus:border-pink-hot shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-all"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-black" size={16} />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-pink-50 animate-pulse border-2 border-black-fleur" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-white border-4 border-dashed border-black-fleur opacity-50">
             <h3 className="text-xl font-display font-black uppercase text-black-fleur mb-2">No items found</h3>
             <button onClick={() => {setSearch(''); setSearchParams({category: 'all'})}} className="btn-fleur inline-flex">Clear All Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
