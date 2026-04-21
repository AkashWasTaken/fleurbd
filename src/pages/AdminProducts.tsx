import React, { useState, useEffect } from 'react';
import { Product, StoreSettings } from '../types';
import { Plus, Edit, Trash2, Search, Database, X, Upload, Tag, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService, settingsService } from '../services/dataService';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    image: '',
    description: '',
    active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [pData, sData] = await Promise.all([
      productService.getProducts({ showInactive: true }),
      settingsService.getSettings()
    ]);
    setProducts(pData || []);
    setSettings(sData || null);
    if (sData?.categories?.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: sData.categories[0] }));
    }
    setLoading(false);
  };

  const seedData = async () => {
    if (!confirm('This will add sample products to your store. Continue?')) return;
    setSeeding(true);
    try {
      const sample = [
        {
          name: "Clover Gold Bangles",
          slug: "clover-gold-bangles",
          description: "Premium 22K gold plated bangles with delicate clover motifs.",
          price: 3500,
          category: "jewelry",
          images: [{ url: "https://picsum.photos/seed/gold/800/800" }],
          stock: 12,
          active: true,
          featured: true
        },
        {
          name: "Rose Quartz Pendant",
          slug: "rose-quartz-pendant",
          description: "Elegant rose quartz necklace for a symphony of elegance.",
          price: 1850,
          category: "jewelry",
          images: [{ url: "https://picsum.photos/seed/quartz/800/800" }],
          stock: 8,
          active: true,
          featured: true
        }
      ];

      for (const p of sample) {
        await productService.addProduct(p);
      }
      toast.success('DATABASE SEEDED!');
      fetchData();
    } catch (err) {
      toast.error('SEEDING FAILED.');
    } finally {
      setSeeding(false);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        category: product.category,
        stock: product.stock.toString(),
        image: product.images[0]?.url || '',
        description: product.description || '',
        active: product.active ?? true
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        category: settings?.categories[0] || '',
        stock: '',
        image: '',
        description: '',
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: parseInt(formData.price),
      stock: parseInt(formData.stock),
      slug: formData.name.toLowerCase().replace(/ /g, '-'),
      images: [{ url: formData.image || `https://picsum.photos/seed/${formData.name}/800/800` }]
    };

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, data);
        toast.success('PRODUCT UPDATED');
      } else {
        await productService.addProduct(data);
        toast.success('PRODUCT ADDED');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('SAVE FAILED');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('U sure?')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('DELETED');
      fetchData();
    } catch (error) {
      toast.error('DELETE FAILED');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName || !settings) return;
    const cleanName = newCategoryName.toLowerCase().trim();
    if (settings.categories.includes(cleanName)) {
      toast.error('ALREADY EXISTS');
      return;
    }
    const updatedCategories = [...settings.categories, cleanName];
    await settingsService.updateSettings({ categories: updatedCategories });
    setNewCategoryName('');
    toast.success('CATEGORY ADDED');
    fetchData();
  };

  const handleRemoveCategory = async (cat: string) => {
    if (!settings || !confirm(`Remove "${cat}"? Products in this category won't be deleted but will lose their filter link.`)) return;
    const updatedCategories = settings.categories.filter(c => c !== cat);
    await settingsService.updateSettings({ categories: updatedCategories });
    toast.success('CATEGORY REMOVED');
    fetchData();
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <span className="text-pink-600 font-black uppercase text-xs tracking-[0.3em] block mb-2">Inventory</span>
          <h1 className="text-5xl font-display uppercase tracking-tight">Manager</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 border-2 border-black bg-white px-4 py-2 font-black uppercase text-[10px] tracking-widest hover:bg-pink-100 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
          >
            <Tag size={16} /> Categories
          </button>
          <button 
            onClick={seedData} 
            disabled={seeding}
            className="hidden lg:flex items-center gap-2 border-2 border-black bg-white px-4 py-2 font-black uppercase text-[10px] tracking-widest hover:bg-pink-100 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
          >
            <Database size={16} /> {seeding ? 'Seeding...' : 'Seed Sample'}
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-black text-white px-6 py-2 border-2 border-black flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-pink-hot transition-all shadow-[4px_4px_0px_0px_rgba(255,0,127,1)]"
          >
            <Plus size={16} /> Add Piece
          </button>
        </div>
      </div>

      <div className="mb-8 flex justify-between items-center bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="relative flex-grow max-w-md">
          <input 
            type="text" 
            placeholder="SEARCH PRODUCTS..."
            className="w-full bg-transparent p-2 font-bold uppercase text-[12px] tracking-widest outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30" size={18} />
        </div>
        <button onClick={fetchData} className="p-2 hover:bg-pink-50 rounded-none transition-colors"><RefreshCw size={18} className={loading ? 'animate-spin' : ''} /></button>
      </div>

      <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-white uppercase text-[10px] tracking-widest">
              <th className="p-5">Piece</th>
              <th className="p-5">Category</th>
              <th className="p-5">Price</th>
              <th className="p-5">Stock</th>
              <th className="p-5">Status</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="font-boxy font-bold text-[11px]">
            {filtered.map(p => (
              <tr key={p._id} className="border-b-2 border-black/10 hover:bg-pink-50/50 transition-colors">
                <td className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 border-2 border-black bg-pink-100 shrink-0">
                    <img src={p.images[0]?.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="uppercase tracking-tight">{p.name}</span>
                </td>
                <td className="p-5"><span className="px-3 py-1 bg-pink-100 text-pink-700 border border-pink-200 uppercase text-[9px] font-black">{p.category}</span></td>
                <td className="p-5">৳{p.price}</td>
                <td className="p-5">{p.stock}</td>
                <td className="p-5">
                  <span className={`px-2 py-0.5 border-2 border-black uppercase text-[8px] font-black ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {p.active ? 'LIVE' : 'HIDDEN'}
                  </span>
                </td>
                <td className="p-5">
                   <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => handleOpenModal(p)}
                        className="p-2.5 border-2 border-black hover:bg-black hover:text-white transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p._id)}
                        className="p-2.5 border-2 border-black hover:bg-pink-hot hover:text-white transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                      >
                        <Trash2 size={14} />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)} />
          <div className="relative bg-white border-4 border-black w-full max-w-md p-8 shadow-[16px_16px_0px_0px_rgba(244,114,182,1)] animate-in zoom-in duration-300">
            <button onClick={() => setIsCategoryModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-pink-50 transition-all"><X size={20} /></button>
            <h2 className="text-3xl font-display uppercase mb-8">Categories</h2>
            
            <div className="space-y-4 mb-8">
              {settings?.categories.map(cat => (
                <div key={cat} className="flex justify-between items-center p-3 border-2 border-black bg-pink-50 font-black uppercase text-[10px] tracking-widest">
                  {cat}
                  <button onClick={() => handleRemoveCategory(cat)} className="text-pink-500 hover:text-pink-700"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">New Category</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-grow border-2 border-black p-3 font-bold uppercase text-[11px] outline-none"
                  placeholder="e.g. accessories"
                />
                <button onClick={handleAddCategory} className="bg-black text-white px-4 border-2 border-black hover:bg-pink-500 transition-colors"><Plus size={18} /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white border-4 border-black w-full max-w-xl p-8 md:p-12 shadow-[20px_20px_0px_0px_rgba(255,114,182,1)] animate-in zoom-in duration-300">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 border-2 border-black hover:bg-black hover:text-white transition-all"
            >
              <X size={20} />
            </button>

            <h2 className="text-4xl font-display uppercase tracking-tighter mb-8">
              {editingProduct ? 'Edit Piece' : 'New Creation'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Piece Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="border-2 border-black p-3 font-bold uppercase text-[12px] outline-none focus:border-pink-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Price (BDT)</label>
                  <input 
                    required
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="border-2 border-black p-3 font-bold uppercase text-[12px] outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Stock Count</label>
                  <input 
                    required
                    type="number" 
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="border-2 border-black p-3 font-bold uppercase text-[12px] outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="border-2 border-black p-3 font-bold uppercase text-[12px] outline-none bg-white"
                  >
                    {settings?.categories.map(cat => (
                      <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 mt-4">
                   <button 
                    type="button"
                    onClick={() => setFormData({...formData, active: !formData.active})}
                    className={`h-10 px-6 border-2 border-black font-black uppercase text-[9px] tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none
                      ${formData.active ? 'bg-pink-hot text-white' : 'bg-gray-100 text-gray-400'}`}
                   >
                     {formData.active ? 'LIVE' : 'HIDDEN'}
                   </button>
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Image URL (Optional)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="https://..."
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="flex-grow border-2 border-black p-3 font-bold text-[12px] outline-none"
                    />
                  </div>
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full bg-black text-white py-4 font-black uppercase tracking-[0.2em] shadow-[6px_6px_0px_0px_rgba(244,114,182,1)] hover:shadow-none hover:bg-pink-hot transition-all text-sm"
              >
                {editingProduct ? 'Update Piece' : 'Add to Collection'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

