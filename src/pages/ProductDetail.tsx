import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { Product } from '../types';
import toast from 'react-hot-toast';
import { productService } from '../services/dataService';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
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
      id: product._id || '',
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || 'https://picsum.photos/seed/placeholder/800/800',
      slug: product.slug
    });
    
    toast((t) => (
      <div className="flex items-center justify-between gap-4 w-full">
        <span className="font-black uppercase text-[10px]">READY TO WEAR: ADDED!</span>
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
    <div className="bg-white">
      {/* Back link */}
      <div className="bg-white border-b-2 border-black py-4 px-4 md:px-10">
        <Link to="/shop" className="inline-flex items-center gap-2 font-boxy font-black uppercase text-[10px] tracking-widest text-black hover:text-pink-hot transition-colors">
          <ArrowLeft size={14} /> Back to shop
        </Link>
      </div>

      <div className="container mx-auto py-8 px-4">
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
            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {product.images.map((img, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`aspect-square border-2 transition-all overflow-hidden bg-pink-50 ${activeImg === i ? 'border-pink-hot shadow-[4px_4px_0px_0px_rgba(255,0,127,1)]' : 'border-black opacity-50 hover:opacity-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]'}`}
                  >
                    <img src={img.url} alt="Thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
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

             {product.description && (
               <p className="text-black font-boxy font-bold text-base leading-relaxed mb-10 pb-8 border-b-2 border-black/5">
                 {product.description}
               </p>
             )}

              <div className="flex gap-4 mb-6">
                 <button 
                   onClick={() => {
                     navigate('/checkout', { 
                       state: { 
                         buyNowItem: {
                           id: product._id || '',
                           name: product.name,
                           price: product.price,
                           image: product.images[0]?.url || 'https://picsum.photos/seed/placeholder/800/800',
                           qty: 1,
                           slug: product.slug
                         } 
                       } 
                     });
                   }}
                   disabled={product.stock === 0}
                   className="btn-fleur flex-grow py-5 text-xl h-16"
                 >
                   {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                 </button>
                 <button 
                   onClick={handleAddToCart}
                   disabled={product.stock === 0}
                   className="w-16 h-16 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none bg-white shrink-0"
                   title="Add to Bag"
                 >
                   <ShoppingBag size={24} />
                 </button>
              </div>

             {/* Social CTA */}
             <div className="mt-6 p-6 bg-pink-50 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div>
                   <span className="text-black font-black text-[10px] uppercase tracking-widest block mb-1">Got your product?</span>
                   <p className="text-[9px] uppercase font-bold text-pink-hot tracking-widest">post it and tag @fleu.rbd in your story</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
