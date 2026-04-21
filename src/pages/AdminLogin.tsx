import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/dataService';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error('PASSWORD REQUIRED');
      return;
    }

    setLoading(true);
    const success = await authService.verifyAdminPassword(password);
    setLoading(false);

    if (success) {
      authService.setAdminSession();
      toast.success('ACCESS GRANTED');
      navigate('/admin');
    } else {
      toast.error('INVALID ACCESS KEY');
    }
  };

  return (
    <div className="min-h-screen bg-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border-4 border-black p-8 md:p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-center mb-10">
            <div className="w-20 h-20 bg-black text-white flex items-center justify-center border-4 border-white shadow-[8px_8px_0px_0px_rgba(244,114,182,1)]">
              <Lock size={40} />
            </div>
          </div>
          
          <h1 className="text-4xl font-display font-black text-center mb-4 uppercase tracking-tighter">System Access</h1>
          <p className="text-[10px] text-center font-boxy font-bold text-gray-400 uppercase tracking-widest mb-12">Authorized Personnel Only</p>
          
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Access Key</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-4 border-black bg-pink-50/50 p-5 font-boxy font-black text-center focus:bg-white transition-all outline-none" 
                  placeholder="••••••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white py-5 font-boxy font-black uppercase tracking-[0.2em] text-sm hover:bg-pink-hot hover:shadow-hard transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Unlock Dashboard'}
            </button>
          </form>
          
          <div className="mt-12 text-center pt-8 border-t-2 border-dashed border-gray-100">
             <button 
               onClick={() => navigate('/')}
               className="text-[10px] font-black text-gray-300 hover:text-pink-400 uppercase tracking-widest transition-colors"
             >
               Exit Verification
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
