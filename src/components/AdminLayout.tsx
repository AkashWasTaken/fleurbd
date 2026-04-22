import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Settings, LogOut, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/dataService';
import { useEffect, useState } from 'react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/products', icon: Package, label: 'Inventory' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  if (isAuth === null) return null;
  if (!isAuth) return null;

  return (
    <div className="flex min-h-screen bg-pink-bg font-body flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-black text-white p-4 flex justify-between items-center sticky top-0 z-[150] border-b-2 border-pink-hot">
        <Link to="/admin" className="text-xl font-display font-black">
          fleur <span className="text-[8px] text-pink-hot uppercase">Backstage</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 border border-white/20">
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] pt-16">
          <div className="absolute inset-0 bg-black/95 flex flex-col p-6 animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col gap-4 mt-8">
              {navItems.map((item) => (
                <Link 
                  key={item.to}
                  to={item.to} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 p-4 font-black uppercase text-xs tracking-widest border-2
                    ${location.pathname === item.to 
                      ? 'bg-pink-hot text-black border-black' 
                      : 'text-white border-white/10'}`}
                >
                  <item.icon size={20} /> {item.label}
                </Link>
              ))}
              <button 
                onClick={handleLogout}
                className="mt-8 flex items-center gap-4 p-4 text-pink-hot font-black uppercase text-xs tracking-widest border-2 border-pink-hot/20"
              >
                <LogOut size={20} /> Exit System
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-black text-white p-6 hidden md:flex flex-col border-r-2 border-black sticky top-0 h-screen">
        <Link to="/admin" className="text-4xl font-display font-black text-white mb-12 flex flex-col">
          fleur 
          <span className="text-[10px] uppercase font-black tracking-[0.5em] text-pink-hot">Backstage</span>
        </Link>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
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
      <main className="flex-grow p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
