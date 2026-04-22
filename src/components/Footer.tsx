import { Link } from 'react-router-dom';
import { Instagram, Facebook, Phone, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { settingsService } from '../services/dataService';
import { StoreSettings } from '../types';

export default function Footer() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    settingsService.getSettings().then(s => {
      if (s) setSettings(s);
    });
  }, []);

  if (!settings) return null;

  return (
    <footer className="bg-pink-100 text-pink-700 py-10 px-4 border-t-8 border-pink-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Brand */}
        <div className="flex flex-col gap-8">
          <Link to="/" className="text-6xl font-display font-black text-pink-500 tracking-tighter uppercase">{settings.storeName}</Link>
          <div className="h-1 w-12 bg-pink-300" />
          <p className="text-pink-600 font-boxy font-bold text-xs uppercase tracking-widest leading-relaxed">
            {settings.tagline}. Based in Dhaka, shipping editorial-grade accessories nationwide.
          </p>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-pink-500">
              <Phone size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">{settings.contactNumber}</span>
            </div>
            <div className="flex gap-4">
              <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="w-12 h-12 border-2 border-pink-300 flex items-center justify-center text-pink-400 hover:bg-pink-300 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(244,114,182,0.1)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
                <Instagram size={20} />
              </a>
              <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="w-12 h-12 border-2 border-pink-300 flex items-center justify-center text-pink-400 hover:bg-pink-300 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(244,114,182,0.1)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
                <Facebook size={20} />
              </a>
              <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="w-12 h-12 border-2 border-pink-300 flex items-center justify-center text-pink-400 hover:bg-pink-300 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(244,114,182,0.1)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-pink-400 font-boxy font-black uppercase tracking-[0.3em] text-[10px] mb-10">Categories</h4>
          <ul className="flex flex-col gap-4">
            {settings.categories.map(link => (
              <li key={link}>
                <Link to={`/?category=${link}`} className="text-xs font-boxy font-bold text-pink-700 hover:text-pink-500 transition-colors uppercase tracking-widest">{link}</Link>
              </li>
            ))}
            <li>
              <Link to="/" className="text-xs font-boxy font-bold text-pink-700 hover:text-pink-500 transition-colors uppercase tracking-widest">All Pieces</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-24 pt-10 border-t-2 border-pink-200 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] uppercase tracking-[0.4em] font-boxy font-black text-pink-300">
        <p className="text-center md:text-left">
          © 2026 {settings.storeName.toUpperCase()} BD. DEFINING ELEGANCE THROUGH PASTEL PRECISION.
        </p>
        <div className="flex gap-4 opacity-50">
           {['COD', 'bKash'].map(p => (
             <span key={p} className="border-2 border-pink-200 text-pink-400 px-3 py-1.5">{p}</span>
           ))}
        </div>
      </div>
    </footer>
  );
}
