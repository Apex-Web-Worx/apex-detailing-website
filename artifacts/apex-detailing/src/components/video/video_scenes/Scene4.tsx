import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1600),
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: "-10%" }}
      transition={{ duration: 1 }}
    >
      <div className="absolute inset-0 flex">
        <motion.div 
          className="w-1/2 h-full relative overflow-hidden"
          initial={{ x: "-10%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 6, ease: "easeOut" }}
        >
          <img src={`${import.meta.env.BASE_URL}images/interior-restoration-4.jpg`} alt="Interior Detail" className="w-full h-full object-cover opacity-40 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-zinc-950/60" />
        </motion.div>
        
        <motion.div 
          className="w-1/2 h-full relative overflow-hidden"
          initial={{ x: "10%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 6, ease: "easeOut" }}
        >
          <img src={`${import.meta.env.BASE_URL}images/interior-restoration-1.jpg`} alt="Interior Detail" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-zinc-950/60" />
        </motion.div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950" />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.div
          className="w-[1px] h-24 bg-gradient-to-b from-transparent via-[#5ECFFF] to-transparent mb-8"
          initial={{ scaleY: 0 }}
          animate={phase >= 1 ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />

        <div className="overflow-hidden mb-2">
          <motion.h2 
            className="text-6xl md:text-8xl font-light text-white tracking-wider"
            initial={{ y: "100%" }}
            animate={phase >= 2 ? { y: 0 } : { y: "100%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            LIKE-NEW
          </motion.h2>
        </div>
        
        <div className="overflow-hidden mb-6">
          <motion.h2 
            className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#5ECFFF] to-[#FF1AD8] tracking-widest"
            initial={{ y: "100%" }}
            animate={phase >= 3 ? { y: 0 } : { y: "100%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            INTERIOR
          </motion.h2>
        </div>
      </div>
    </motion.div>
  );
}
