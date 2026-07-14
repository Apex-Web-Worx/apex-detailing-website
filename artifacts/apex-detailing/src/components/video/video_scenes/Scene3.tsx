import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1200),
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 overflow-hidden"
      initial={{ opacity: 0, x: "10%" }}
      animate={{ opacity: 1, x: "0%" }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 1 }}
    >
      <motion.div 
        className="absolute inset-0 w-full h-full"
        initial={{ scale: 1.1, x: "-5%" }}
        animate={{ scale: 1, x: "0%" }}
        transition={{ duration: 6, ease: 'easeOut' }}
      >
        <video 
          src={`${import.meta.env.BASE_URL}videos/ceramic-demo.mp4`}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-zinc-950 via-zinc-950/70 to-zinc-950/30" />
      </motion.div>

      <div className="absolute inset-y-0 right-12 md:right-24 flex flex-col justify-center items-end text-right max-w-2xl">
        <motion.div
          className="h-1 w-24 bg-gradient-to-l from-[#A886CD] to-[#3496FF] mb-8"
          initial={{ scaleX: 0, originX: 1 }}
          animate={phase >= 1 ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
        
        <div className="overflow-hidden mb-4">
          <motion.h2 
            className="text-5xl md:text-7xl font-light text-white/80 leading-tight"
            initial={{ y: "100%" }}
            animate={phase >= 1 ? { y: 0 } : { y: "100%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            YEARS OF
          </motion.h2>
        </div>
        
        <div className="overflow-hidden mb-6">
          <motion.h2 
            className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-[#A886CD] to-[#3496FF] leading-tight"
            initial={{ y: "100%" }}
            animate={phase >= 2 ? { y: 0 } : { y: "100%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            PROTECTION
          </motion.h2>
        </div>

        <motion.p
          className="text-xl md:text-2xl text-white/70 font-light max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Professional grade ceramic coating for unmatched gloss and durability.
        </motion.p>
      </div>
    </motion.div>
  );
}
