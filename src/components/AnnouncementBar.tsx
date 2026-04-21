import { motion } from 'motion/react';

export default function AnnouncementBar() {
  return (
    <div className="bg-black border-b border-pink-hot/20 overflow-hidden py-2 h-10 flex items-center">
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
        className="whitespace-nowrap flex"
      >
        {[...Array(10)].map((_, i) => (
          <span key={i} className="text-pink-hot font-bold uppercase text-[11px] tracking-[0.2em] px-10">
            Free delivery above ৳1500 · New arrivals weekly · Shop via WhatsApp for 10% discount · Authentic Editorial Designs
          </span>
        ))}
      </motion.div>
    </div>
  );
}
