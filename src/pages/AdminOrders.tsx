import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { orderService } from '../services/dataService';
import { CheckCircle, Clock, XCircle, Search, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('new');

  useEffect(() => {
    fetchOrders();
  }, []);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  const handleUpdateStatus = async (id: string, newStatus: Order['status']) => {
    try {
      const updates: Partial<Order> = { status: newStatus };
      if (newStatus === 'delivered') {
        updates.deliveredAt = new Date().toISOString();
      }
      await orderService.updateOrder(id, updates);
      toast.success(`PIPELINE UPDATED: ${newStatus.toUpperCase()}`);
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder({ ...selectedOrder, ...updates });
      }
      fetchOrders();
    } catch (error) {
      toast.error('FAILED TO UPDATE STATUS');
    }
  };

  const handleUpdateNote = async (id: string, note: string) => {
    try {
      await orderService.updateOrder(id, { internalNote: note });
      toast.success('NOTE UPDATED');
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder({ ...selectedOrder, internalNote: note });
      }
      fetchOrders();
    } catch (error) {
      toast.error('FAILED TO UPDATE NOTE');
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'shipped': return <CheckCircle size={16} className="text-blue-500" />;
      case 'confirmed': return <Clock size={16} className="text-yellow-500" />;
      case 'pending': return <Clock size={16} className="text-pink-hot" />;
      case 'cancelled': return <XCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} />;
    }
  };

  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const handleDeleteOrder = async (id: string) => {
    if (confirmingDeleteId !== id) {
      setConfirmingDeleteId(id);
      setTimeout(() => setConfirmingDeleteId(null), 3000);
      return;
    }

    try {
      await orderService.deleteOrder(id);
      toast.success('ORDER ERASED FROM RECORDS');
      setSelectedOrder(null);
      fetchOrders();
      setConfirmingDeleteId(null);
    } catch (err) {
      toast.error('FAILED TO SCRUB ORDER');
    }
  };

  const filtered = orders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'new') return matchesSearch && o.status === 'pending';
    if (statusFilter === 'confirmed') return matchesSearch && o.status === 'confirmed';
    if (statusFilter === 'to-deliver') return matchesSearch && o.status === 'shipped';
    if (statusFilter === 'history') return matchesSearch && o.status === 'delivered';
    
    return matchesSearch && o.status !== 'cancelled';
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-12">
        <span className="text-pink-hot font-black uppercase text-xs tracking-[0.4em] block mb-2">Logistics Pipeline</span>
        <h1 className="text-6xl font-display uppercase tracking-tighter">Workflow</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-8 justify-between items-center">
        <div className="relative w-full lg:w-[400px]">
          <input 
            type="text" 
            placeholder="SEARCH PIPELINE..."
            className="w-full bg-white border-2 border-black p-4 font-bold uppercase text-[10px] tracking-widest outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30" size={18} />
        </div>

        <div className="flex gap-1 w-full lg:w-auto bg-black p-1 border-2 border-black">
          {[
            { id: 'new', label: 'New / Inbox' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'to-deliver', label: 'To be Delivered' },
            { id: 'history', label: 'History / Archived' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-6 py-2 text-[9px] font-black uppercase tracking-widest transition-all
                ${statusFilter === tab.id 
                  ? 'bg-pink-hot text-black' 
                  : 'text-white/40 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Order List */}
      <div className="md:hidden space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white border-2 border-black p-8 shadow-hard" />
          ))
        ) : filtered.length > 0 ? (
          filtered.map(order => (
            <div key={order._id} className="bg-white border-2 border-black p-5 shadow-hard space-y-4 uppercase">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-black text-xs text-black">{order.orderNumber}</div>
                  <div className="text-[9px] font-black text-pink-hot mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                </div>
                <select 
                  value={order.status}
                  onChange={(e) => handleUpdateStatus(order._id!, e.target.value as Order['status'])}
                  className={`px-2 py-0.5 border border-black text-[8px] font-black outline-none cursor-pointer appearance-none
                    ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-pink-100 text-pink-700'}`}
                >
                  {[
                    { value: 'pending', label: 'PENDING' },
                    { value: 'confirmed', label: 'CONFIRMED' },
                    { value: 'shipped', label: 'TO BE DELIVERED' },
                    { value: 'delivered', label: 'DELIVERED' }
                  ].map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="font-black text-[10px]">{order.customer.name}</div>
                  <div className="text-[9px] text-pink-hot font-bold">{order.customer.phone}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-black">৳{order.total.toLocaleString()}</div>
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="mt-2 p-1.5 border border-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center border-2 border-dashed border-black opacity-30 text-xs font-black uppercase tracking-widest">
            Clear Skies • No Orders
          </div>
        )}
      </div>

      <div className="hidden md:block bg-white border-2 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
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
                    <div className="text-[9px] font-black text-pink-hot uppercase mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
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
                      <select 
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order._id!, e.target.value as Order['status'])}
                        className={`px-2 py-0.5 border border-black text-[8px] font-black outline-none cursor-pointer
                          ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-pink-100 text-pink-700'}`}
                      >
                        {[
                          { value: 'pending', label: 'PENDING' },
                          { value: 'confirmed', label: 'CONFIRMED' },
                          { value: 'shipped', label: 'TO BE DELIVERED' },
                          { value: 'delivered', label: 'DELIVERED' }
                        ].map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 border-2 border-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                    >
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-4 border-black w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-hard animate-in zoom-in-95 duration-200">
            <div className="bg-black text-white p-6 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="font-display text-2xl uppercase tracking-tight">{selectedOrder.orderNumber}</h3>
                <p className="text-[10px] font-bold text-pink-hot tracking-[0.3em] uppercase">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white hover:text-black transition-colors border border-white/20">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-10">
              {/* Customer Info */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-hot border-b border-pink-100 pb-2">Customer</h4>
                  <div className="font-black space-y-1">
                    <p className="text-xl uppercase">{selectedOrder.customer.name}</p>
                    <p className="text-pink-600">{selectedOrder.customer.phone}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-hot border-b border-pink-100 pb-2">Shipping</h4>
                  <div className="font-bold text-xs leading-relaxed uppercase">
                    <p>{selectedOrder.customer.address}</p>
                    <p className="text-pink-600 mt-1">{selectedOrder.customer.area.replace('-', ' ')}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-hot border-b border-pink-100 pb-2">Cart Contents</h4>
                <div className="border-2 border-black divide-y-2 divide-black">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 items-center">
                      <div className="w-16 h-16 border-2 border-black shrink-0">
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-black uppercase text-[11px] leading-tight mb-1">{item.name}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Qty: {item.qty} × ৳{item.price}</p>
                      </div>
                      <div className="font-black text-xs">৳{item.price * item.qty}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-hot border-b border-pink-100 pb-2">Financials</h4>
                 <div className="bg-pink-50 p-6 border-2 border-black space-y-3 font-black uppercase text-[10px] tracking-widest">
                    <div className="flex justify-between">
                      <span className="text-pink-400">Subtotal</span>
                      <span>৳{selectedOrder.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pink-400">Delivery ({selectedOrder.customer.area})</span>
                      <span>৳{selectedOrder.deliveryCharge}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t-2 border-black text-lg">
                      <span>Total Paid</span>
                      <span className="text-pink-hot font-display text-2xl tracking-tighter">৳{selectedOrder.total}</span>
                    </div>
                 </div>
              </div>

              {selectedOrder.customer.notes && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Customer Notes</h4>
                  <p className="p-4 bg-gray-50 border-2 border-dashed border-black/10 font-bold text-[10px] uppercase italic">
                    "{selectedOrder.customer.notes}"
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-hot">Internal Note</h4>
                <textarea 
                  className="w-full p-4 border-2 border-black font-boxy font-bold text-[11px] uppercase outline-none focus:bg-pink-50 transition-all resize-none"
                  rows={3}
                  defaultValue={selectedOrder.internalNote || ''}
                  placeholder="WRITE A MESSAGE ABOUT THIS ORDER..."
                  onBlur={(e) => handleUpdateNote(selectedOrder._id!, e.target.value)}
                />
              </div>
              
              <div className="pt-6">
                <button 
                   onClick={() => handleDeleteOrder(selectedOrder._id!)}
                   className={`w-full py-4 border-2 transition-all font-black uppercase text-[10px] tracking-[0.3em]
                     ${confirmingDeleteId === selectedOrder._id 
                       ? 'bg-red-500 text-white border-black animate-pulse' 
                       : 'border-red-200 text-red-300 hover:bg-black hover:text-red-500 hover:border-black'}`}
                >
                   {confirmingDeleteId === selectedOrder._id ? 'Confirm scrub?' : 'Terminate Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
