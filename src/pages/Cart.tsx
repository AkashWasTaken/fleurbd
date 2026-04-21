import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { items, removeItem, updateQty, total, count } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white border-2 border-pink-200 p-12 shadow-[12px_12px_0px_0px_rgba(244,114,182,0.1)] text-center max-w-lg">
          <div className="bg-pink-100 w-20 h-20 flex items-center justify-center mx-auto mb-8 border-2 border-pink-200">
            <ShoppingBag size={40} className="text-pink-500" />
          </div>
          <h1 className="text-5xl font-display font-black uppercase mb-4 tracking-tighter">Your bag is empty</h1>
          <p className="text-pink-400 font-boxy font-bold uppercase text-xs tracking-widest mb-8">Time to add some editorial flair to your collection.</p>
          <Link to="/shop" className="btn-fleur inline-block">Explore Pieces</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-pink-50 min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-6xl md:text-9xl font-display font-black uppercase tracking-tighter mb-16 text-center text-pink-600">My Shopping Bag</h1>
        
        <div className="grid lg:grid-cols-3 gap-12">
          {/* List */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white border-2 border-pink-200 p-6 flex flex-col sm:flex-row gap-8 shadow-[8px_8px_0px_0px_rgba(244,114,182,0.05)] hover:shadow-[12px_12px_0px_0px_rgba(244,114,182,0.1)] transition-all">
                <div className="w-full sm:w-48 aspect-square border-2 border-pink-100 bg-pink-50/50">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-3xl font-display font-black uppercase tracking-tight mb-2 text-pink-700">{item.name}</h3>
                      <p className="text-pink-500 font-boxy font-black text-2xl">৳{item.price}</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-pink-300 hover:text-pink-600 transition-colors">
                      <Trash2 size={24} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-pink-50">
                    <div className="flex items-center border-2 border-pink-200 bg-pink-50/30">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} className="p-3 hover:bg-pink-100 text-pink-500">
                        <Minus size={18} />
                      </button>
                      <span className="px-6 font-boxy font-black text-pink-700">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} className="p-3 hover:bg-pink-100 text-pink-500">
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-[10px] font-black font-boxy text-pink-300 uppercase tracking-widest">Subtotal: ৳{item.price * item.qty}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-8">
             <div className="bg-pink-600 text-white p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-2 border-pink-700">
                <h2 className="text-4xl font-display font-black uppercase tracking-tight mb-10 border-b border-pink-400 pb-6">Summary</h2>
                <div className="flex flex-col gap-6 mb-10 font-boxy font-bold">
                   <div className="flex justify-between uppercase tracking-widest text-xs">
                      <span className="text-pink-100">Subtotal ({count()} items)</span>
                      <span>৳{total()}</span>
                   </div>
                   <div className="flex justify-between uppercase tracking-widest text-xs">
                      <span className="text-pink-100">Delivery Charge</span>
                      <span>৳80</span>
                   </div>
                   <div className="border-t border-pink-400 pt-6 flex justify-between font-black uppercase text-2xl">
                      <span className="text-pink-100">Total</span>
                      <span>৳{total() + 80}</span>
                   </div>
                </div>
                <Link to="/checkout" className="w-full bg-white text-pink-600 py-5 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-black-fleur hover:text-white transition-all">
                  Checkout <ArrowRight size={24} />
                </Link>
             </div>
             
             <div className="bg-white border-2 border-pink-200 p-8 shadow-[8px_8px_0px_0px_rgba(244,114,182,0.05)]">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-pink-400">Payment Assurance</p>
                <div className="grid grid-cols-4 gap-3">
                   {['COD', 'bKash', 'Nagad', 'UPAY'].map(p => (
                     <div key={p} className="border-2 border-pink-100 p-3 text-center text-[9px] font-black text-pink-400">{p}</div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
