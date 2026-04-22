import React, { useState, useEffect, useRef } from 'react';
import { Product, StoreSettings } from '../types';
import { Plus, Edit, Trash2, Search, Database, X, Upload, Tag, RefreshCw, Image as ImageIcon, Check, Loader2, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService, settingsService } from '../services/dataService';

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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    images: [] as { url: string; publicId?: string }[],
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

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        category: product.category,
        stock: product.stock.toString(),
        images: product.images || [],
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
        images: [],
        description: '',
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    const currentCount = formData.images.length;
    const remainingSlots = 5 - currentCount;
    
    if (remainingSlots <= 0) {
      toast.error('MAX 5 IMAGES REACHED');
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      toast.error(`ONLY ${remainingSlots} SLOTS LEFT. OTHERS SKIPPED.`);
    }

    setUploading(true);
    const toastId = toast.loading(`UPLOADING ${filesToUpload.length} PIECES...`);

    try {
      const uploadedImages = [];
      
      for (const file of filesToUpload) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        });

        if (!response.ok) throw new Error('Upload failed');
        
        const data = await response.json();
        uploadedImages.push({ url: data.url, publicId: data.publicId });
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages]
      }));
      toast.success('GALLERY UPDATED', { id: toastId });
    } catch (err) {
      toast.error('ONE OR MORE UPLOADS FAILED', { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      toast.error('ADD AT LEAST ONE IMAGE');
      return;
    }

    const data = {
      ...formData,
      price: parseInt(formData.price),
      stock: parseInt(formData.stock),
      slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      images: formData.images
    };

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct._id!, data);
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
    if (!settings || !confirm(`Remove "${cat}"?`)) return;
    const updatedCategories = settings.categories.filter(c => c !== cat);
    await settingsService.updateSettings({ categories: updatedCategories });
    toast.success('CATEGORY REMOVED');
    fetchData();
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="relative pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <span className="text-pink-600 font-black uppercase text-[10px] tracking-[0.4em] block mb-2">Backstage</span>
          <h1 className="text-4xl md:text-6xl font-display uppercase tracking-tight">Inventory</h1>
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 border-2 border-black bg-white px-4 py-3 font-black uppercase text-[10px] tracking-widest hover:bg-pink-100 transition-all shadow-hard active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <Tag size={16} /> <span className="hidden sm:inline">Categories</span>
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex-1 lg:flex-none bg-black text-white px-6 py-3 border-2 border-black flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-pink-hot transition-all shadow-[4px_4px_0px_0px_rgba(255,114,182,1)]"
          >
            <Plus size={16} /> Add Piece
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-stretch bg-white border-4 border-black p-4 shadow-hard">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH COLLECTION..."
            className="w-full bg-transparent pl-12 pr-4 py-2 font-black uppercase text-[11px] tracking-[0.2em] outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={fetchData} className="flex items-center justify-center gap-2 px-6 py-2 border-2 border-black font-black uppercase text-[10px] tracking-widest hover:bg-pink-50 transition-colors">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          REFRESH
        </button>
      </div>

      {/* Product List - Responsive Cards/Table */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="animate-spin mx-auto text-pink-hot mb-4" size={40} />
          <span className="font-black uppercase text-[10px] tracking-widest">Scanning Vault...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border-4 border-dashed border-black p-20 text-center opacity-40">
          <ImageIcon size={48} className="mx-auto mb-4" />
          <p className="font-black uppercase text-sm tracking-widest italic">Inventory Empty</p>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filtered.map(p => (
              <div key={p._id} className="bg-white border-4 border-black p-4 flex gap-4 shadow-hard">
                <div className="w-20 h-20 border-2 border-black shrink-0 relative">
                  <img src={p.images[0]?.url} alt="" className="w-full h-full object-cover" />
                  {!p.active && <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center text-[8px] font-black uppercase text-gray-500">Hidden</div>}
                </div>
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-black uppercase text-xs truncate max-w-[150px] mb-1">{p.name}</h3>
                    <p className="text-[10px] font-bold text-pink-500">৳{p.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(p)} className="p-2 border-2 border-black hover:bg-black hover:text-white transition-all"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(p._id!)} className="p-2 border-2 border-black hover:bg-pink-hot hover:text-white transition-all"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border-4 border-black shadow-hard overflow-hidden">
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
                      <div className="w-12 h-12 border-2 border-black bg-pink-100 shrink-0 relative">
                        <img src={p.images[0]?.url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute -top-1 -right-1 bg-black text-white text-[7px] w-4 h-4 flex items-center justify-center border border-white">
                          {p.images.length}
                        </div>
                      </div>
                      <span className="uppercase tracking-tight font-black">{p.name}</span>
                    </td>
                    <td className="p-5"><span className="px-3 py-1 bg-pink-100 text-pink-700 border border-pink-200 uppercase text-[9px] font-black">{p.category}</span></td>
                    <td className="p-5 font-black">৳{p.price}</td>
                    <td className="p-5">{p.stock}</td>
                    <td className="p-5">
                      <span className={`px-2 py-1 border-2 border-black uppercase text-[8px] font-black ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {p.active ? 'LIVE' : 'HIDDEN'}
                      </span>
                    </td>
                    <td className="p-5">
                       <div className="flex justify-end gap-3">
                          <button onClick={() => handleOpenModal(p)} className="p-2.5 border-2 border-black hover:bg-black hover:text-white transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none"><Edit size={14} /></button>
                          <button onClick={() => handleDelete(p._id!)} className="p-2.5 border-2 border-black hover:bg-pink-hot hover:text-white transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none"><Trash2 size={14} /></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)} />
          <div className="relative bg-white border-4 border-black w-full max-w-md p-8 shadow-hard animate-in zoom-in duration-300">
            <button onClick={() => setIsCategoryModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-pink-50 transition-all"><X size={20} /></button>
            <h2 className="text-3xl font-display uppercase mb-8 border-b-2 border-black pb-4">Categories</h2>
            
            <div className="grid grid-cols-1 gap-2 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {settings?.categories.map(cat => (
                <div key={cat} className="flex justify-between items-center p-4 border-2 border-black bg-pink-50 font-black uppercase text-[10px] tracking-widest">
                  {cat}
                  <button onClick={() => handleRemoveCategory(cat)} className="text-pink-500 hover:text-pink-700 transition-all hover:scale-110"><Trash2 size={16} /></button>
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
                  className="flex-grow border-2 border-black p-3 font-black uppercase text-[11px] outline-none focus:border-pink-500"
                  placeholder="E.G. BRACELETS"
                />
                <button onClick={handleAddCategory} className="bg-black text-white px-5 border-2 border-black hover:bg-pink-hot transition-colors flex items-center justify-center"><Plus size={20} /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="absolute inset-0 hidden md:block" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white border-4 border-black w-full max-w-3xl min-h-screen md:min-h-0 p-6 md:p-10 shadow-hard md:animate-in md:zoom-in duration-300">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 border-2 border-black hover:bg-black hover:text-white transition-all z-10 bg-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-3xl md:text-5xl font-display uppercase tracking-tight mb-8">
              {editingProduct ? 'Update Piece' : 'New Piece'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Basic Details */}
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Piece Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="border-2 border-black p-4 font-black uppercase text-xs outline-none focus:border-pink-500"
                      placeholder="E.G. VELVET CLOVER RING"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Price (৳)</label>
                      <input 
                        required
                        type="number" 
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="border-2 border-black p-4 font-black text-xs outline-none focus:border-pink-500"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Stock</label>
                      <input 
                        required
                        type="number" 
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                        className="border-2 border-black p-4 font-black text-xs outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category Selection</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="border-2 border-black p-4 font-black uppercase text-xs outline-none bg-white focus:border-pink-hot appearance-none"
                    >
                      {settings?.categories.map(cat => (
                        <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description</label>
                    <textarea 
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="border-2 border-black p-4 font-bold text-xs outline-none focus:border-pink-500 resize-none h-32"
                      placeholder="THE SYMPHONY OF ELEGANCE..."
                    />
                  </div>

                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, active: !formData.active})}
                    className={`w-full py-4 border-2 border-black font-black uppercase text-[10px] tracking-[0.3em] transition-all flex items-center justify-center gap-2 shadow-hard active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                      ${formData.active ? 'bg-pink-hot text-black' : 'bg-gray-100 text-gray-400'}`}
                  >
                    {formData.active ? <Check size={16} /> : null}
                    {formData.active ? 'CURRENTLY LIVE' : 'HIDDEN FROM SHOP'}
                  </button>
                </div>

                {/* Right Column: Images */}
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex justify-between">
                      Visual Assets <span>{formData.images.length}/5</span>
                    </label>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="border-2 border-black bg-pink-50 flex flex-col shadow-tiny">
                          <div className="aspect-square relative border-b-2 border-black overflow-hidden">
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                            {idx === 0 && (
                              <div className="absolute top-0 left-0 bg-black text-white text-[7px] font-black px-2 py-1 uppercase tracking-tighter shadow-hard">
                                Cover
                              </div>
                            )}
                          </div>
                          <div className="flex h-10 divide-x-2 divide-black">
                            <button 
                              type="button"
                              onClick={() => {
                                const newImages = [...formData.images];
                                const [moved] = newImages.splice(idx, 1);
                                newImages.unshift(moved);
                                setFormData({ ...formData, images: newImages });
                                toast.success('COVER UPDATED');
                              }}
                              className={`flex-1 flex items-center justify-center transition-colors ${idx === 0 ? 'bg-pink-100 cursor-default' : 'bg-white hover:bg-pink-50'}`}
                              disabled={idx === 0}
                              title="Set as Cover"
                            >
                              <Star size={14} className={idx === 0 ? 'text-pink-500 fill-pink-500' : 'text-black'} />
                            </button>
                            <button 
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="flex-1 flex items-center justify-center bg-white hover:bg-pink-600 hover:text-white transition-colors"
                              title="Remove Image"
                            >
                              <Trash2 size={14} className="text-pink-600 group-hover:text-white" />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {formData.images.length < 5 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="aspect-square border-2 border-dashed border-black flex flex-col items-center justify-center gap-1 hover:bg-pink-50 transition-colors disabled:opacity-50"
                        >
                          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                          <span className="text-[8px] font-black uppercase">Upload</span>
                        </button>
                      )}
                    </div>
                    <input 
                      type="file" 
                      hidden 
                      ref={fileInputRef} 
                      accept="image/*" 
                      multiple
                      onChange={handleImageUpload} 
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Or External URL</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        id="external-url"
                        placeholder="https://..."
                        className="flex-grow border-2 border-black p-3 font-bold text-[11px] outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('external-url') as HTMLInputElement;
                          if (input.value) {
                            setFormData(prev => ({ ...prev, images: [...prev.images, { url: input.value }] }));
                            input.value = '';
                          }
                        }}
                        className="bg-black text-white px-4 border-2 border-black hover:bg-pink-hot active:scale-95 transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-black text-white py-6 font-black uppercase text-xs tracking-[0.4em] shadow-hard hover:bg-pink-hot hover:text-black transition-all md:text-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
              >
                {editingProduct ? 'Finalize Masterpiece' : 'Commit New Creation'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

