import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2500),
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/logo.png`} 
          alt="Apex Detailing" 
          className="h-24 md:h-32 w-auto object-contain brightness-0 invert"
        />
      </motion.div>

      <div className="overflow-hidden">
        <motion.h1 
          className="text-4xl md:text-6xl font-light tracking-[0.2em] text-white/90 uppercase"
          initial={{ y: "100%" }}
          animate={phase >= 2 ? { y: 0 } : { y: "100%" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          Premium Auto Detailing
        </motion.h1>
      </div>
      
      <div className="overflow-hidden mt-6">
        <motion.div
          className="text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF1AD8] tracking-widest font-medium"
          initial={{ y: "100%" }}
          animate={phase >= 3 ? { y: 0 } : { y: "100%" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          NIXA, MISSOURI
        </motion.div>
      </div>
    </motion.div>
  );
}
