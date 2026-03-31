import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStory } from '../../store/StoryContext';
import { Scene3D } from './Scene3D';

const LightningFlash: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  return (
    <motion.div
      className="absolute inset-0 bg-comic-white/80 pointer-events-none z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.8, 0, 1, 0] }}
      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
    />
  );
};

export const ComicScene: React.FC = () => {
  const { phase, triggerSnap } = useStory();

  return (
    <motion.div 
      className="relative w-full h-full overflow-hidden border-[3px] border-foreground" 
      style={{ boxShadow: 'var(--comic-shadow)' }}
      animate={triggerSnap ? { 
        x: [-20, 20, -15, 15, -10, 10, -5, 5, 0], 
        y: [20, -20, 15, -15, 10, -10, 5, -5, 0] 
      } : {}}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* 3D Scene */}
      <div className="absolute inset-0">
        <Scene3D />
      </div>

      {/* Halftone comic overlay */}
      <div className="absolute inset-0 comic-halftone pointer-events-none z-[5]" />

      {/* Lightning flash */}
      <LightningFlash active={phase === 'PEAK_STORM' || phase === 'SNAP'} />

      {/* CRACK effect */}
      <AnimatePresence>
        {triggerSnap && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span
              className="font-comic-display text-destructive text-7xl md:text-9xl crack-text"
              style={{
                textShadow: '4px 4px 0px hsl(var(--comic-black)), -2px -2px 0px hsl(var(--comic-yellow))',
                WebkitTextStroke: '3px hsl(var(--comic-black))',
              }}
            >
              CRACK!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
