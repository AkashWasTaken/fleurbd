import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, Share2, ArrowLeft, Truck, ShieldCheck, RefreshCcw } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { Product } from '../types';
import toast from 'react-hot-toast';
import { productService } from '../services/dataService';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      productService.getProductBySlug(slug)
        .then(data => {
          setProduct(data || null);
          setLoading(false);
        });
    }
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen bg-pink-bg flex items-center justify-center font-display text-4xl italic overflow-hidden">Loading Editorial Piece...</div>;
  }

  if (!product) {
    return <div className="min-h-screen bg-pink-bg flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-display mb-6">Product Not Found</h1>
      <Link to="/shop" className="btn-black">Back to Catalogue</Link>
    </div>;
  }

  const handleAddToCart = () => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || 'https://picsum.photos/seed/placeholder/800/800',
      slug: product.slug
    });
    toast.success('READY TO WEAR: ITEM ADDED TO BAG');
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Back link */}
      <div className="bg-white border-b-2 border-black py-4 px-4 md:px-10">
        <Link to="/shop" className="inline-flex items-center gap-2 font-boxy font-black uppercase text-[10px] tracking-widest text-black hover:text-pink-hot transition-colors">
          <ArrowLeft size={14} /> Back to shop
        </Link>
      </div>

      <div className="container mx-auto py-10 px-4">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-white border-2 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
               <img 
                 src={product.images[activeImg]?.url || `https://picsum.photos/seed/${product.slug}/800/1000`} 
                 alt={product.name} 
                 className="w-full h-full object-cover"
                 referrerPolicy="no-referrer"
               />
            </div>
            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
               {[...Array(4)].map((_, i) => (
                 <button 
                   key={i}
                   onClick={() => setActiveImg(i)}
                   className={`aspect-square border-2 transition-all overflow-hidden ${activeImg === i ? 'border-pink-hot shadow-[4px_4px_0px_0px_rgba(255,0,127,1)]' : 'border-black opacity-50 hover:opacity-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]'}`}
                 >
                   <img src={`https://picsum.photos/seed/${product.slug}-${i}/400/400`} alt="Thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                 </button>
               ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col justify-center">
             <div className="mb-8">
                <span className="bg-black text-white text-[9px] font-black px-4 py-1.5 uppercase tracking-[0.3em] inline-block mb-6">
                  Featured / {product.category}
                </span>
                <h1 className="text-4xl md:text-7xl font-display font-black leading-none uppercase tracking-tighter mb-4 text-black">{product.name}</h1>
                <div className="flex items-center gap-6">
                   <span className="text-4xl md:text-6xl font-display text-pink-hot font-black">৳{product.price}</span>
                   {product.compareAtPrice && (
                     <span className="text-gray-300 line-through text-xl md:text-2xl font-bold decoration-black">৳{product.compareAtPrice}</span>
                   )}
                </div>
             </div>

             <div className="h-1.5 w-16 bg-black mb-8" />

             <p className="text-black font-boxy font-bold text-base leading-relaxed mb-10 pb-8 border-b-2 border-black/5">
               {product.description || "Designed for high-impact presence. This piece embodies the fleur philosophy of bold, boxy construction and budget-friendly elegance."}
             </p>

             <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="btn-fleur flex-grow py-5 text-xl h-16"
                >
                  <ShoppingBag size={24} /> {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
                </button>
                <button className="flex items-center justify-center w-16 h-16 border-2 border-black text-black hover:text-pink-hot hover:bg-black/5 transition-all">
                   <Heart size={28} />
                </button>
             </div>

             {/* Policy / Trust */}
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t-2 border-black">
                {[
                  { Icon: Truck, label: 'Express', sub: '2-3 Days' },
                  { Icon: ShieldCheck, label: 'Secure', sub: 'Verified Pay' },
                  { Icon: RefreshCcw, label: 'Returns', sub: '7 Day Policy' }
                ].map(item => (
                  <div key={item.label} className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-2">
                     <div className="bg-black text-white w-10 h-10 flex items-center justify-center border border-black group">
                        <item.Icon size={18} />
                     </div>
                     <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-black mb-0.5">{item.label}</h4>
                        <p className="text-gray-400 text-[8px] uppercase font-bold">{item.sub}</p>
                     </div>
                  </div>
                ))}
             </div>
             
             {/* Social CTA */}
             <div className="mt-12 p-6 bg-pink-50 border-2 border-black flex items-center justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div>
                   <span className="text-black font-black text-[10px] uppercase tracking-widest block mb-1">Seen on Instagram?</span>
                   <p className="text-[9px] uppercase font-bold text-pink-hot tracking-widest">Share your fleur look #fleurBD</p>
                </div>
                <div className="w-12 h-12 bg-black flex items-center justify-center text-pink-hot">
                  <Share2 size={24} />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
