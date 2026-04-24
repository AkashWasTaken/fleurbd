import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

export default function ProductCard({ product }: { product: Product, key?: any }) {
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
