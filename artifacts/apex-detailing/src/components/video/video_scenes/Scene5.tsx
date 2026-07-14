import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="absolute inset-0 opacity-20"
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.2 }}
        transition={{ duration: 4, ease: "easeOut" }}
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-1.jpg`} 
          alt="Hero" 
          className="w-full h-full object-cover filter blur-sm"
        />
        <div className="absolute inset-0 bg-zinc-950/80" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={phase >= 1 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center flex flex-col items-center"
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/logo.png`} 
          alt="Apex Detailing" 
          className="h-20 md:h-28 w-auto object-contain brightness-0 invert mb-12"
        />
        
        <h2 className="text-4xl md:text-5xl font-light text-white tracking-widest mb-6 uppercase">
          Book Your Detail
        </h2>
        
        <motion.div 
          className="text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF1AD8] font-medium tracking-[0.2em]"
          initial={{ opacity: 0, y: 10 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.8 }}
        >
          APEXDETAILINGSF.COM
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
