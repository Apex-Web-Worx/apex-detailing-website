import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video/hooks';
import BrandLogo from '@/components/BrandLogo';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

const SCENE_DURATIONS = {
  open: 5000,
  paint: 7000,
  ceramic: 7000,
  interior: 7000,
  close: 6000,
};

// Colors: #00E5FF (Blue), #FF1AD8 (Purple)

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-950 font-sans text-white">
      {/* Persistent Background Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Deep background color */}
        <div className="absolute inset-0 bg-zinc-950" />
        
        {/* Animated gradients */}
        <motion.div 
          className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-30 mix-blend-screen"
          style={{ background: 'radial-gradient(circle, #00E5FF, transparent 70%)' }}
          animate={{ 
            x: ['-20%', '30%', '-10%', '-20%'], 
            y: ['-20%', '10%', '40%', '-20%'],
            scale: [1, 1.2, 0.9, 1] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} 
        />
        
        <motion.div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 mix-blend-screen"
          style={{ background: 'radial-gradient(circle, #FF1AD8, transparent 70%)' }}
          animate={{ 
            x: ['40%', '10%', '60%', '40%'], 
            y: ['60%', '20%', '-10%', '60%'],
            scale: [0.8, 1.1, 1, 0.8] 
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} 
        />

        {/* Noise overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </div>

      {/* Persistent UI Elements */}
      <motion.div
        className="absolute top-8 left-12 z-50 flex items-center gap-3"
        animate={{ opacity: currentScene === 0 ? 0 : 1, y: currentScene === 0 ? -20 : 0 }}
        transition={{ duration: 0.8 }}
      >
        <BrandLogo variant="nav" className="h-8 w-auto object-contain brightness-0 invert" />
      </motion.div>

      {/* Scene Render */}
      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="open" />}
        {currentScene === 1 && <Scene2 key="paint" />}
        {currentScene === 2 && <Scene3 key="ceramic" />}
        {currentScene === 3 && <Scene4 key="interior" />}
        {currentScene === 4 && <Scene5 key="close" />}
      </AnimatePresence>
    </div>
  );
}
