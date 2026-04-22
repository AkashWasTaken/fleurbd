import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { motion, AnimatePresence } from 'motion/react';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'My Orders', to: '/my-orders' },
];

export default function Header() {
  const cartCount = useCartStore((state) => state.count());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTagline, setShowTagline] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setShowTagline(false);
      } else {
        setShowTagline(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="sticky top-0 z-50">
      <nav className="glass-header h-16 px-4 md:px-10 flex items-center justify-between border-black">
        {/* Logo & Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-display font-black text-black tracking-tighter uppercase">
            fleur
          </Link>
          
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                className={`nav-link text-[9px] px-3 ${location.pathname === link.to ? 'nav-link-active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Link to="/my-orders" className="p-1.5 text-black hover:text-pink-hot transition-all relative hidden sm:block">
              <User size={18} />
            </Link>
            <Link to="/cart" className="p-1.5 text-black hover:text-pink-hot transition-all relative">
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-hot text-white text-[7px] font-black w-4 h-4 flex items-center justify-center border border-black">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
          
          <button 
            className="lg:hidden p-1.5 text-black border border-black"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {showTagline && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-black text-white text-[9px] font-black uppercase tracking-[0.4em] py-2 text-center overflow-hidden border-b border-white/10"
          >
            symphony of a budget friendly elegance
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white border-r-4 border-black-fleur shadow-2xl flex flex-col p-8 animate-in slide-in-from-left duration-300">
            <div className="flex justify-between items-center mb-12">
              <span className="text-3xl font-display font-black text-black-fleur uppercase tracking-tight">fleur</span>
              <button 
                onClick={() => setIsMenuOpen(false)} 
                className="p-2 border-2 border-black-fleur hover:bg-black-fleur hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-grow flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  onClick={() => setIsMenuOpen(false)} 
                  className="p-4 border-2 border-black-fleur text-xl font-boxy font-black uppercase tracking-widest hover:bg-pink-100 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
