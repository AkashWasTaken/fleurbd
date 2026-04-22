import React, { useState, useEffect } from 'react';
import { orderService } from '../services/dataService';
import { Order } from '../types';
import { Package, Clock, CheckCircle, Truck, ArrowLeft, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    setLoading(true);
    const savedOrders = JSON.parse(localStorage.getItem('fleur_my_orders') || '[]');
    if (savedOrders.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const data = await orderService.getOrdersByNumbers(savedOrders);
      if (data) {
        // Filter orders based on status and time
        const filtered = data.filter(order => {
          // 1. Instantly hide cancelled orders
          if (order.status === 'cancelled') return false;

          // 2. Hide delivered orders older than 24 hours
          if (order.status === 'delivered' && order.deliveredAt) {
            const deliveredDate = new Date(order.deliveredAt).getTime();
            const now = new Date().getTime();
            const oneDayInMs = 24 * 60 * 60 * 1000;
            return (now - deliveredDate) < oneDayInMs;
          }

          // 3. Keep all other statuses visible (pending, confirmed)
          return true;
        });
        setOrders(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: Order['status']) => {
    switch (status) {
      case 'pending': return { label: 'To be confirmed', icon: Clock, color: 'text-pink-400', bg: 'bg-pink-50' };
      case 'confirmed': return { label: 'Confirmed', icon: CheckCircle, color: 'text-yellow-600', bg: 'bg-yellow-50' };
      case 'shipped': return { label: 'To be delivered', icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50' };
      case 'delivered': return { label: 'Order Complete', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' };
      case 'cancelled': return { label: 'Cancelled', icon: Package, color: 'text-red-400', bg: 'bg-red-50' };
      default: return { label: status, icon: Clock, color: 'text-gray-400', bg: 'bg-gray-50' };
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      await orderService.updateOrder(orderId, { status: 'cancelled' });
      toast.success('ORDER CANCELLED');
      fetchMyOrders();
    } catch (err) {
      toast.error('FAILED TO CANCEL');
    }
  };

  return (
    <div className="bg-pink-50 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <Link to="/shop" className="inline-flex items-center gap-2 font-black uppercase text-[10px] tracking-widest text-pink-400 hover:text-pink-600 mb-4 transition-colors">
            <ArrowLeft size={14} /> Continue Shopping
          </Link>
          <h1 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter text-pink-600">My Orders</h1>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="h-48 bg-white border-2 border-pink-100 animate-pulse" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-8">
            {orders.map(order => {
              const status = getStatusDisplay(order.status);
              return (
                <div key={order.id} className="bg-white border-2 border-pink-200 shadow-hard overflow-hidden">
                  <div className="bg-black text-white p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-400 block mb-1">Order Ref</span>
                      <h3 className="font-display text-2xl uppercase tracking-tighter">{order.orderNumber}</h3>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-400 block mb-1">Created At</span>
                       <p className="font-display text-2xl uppercase tracking-tighter">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex flex-col md:flex-row gap-10">
                      {/* Products */}
                      <div className="flex-grow space-y-4">
                         <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-300 border-b border-pink-100 pb-2 mb-4">Items</h4>
                         <div className="space-y-3">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex gap-4 items-center">
                                <div className="w-12 h-12 border border-pink-100 p-1">
                                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-grow">
                                  <p className="font-black uppercase text-[10px] tracking-tight">{item.name}</p>
                                  <p className="text-[9px] font-bold text-pink-400">Qty: {item.qty}</p>
                                </div>
                                <div className="font-black text-xs">৳{item.price * item.qty}</div>
                              </div>
                            ))}
                         </div>
                      </div>

                      {/* Status */}
                      <div className="md:w-64 flex flex-col gap-6">
                         <div className={`${status.bg} border-2 border-pink-100 p-6 text-center`}>
                            <status.icon size={32} className={`mx-auto mb-4 ${status.color}`} />
                            <p className={`font-black uppercase text-[11px] tracking-[0.2em] ${status.color}`}>
                              {status.label}
                            </p>
                         </div>

                         {(order.status === 'pending' || order.status === 'confirmed') && (
                           <button 
                             onClick={() => handleCancelOrder(order._id!)}
                             className="flex items-center justify-center gap-2 w-full py-3 border-2 border-red-50 text-red-200 hover:border-red-500 hover:text-red-500 transition-all font-black uppercase text-[9px] tracking-widest mt-[-10px]"
                           >
                             <XCircle size={14} /> Cancel Order
                           </button>
                         )}

                         <div className="text-right border-t border-pink-50 pt-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-pink-300 block mb-2">Total Amount</span>
                            <p className="text-3xl font-display font-black text-pink-600">৳{order.total}</p>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border-2 border-pink-200 p-20 text-center shadow-hard">
            <Package size={64} className="mx-auto mb-8 text-pink-100" />
            <h2 className="text-4xl font-display font-black uppercase mb-4 tracking-tighter">No History Yet</h2>
            <p className="text-pink-300 font-boxy font-bold uppercase text-[10px] tracking-[0.4em] mb-10">Start your editorial journey today.</p>
            <Link to="/shop" className="btn-fleur px-10 h-14">Begin Collection</Link>
          </div>
        )}
      </div>
    </div>
  );
}
