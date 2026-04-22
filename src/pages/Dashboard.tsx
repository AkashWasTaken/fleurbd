import { useState, useEffect } from 'react';
import { ShoppingBag, DollarSign, Package, TrendingUp, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productService, orderService } from '../services/dataService';
import { Product, Order } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    activeProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [allProducts, allOrders] = await Promise.all([
          productService.getProducts({ showInactive: true }),
          orderService.getOrders()
        ]);

        const prods = allProducts || [];
        const ords = allOrders || [];

        // Exclude cancelled/pending if you want only recognized revenue, but usually excluding cancelled is standard
        const revenue = ords
          .filter(o => o.status !== 'cancelled')
          .reduce((acc, curr) => acc + (curr.total || 0), 0);

        setStats({
          products: prods.length,
          orders: ords.length,
          revenue,
          activeProducts: prods.filter(p => p.active).length
        });

        setRecentOrders(ords.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-1 w-24 bg-black animate-pulse" />
          <div className="text-black font-black uppercase text-[10px] tracking-[0.5em]">Establishing Secure Link...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4 border-black pb-12">
        <div>
          <div className="flex items-center gap-2 text-pink-600 font-black uppercase text-[10px] tracking-[0.4em] mb-4">
            <UserCheck size={14} /> session authorized
          </div>
          <h1 className="text-6xl font-display uppercase tracking-tighter leading-tight">System<br />Overview</h1>
        </div>
        <div className="bg-black text-white p-6 shadow-[8px_8px_0px_0px_rgba(244,114,182,1)]">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50 mb-2">Net Worth</p>
          <p className="text-4xl font-display uppercase tracking-tighter text-pink-hot">৳{stats.revenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Sales', value: stats.orders.toString(), icon: ShoppingBag },
          { label: 'Stock items', value: stats.products.toString(), icon: Package },
          { label: 'Live Store', value: stats.activeProducts.toString(), icon: TrendingUp },
        ].map(stat => (
          <div key={stat.label} className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all">
            <div className="flex items-center justify-between mb-8 opacity-40">
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">{stat.label}</span>
              <stat.icon size={20} />
            </div>
            <p className="text-5xl font-display font-black uppercase tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Simplified Recent Orders */}
        <div className="space-y-8">
          <div className="flex justify-between items-end border-b-2 border-black/10 pb-4">
            <h2 className="text-3xl font-display uppercase tracking-tight">Recent Ledger</h2>
            <Link to="/admin/orders" className="text-[9px] font-black uppercase tracking-widest text-pink-600 hover:underline inline-flex items-center gap-2">
              Management Portal <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders.map(order => (
              <div key={order._id} className="p-5 border-2 border-black/10 hover:border-black transition-all group flex items-center justify-between">
                <div>
                  <p className="font-black text-xs uppercase tracking-tight">{order.customer.name}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-black">৳{order.total}</p>
                  <span className="text-[8px] font-black uppercase text-pink-600">{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Config */}
        <div className="bg-pink-100/50 border-4 border-dashed border-black p-8 flex flex-col justify-center">
          <h3 className="text-2xl font-display uppercase mb-8">Rapid Config</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Edit Items', to: '/admin/products' },
              { label: 'System Setup', to: '/admin/settings' },
              { label: 'Live Site', to: '/' },
              { label: 'Order List', to: '/admin/orders' }
            ].map(link => (
              <Link 
                key={link.to} 
                to={link.to} 
                className="bg-white border-2 border-black p-4 text-[10px] font-black uppercase text-center hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

