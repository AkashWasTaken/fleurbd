import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { orderService } from '../services/dataService';
import { CheckCircle, Clock, Truck, XCircle, Search, Eye, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders();
      setOrders(data || []);
    } catch (err) {
      toast.error('FAILED TO FETCH ORDERS');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return <CheckCircle size={16} className="text-green-500" />;
      case 'pending': return <Clock size={16} className="text-pink-hot" />;
      case 'shipped': return <Truck size={16} className="text-blue-500" />;
      case 'cancelled': return <XCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} />;
    }
  };

  const filtered = orders.filter(o => 
    (o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
     o.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || o.status === statusFilter)
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-12">
        <span className="text-pink-hot font-black uppercase text-xs tracking-[0.4em] block mb-2">Registry</span>
        <h1 className="text-6xl font-display uppercase tracking-tighter">Order Ledger</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-8 justify-between items-center">
        <div className="relative w-full lg:w-[400px]">
          <input 
            type="text" 
            placeholder="SEARCH ORDERS..."
            className="w-full bg-white border-2 border-black p-4 font-bold uppercase text-[10px] tracking-widest outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30" size={18} />
        </div>

        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2">
          {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 border-2 text-[9px] font-black uppercase tracking-widest transition-all
                ${statusFilter === status 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-black border-black/10 hover:border-black'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border-2 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-white uppercase text-[10px] tracking-widest">
              <th className="p-5 border-r border-white/10">Order Info</th>
              <th className="p-5 border-r border-white/10">Customer</th>
              <th className="p-5 border-r border-white/10 text-right">Amount</th>
              <th className="p-5 border-r border-white/10">Status</th>
              <th className="p-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="font-boxy font-bold text-[11px] divide-y divide-black/10">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="p-8 bg-pink-50/30" />
                </tr>
              ))
            ) : filtered.length > 0 ? (
              filtered.map(order => (
                <tr key={order._id} className="hover:bg-pink-50 transition-colors uppercase">
                  <td className="p-5">
                    <div className="font-black text-black">{order.orderNumber}</div>
                    <div className="text-[8px] text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()}</div>
                  </td>
                  <td className="p-5">
                    <div className="font-black">{order.customer.name}</div>
                    <div className="text-[9px] text-pink-hot">{order.customer.phone}</div>
                    <div className="text-[8px] text-gray-500 font-bold mt-1 uppercase tracking-tighter">
                      {order.customer.area?.replace('-', ' ')}
                    </div>
                  </td>
                  <td className="p-5 text-right font-black">
                    ৳{order.total.toLocaleString()}
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-2 py-0.5 border border-black text-[8px] font-black
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-pink-100 text-pink-700'}`}>
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <button className="p-2 border-2 border-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-20 text-center text-gray-300 font-display text-2xl">
                  Clear Skies • No Orders Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
