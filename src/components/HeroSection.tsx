import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function HeroSection() {
  return (
    <section className="bg-black text-white py-20 px-4 overflow-hidden relative">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Side */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block bg-pink-hot text-black px-4 py-1 font-bold uppercase text-xs mb-6 hard-shadow">
            New Collection 2025
          </span>
          <h1 className="text-6xl md:text-8xl mb-6 leading-[0.9]">
            Wear what <br />
            <span className="italic text-pink-hot">moves you.</span>
          </h1>
          <p className="text-pink-light/60 text-lg mb-10 max-w-md font-medium">
            Explore our curated selection of jewelry and accessories designed for the modern editorial aesthetic. High style, accessible luxury.
          </p>
          <div className="flex flex-wrap gap-5">
            <Link to="/shop" className="btn-primary flex items-center gap-2">
              Shop The Collection <ArrowRight size={20} />
            </Link>
            <Link to="/story" className="btn-black bg-transparent border-pink-hot text-pink-hot hover:bg-pink-hot hover:text-black">
              Our Story
            </Link>
          </div>
          
          <div className="mt-16 grid grid-cols-3 gap-8">
            {[
              { val: '4k+', label: 'Happy Customers' },
              { val: '12+', label: 'Design Awards' },
              { val: '500+', label: 'Unique Styles' }
            ].map(stat => (
              <div key={stat.label} className="border border-pink-hot/30 p-4 relative">
                <span className="block text-2xl font-display text-pink-hot mb-1">{stat.val}</span>
                <span className="block text-[10px] uppercase tracking-widest text-white/50">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Side */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative h-[500px] md:h-[600px]"
        >
          {/* Mosaic of Images */}
          <div className="absolute top-0 right-0 w-3/4 h-3/4 border-2 border-pink-hot shadow-hard z-10 overflow-hidden transform rotate-3">
             <img src="https://picsum.photos/seed/jewelry1/800/800" alt="Jewelry" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="absolute bottom-0 left-0 w-2/3 h-2/3 border-2 border-white shadow-hard overflow-hidden transform -rotate-6">
             <img src="https://picsum.photos/seed/bangles1/800/800" alt="Bangles" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-pink-mid shadow-hard z-20 overflow-hidden">
             <img src="https://picsum.photos/seed/fashion/800/800" alt="Fashion" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </motion.div>
      </div>
      
      {/* Decorative Accents */}
      <div className="absolute top-1/2 -left-12 w-64 h-64 bg-pink-hot/10 blur-[100px]" />
      <div className="absolute bottom-0 -right-12 w-64 h-64 bg-pink-mid/10 blur-[100px]" />
    </section>
  );
}
