import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Settings, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/dataService';
import { useEffect, useState } from 'react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const authenticated = authService.isAdminAuthenticated();
    setIsAuth(authenticated);
    if (!authenticated) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    toast.success('LOGGED OUT. STAY BOLD.');
    navigate('/');
  };

  if (isAuth === null) return null;
  if (!isAuth) return null;

  return (
    <div className="flex min-h-screen bg-pink-bg overflow-hidden font-body">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white p-6 hidden md:flex flex-col border-r-2 border-black">
        <Link to="/admin" className="text-4xl font-display font-black text-white mb-12 flex flex-col">
          fleur 
          <span className="text-[10px] uppercase font-black tracking-[0.5em] text-pink-hot">Backstage</span>
        </Link>
        <nav className="flex flex-col gap-2">
          {[
            { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/admin/products', icon: Package, label: 'Inventory' },
            { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
            { to: '/admin/settings', icon: Settings, label: 'Settings' },
          ].map((item) => (
            <Link 
              key={item.to}
              to={item.to} 
              className={`flex items-center gap-3 p-3 font-black uppercase text-[10px] tracking-widest transition-all border border-transparent
                ${location.pathname === item.to 
                  ? 'bg-pink-hot text-black border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]' 
                  : 'hover:bg-white/10 hover:border-white/20'}`}
            >
              <item.icon size={16} /> {item.label}
            </Link>
          ))}
        </nav>
        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 p-3 text-gray-500 font-black uppercase text-[10px] tracking-widest hover:text-pink-hot transition-all"
        >
          <LogOut size={16} /> Exit System
        </button>
      </aside>

      {/* Content */}
      <main className="flex-grow p-8">
        <Outlet />
      </main>
    </div>
  );
}
