import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';
import { Check, ArrowRight, Smartphone, Building, CreditCard, Truck } from 'lucide-react';
import { StoreSettings } from '../types';
import { orderService, settingsService } from '../services/dataService';

type Step = 'details' | 'payment' | 'done';

export default function Checkout() {
  const { items, total, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>('details');
  const [paymentMethod, setPaymentMethod] = useState<string>('COD');
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    area: 'inside-dhaka' as 'inside-dhaka' | 'outside-dhaka',
    notes: '',
    txnId: ''
  });

  useEffect(() => {
    // Load existing customer data
    const savedInfo = localStorage.getItem('fleur_customer_data');
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to load saved info");
      }
    }

    settingsService.getSettings().then(s => setSettings(s || null));
  }, []);

  if (items.length === 0 && step !== 'done') {
    navigate('/shop');
    return null;
  }

  const deliveryCharge = settings 
    ? (formData.area === 'inside-dhaka' ? settings.flatDeliveryCharge : settings.outsideDhakaCharge)
    : (formData.area === 'inside-dhaka' ? 70 : 130);

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();

    const phoneRegex = /^01\d{9}$/;
    
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error('GIRL, WE NEED YOUR DETAILS!');
      return;
    }

    if (!phoneRegex.test(formData.phone)) {
      toast.error('NUMBER MUST BE 11 DIGITS (e.g. 018XXXXXXXX)');
      return;
    }
    
    // Save to localstorage for next time
    localStorage.setItem('fleur_customer_data', JSON.stringify({
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      area: formData.area
    }));

    setStep('payment');
  };

  const [submitting, setSubmitting] = useState(false);

  const handlePlaceOrder = async () => {
    if (submitting) return;
    setSubmitting(true);
    
    const orderData = {
      customer: {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        area: formData.area,
        notes: formData.notes
      },
      items: items.map(i => ({
        productId: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
        image: i.image
      })),
      subtotal: total(),
      deliveryCharge,
      total: total() + deliveryCharge,
      paymentMethod,
      transactionId: formData.txnId
    };

    try {
      const result = await orderService.createOrder(orderData);
      if (result?.orderNumber) {
        const myOrders = JSON.parse(localStorage.getItem('fleur_my_orders') || '[]');
        myOrders.push(result.orderNumber);
        localStorage.setItem('fleur_my_orders', JSON.stringify(myOrders.slice(-10))); // keep last 10
      }
      toast.success(`ORDER PLACED! WE'LL CALL YOU SOON.`);
      clearCart();
      setStep('done');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast.error('SOMETHING WENT WRONG. TRY AGAIN.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-pink-50 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <div className="flex items-center justify-center mb-20 gap-8">
           {[
             { id: 'details', label: 'Details' },
             { id: 'payment', label: 'Payment' },
             { id: 'done', label: 'Success' }
           ].map((s, idx) => (
             <div key={s.id} className="flex items-center gap-6">
                <div className={`w-12 h-12 border-2 flex items-center justify-center font-black transition-all ${step === s.id ? 'bg-pink-500 text-white border-pink-600 scale-110 shadow-hard' : 'bg-white text-pink-200 border-pink-100'}`}>
                   {idx + 1}
                </div>
                <span className={`uppercase text-[10px] tracking-[0.3em] font-black ${step === s.id ? 'text-pink-700' : 'text-pink-200'}`}>{s.label}</span>
                {idx < 2 && <div className="w-12 h-0.5 bg-pink-100" />}
             </div>
           ))}
        </div>

        {step === 'details' && (
          <div className="bg-white border-2 border-pink-200 p-8 md:p-16 shadow-[16px_16px_0px_0px_rgba(244,114,182,0.1)]">
            <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter mb-12 text-pink-600 border-b-2 border-pink-100 pb-6">Your Info</h2>
            <form onSubmit={handleSubmitDetails} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-400">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="border-2 border-pink-100 bg-pink-50/10 p-5 font-boxy font-bold focus:border-pink-400 transition-all outline-none" 
                    placeholder="JAMILA RAHMAN"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-400">Contact Number</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 11)})}
                    maxLength={11}
                    className="border-2 border-pink-100 bg-pink-50/10 p-5 font-boxy font-bold focus:border-pink-400 transition-all outline-none" 
                    placeholder="018XXXXXXXX"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-400">Delivery Region</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'inside-dhaka', label: 'Inside Dhaka' },
                    { id: 'outside-dhaka', label: 'Outside Dhaka' }
                  ].map(region => (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => setFormData({...formData, area: region.id as 'inside-dhaka' | 'outside-dhaka'})}
                      className={`p-4 border-2 font-black uppercase tracking-widest text-[9px] transition-all
                        ${formData.area === region.id ? 'bg-pink-500 text-white border-pink-600' : 'bg-white text-pink-300 border-pink-100'}`}
                    >
                      {region.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-400">Full Address</label>
                <textarea 
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="border-2 border-pink-100 bg-pink-50/10 p-5 font-boxy font-bold focus:border-pink-400 transition-all outline-none resize-none" 
                  placeholder="HOUSE, ROAD, AREA..."
                />
              </div>
              <button type="submit" className="btn-fleur w-full py-5 text-xl">Confirm Details</button>
            </form>
          </div>
        )}

        {step === 'payment' && (
          <div className="bg-white border-2 border-pink-200 p-8 md:p-16 shadow-[16px_16px_0px_0px_rgba(244,114,182,0.1)]">
            <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter mb-12 text-pink-600 border-b-2 border-pink-100 pb-6">Payment Method</h2>
            
            <div className="bg-pink-100/50 border-2 border-pink-200 p-6 mb-12 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-600">
                You will receive a call from us soon to confirm your order and finalizing the payment.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-12">
              {[
                { id: 'COD', label: 'Cash on Delivery', Icon: Truck },
                { id: 'bKash', label: 'bKash', Icon: Smartphone }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`border-2 p-8 flex flex-col items-center gap-4 transition-all
                    ${paymentMethod === m.id ? 'bg-pink-100 border-pink-500 text-pink-700 shadow-[6px_6px_0px_0px_rgba(244,114,182,0.3)]' : 'bg-white border-pink-100 text-pink-300 hover:border-pink-200 hover:bg-pink-50'}`}
                >
                  <m.Icon size={32} />
                  <span className="font-black uppercase text-[10px] tracking-widest">{m.label}</span>
                </button>
              ))}
            </div>

            <div className="border-t-2 border-pink-100 pt-10 flex flex-col gap-4 mb-10">
               <div className="flex justify-between items-center text-pink-400 font-black uppercase text-[10px] tracking-widest">
                  <span>Subtotal:</span>
                  <span>৳{total()}</span>
               </div>
               <div className="flex justify-between items-center text-pink-400 font-black uppercase text-[10px] tracking-widest">
                  <span>Delivery ({formData.area === 'inside-dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}):</span>
                  <span>৳{deliveryCharge}</span>
               </div>
               <div className="flex justify-between items-center pt-4 border-t border-pink-100">
                 <span className="text-2xl font-display font-black uppercase text-pink-400">Grand Total:</span>
                 <span className="text-5xl font-display font-black text-pink-600 tracking-tighter">৳{total() + deliveryCharge}</span>
               </div>
            </div>

            <button 
              onClick={handlePlaceOrder} 
              disabled={submitting}
              className="btn-fleur w-full py-5 text-xl disabled:opacity-50"
            >
              {submitting ? 'PROCESSING...' : 'Place Order Now'}
            </button>
            <button onClick={() => setStep('details')} className="w-full text-center mt-8 text-[10px] font-black uppercase tracking-widest text-pink-300 hover:text-pink-600 transition-all underline">Modify Details</button>
          </div>
        )}

        {step === 'done' && (
          <div className="bg-white border-2 border-pink-200 p-16 text-center shadow-[16px_16px_0px_0px_rgba(244,114,182,0.1)]">
            <div className="w-24 h-24 bg-pink-500 text-white border-4 border-white flex items-center justify-center mx-auto mb-10 shadow-[8px_8px_0px_0px_rgba(244,114,182,0.2)]">
               <Check size={48} />
            </div>
            <h2 className="text-5xl md:text-8xl font-display font-black uppercase mb-6 tracking-tighter text-pink-600">Order Placed</h2>
            <p className="text-pink-400 font-boxy font-bold uppercase text-xs tracking-widest mb-12">Wait for our call to confirm your editorial pieces.</p>
            <Link to="/" className="btn-fleur inline-flex px-16 h-16">Return Home</Link>
          </div>
        )}
      </div>
    </div>
  );
}
