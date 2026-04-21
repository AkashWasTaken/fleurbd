import React, { useState, useEffect } from 'react';
import { StoreSettings } from '../types';
import { settingsService } from '../services/dataService';
import { Save, Globe, Phone, CreditCard, Truck, Megaphone, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { doc, updateDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function AdminSettings() {
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'fleur',
    tagline: '',
    whatsapp: '',
    contactNumber: '',
    instagramUrl: '',
    facebookUrl: '',
    bkashNumber: '',
    nagadNumber: '',
    bankName: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankRoutingNumber: '',
    freeDeliveryAbove: 1500,
    flatDeliveryCharge: 70,
    announcementText: '',
    announcementActive: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await settingsService.getSettings();
      if (data) setSettings(data as StoreSettings);
    } catch (err) {
      toast.error('FAILED TO FETCH SETTINGS');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.updateSettings(settings);
      toast.success('SYSTEM PARAMETERS UPDATED');
    } catch (err) {
      toast.error('SYNC FAILED');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-pink-hot font-black uppercase text-center py-20">Optimizing Config...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-12">
        <span className="text-pink-hot font-black uppercase text-xs tracking-[0.4em] block mb-2">Core System</span>
        <h1 className="text-6xl font-display uppercase tracking-tighter">Parameters</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-12">
        {/* Identity Section */}
        <section className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
           <div className="flex items-center gap-3 mb-8 border-b-2 border-black pb-4">
              <Globe size={24} className="text-pink-hot" />
              <h2 className="text-2xl font-display uppercase">Brand Identity</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Store Name</label>
                <input 
                  type="text" 
                  value={settings.storeName}
                  onChange={e => setSettings({...settings, storeName: e.target.value})}
                  className="w-full border-2 border-black p-3 font-bold uppercase text-xs outline-none focus:border-pink-hot"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tagline</label>
                <input 
                  type="text" 
                  value={settings.tagline}
                  onChange={e => setSettings({...settings, tagline: e.target.value})}
                  className="w-full border-2 border-black p-3 font-bold uppercase text-xs outline-none focus:border-pink-hot"
                />
              </div>
           </div>
        </section>

        {/* Social & Support Section */}
        <section className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(244,114,182,1)]">
           <div className="flex items-center gap-3 mb-8 border-b-2 border-black pb-4">
              <Phone size={24} className="text-pink-hot" />
              <h2 className="text-2xl font-display uppercase">Social & Support</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">WhatsApp Number</label>
                <input 
                  type="text" 
                  value={settings.whatsapp}
                  onChange={e => setSettings({...settings, whatsapp: e.target.value})}
                  className="w-full border-2 border-black p-3 font-bold uppercase text-xs outline-none focus:border-pink-hot"
                  placeholder="e.g. 017XXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Display Contact Number</label>
                <input 
                  type="text" 
                  value={settings.contactNumber}
                  onChange={e => setSettings({...settings, contactNumber: e.target.value})}
                  className="w-full border-2 border-black p-3 font-bold uppercase text-xs outline-none focus:border-pink-hot"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Instagram URL</label>
                <input 
                  type="text" 
                  value={settings.instagramUrl}
                  onChange={e => setSettings({...settings, instagramUrl: e.target.value})}
                  className="w-full border-2 border-black p-3 font-bold uppercase text-xs outline-none focus:border-pink-hot"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Facebook URL</label>
                <input 
                  type="text" 
                  value={settings.facebookUrl}
                  onChange={e => setSettings({...settings, facebookUrl: e.target.value})}
                  className="w-full border-2 border-black p-3 font-bold uppercase text-xs outline-none focus:border-pink-hot"
                />
              </div>
           </div>
        </section>

        {/* Finance Section */}
        <section className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(255,0,127,1)]">
           <div className="flex items-center gap-3 mb-8 border-b-2 border-black pb-4">
              <CreditCard size={24} className="text-black" />
              <h2 className="text-2xl font-display uppercase">Financial Gateway</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">bKash Merchant</label>
                <input 
                  type="text" 
                  value={settings.bkashNumber}
                  onChange={e => setSettings({...settings, bkashNumber: e.target.value})}
                  className="w-full border-2 border-black p-3 font-bold uppercase text-xs outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nagad Merchant</label>
                <input 
                  type="text" 
                  value={settings.nagadNumber}
                  onChange={e => setSettings({...settings, nagadNumber: e.target.value})}
                  className="w-full border-2 border-black p-3 font-bold uppercase text-xs outline-none"
                />
              </div>
           </div>
        </section>

        {/* Logistics Section */}
        <section className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
           <div className="flex items-center gap-3 mb-8 border-b-2 border-black pb-4">
              <Truck size={24} className="text-pink-hot" />
              <h2 className="text-2xl font-display uppercase">Logistics & Freight</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Inside Dhaka (৳)</label>
                <input 
                  type="number" 
                  value={settings.flatDeliveryCharge}
                  onChange={e => setSettings({...settings, flatDeliveryCharge: parseInt(e.target.value) || 0})}
                  className="w-full border-2 border-black p-3 font-bold uppercase text-xs outline-none focus:border-pink-hot"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Outside Dhaka (৳)</label>
                <input 
                  type="number" 
                  value={settings.outsideDhakaCharge || 130}
                  onChange={e => setSettings({...settings, outsideDhakaCharge: parseInt(e.target.value) || 0})}
                  className="w-full border-2 border-black p-3 font-bold uppercase text-xs outline-none focus:border-pink-hot"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 opacity-30">Free Threshold (Unused)</label>
                <input 
                  type="number" 
                  value={settings.freeDeliveryAbove}
                  onChange={e => setSettings({...settings, freeDeliveryAbove: parseInt(e.target.value) || 0})}
                  className="w-full border-2 border-black p-3 font-bold uppercase text-xs outline-none opacity-30"
                />
              </div>
           </div>
        </section>

        {/* Marketing Section */}
        <section className="bg-black text-white p-8 border-2 border-black shadow-[12px_12px_0px_0px_rgba(255,0,127,0.3)]">
           <div className="flex items-center gap-3 mb-8 border-b-2 border-pink-hot pb-4">
              <Megaphone size={24} className="text-pink-hot" />
              <h2 className="text-2xl font-display uppercase">Global Announcement</h2>
           </div>
           <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-pink-hot">Ticker Message</label>
                <textarea 
                  value={settings.announcementText}
                  onChange={e => setSettings({...settings, announcementText: e.target.value})}
                  className="w-full bg-white text-black border-2 border-black p-4 font-bold uppercase text-xs outline-none min-h-[80px]"
                />
              </div>
              <button 
                type="button"
                onClick={() => setSettings({...settings, announcementActive: !settings.announcementActive})}
                className={`w-full py-4 border-2 border-pink-hot font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2
                  ${settings.announcementActive ? 'bg-pink-hot text-black' : 'bg-transparent text-pink-hot opacity-40'}`}
              >
                {settings.announcementActive ? <CheckCircle size={20} /> : null}
                {settings.announcementActive ? 'Broadcast Active' : 'Broadcast Halted'}
              </button>
           </div>
        </section>

        <button 
          disabled={saving}
          type="submit"
          className="fixed bottom-10 right-10 flex items-center gap-3 bg-black text-white px-10 py-5 font-black uppercase tracking-[0.4em] shadow-[10px_10px_0px_0px_rgba(255,0,127,1)] hover:bg-pink-hot hover:text-black transition-all active:scale-95 z-50 disabled:opacity-50"
        >
          <Save size={20} /> {saving ? 'Applying...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
}
