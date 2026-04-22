import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { Product } from '../types';
import toast from 'react-hot-toast';

export default function ProductCard({ product }: { product: Product, key?: any }) {
  const addItem = useCartStore((state) => state.addItem);
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || 'https://picsum.photos/seed/placeholder/800/800',
      slug: product.slug
    });
    
    toast((t) => (
      <div className="flex items-center justify-between gap-4 w-full">
        <span className="font-black uppercase text-[10px]">Added to Bag!</span>
        <button 
          onClick={() => {
            toast.dismiss(t.id);
            navigate('/checkout');
          }}
          className="bg-black text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-pink-hot transition-all"
        >
          Checkout now?
        </button>
      </div>
    ), { duration: 5000 });
  };

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="border-2 border-black bg-white p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] group-hover:shadow-[10px_10px_0px_0px_rgba(255,0,127,1)]">
        {/* Image */}
        <div className="aspect-[3/4] border-2 border-black overflow-hidden mb-4 relative bg-pink-50">
          <img 
            src={product.images[0]?.url || `https://picsum.photos/seed/${product.slug}/800/800`} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <button 
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 w-10 h-10 bg-black text-white flex items-center justify-center transition-all duration-300 hover:bg-pink-hot border border-white"
          >
            <ShoppingCart size={18} />
          </button>
        </div>

        {/* Details */}
        <div className="space-y-1">
          <h3 className="font-display font-black text-black uppercase text-[11px] leading-tight line-clamp-1">{product.name}</h3>
          <div className="flex justify-between items-center">
            <p className="text-pink-hot font-boxy font-black text-sm">৳{product.price}</p>
            <span className="text-[8px] font-black font-boxy text-gray-400 uppercase tracking-widest">BDT</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
