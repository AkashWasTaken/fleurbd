import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { productService } from '../services/dataService';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getProducts()
      .then(data => {
        setProducts(data || []);
        setLoading(false);
      });
  }, []);

  const categories = ['jewelry', 'fashion', 'nails'];

  return (
    <div className="pb-32">
      {/* Welcome Card - Pastel Pink Premium */}
      <div className="mb-16 bg-pink-200 p-12 border-4 border-pink-300 shadow-[12px_12px_0px_0px_rgba(244,114,182,0.15)] text-pink-700 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-5xl md:text-7xl font-display font-black mb-4 leading-none uppercase tracking-tighter">
            Welcome to <br />
            <span className="text-pink-600">fleur</span>
          </h2>
          <div className="h-1 w-24 bg-pink-400 mb-6" />
          <p className="text-pink-500 font-boxy font-bold text-sm uppercase tracking-[0.4em] opacity-90">
            Dhaka's Curated Fashion Boutique
          </p>
        </div>
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-300 opacity-20 transform translate-x-16 -translate-y-16 rotate-45" />
      </div>

      {/* Category Rows Section */}
      <div className="space-y-24">
        {categories.map((cat) => {
          const catProducts = products.filter(p => p.category === cat);
          
          return (
            <div key={cat} className="space-y-8 bg-white border-2 border-pink-200 p-8 shadow-[8px_8px_0px_0px_rgba(244,114,182,0.05)]">
              <div className="flex items-center justify-between border-b-2 border-pink-200 pb-6 mb-8">
                <h2 className="text-3xl md:text-5xl font-display font-black capitalize tracking-tight flex items-center gap-4">
                  <span className="text-pink-300">{cat === 'nails' ? '03.' : cat === 'fashion' ? '02.' : '01.'}</span>
                  <span className="text-pink-600">{cat === 'nails' ? 'nails & beauty' : `${cat} pieces`}</span>
                </h2>
                <Link to={`/shop?category=${cat}`} className="btn-fleur text-[10px] py-1.5 px-4 h-auto shadow-none bg-pink-100 text-pink-600 border-pink-200 hover:bg-pink-200 transition-colors uppercase font-black">
                  shop all
                </Link>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-pink-50 border-2 border-black-fleur animate-pulse" />
                  ))
                ) : catProducts.length > 0 ? (
                  catProducts.slice(0, 4).map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))
                ) : (
                  <div className="col-span-full py-10 bg-pink-50 border-4 border-black-fleur border-dashed flex items-center justify-center">
                     <span className="text-xs font-boxy font-bold text-pink-500 uppercase tracking-widest">Collection arriving in transit...</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
