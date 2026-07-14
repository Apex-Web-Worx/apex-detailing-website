import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 4000), // Outro
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: "-10%" }}
      transition={{ duration: 1 }}
    >
      <motion.div 
        className="absolute inset-0 w-full h-full"
        initial={{ scale: 1.2, transformOrigin: 'center center' }}
        animate={{ scale: 1 }}
        transition={{ duration: 6, ease: 'easeOut' }}
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/paint-correction-4.jpg`} 
          alt="Paint Correction"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
      </motion.div>

      <div className="absolute inset-y-0 left-12 md:left-24 flex flex-col justify-center max-w-2xl">
        <motion.div
          className="h-1 w-24 bg-gradient-to-r from-[#00E5FF] to-[#FF1AD8] mb-8"
          initial={{ scaleX: 0, originX: 0 }}
          animate={phase >= 1 ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
        
        <div className="overflow-hidden mb-4">
          <motion.h2 
            className="text-5xl md:text-7xl font-bold text-white leading-tight"
            initial={{ y: "100%" }}
            animate={phase >= 1 ? { y: 0 } : { y: "100%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            FLAWLESS
          </motion.h2>
        </div>
        
        <div className="overflow-hidden mb-6">
          <motion.h2 
            className="text-5xl md:text-7xl font-light text-white/80 leading-tight"
            initial={{ y: "100%" }}
            animate={phase >= 2 ? { y: 0 } : { y: "100%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            PAINT CORRECTION
          </motion.h2>
        </div>

        <motion.p
          className="text-xl md:text-2xl text-white/60 font-light max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Remove swirls, scratches, and imperfections. Restore your vehicle's factory gloss.
        </motion.p>
      </div>
    </motion.div>
  );
}
