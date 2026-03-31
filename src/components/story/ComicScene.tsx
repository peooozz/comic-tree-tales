import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStory } from '../../store/StoryContext';
import firTreeImg from '../../assets/fir-tree.png';
import brambleBushImg from '../../assets/bramble-bush.png';
import firTreeSnappedImg from '../../assets/fir-tree-snapped.png';
import mountainBg from '../../assets/mountain-bg.jpg';
import stormBg from '../../assets/storm-bg.jpg';

const RainEffect: React.FC<{ intensity: number }> = ({ intensity }) => {
  const drops = useMemo(() => {
    const count = Math.floor(intensity * 0.8);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 2,
      duration: 0.5 + Math.random() * 0.5,
      opacity: 0.3 + Math.random() * 0.5,
    }));
  }, [intensity]);

  if (intensity < 30) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {drops.map(drop => (
        <div
          key={drop.id}
          className="absolute w-[2px] h-[20px] bg-comic-cyan/60 rain-drop"
          style={{
            left: drop.left,
            top: '-20px',
            animationDelay: `${drop.delay}s`,
            animationDuration: `${drop.duration}s`,
            opacity: drop.opacity,
          }}
        />
      ))}
    </div>
  );
};

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

const WindLines: React.FC<{ power: number }> = ({ power }) => {
  if (power < 20) return null;
  const lineCount = Math.floor(power / 10);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
      {Array.from({ length: lineCount }, (_, i) => (
        <motion.div
          key={i}
          className="absolute h-[2px] bg-foreground/20"
          style={{
            top: `${15 + Math.random() * 70}%`,
            width: `${60 + Math.random() * 120}px`,
          }}
          initial={{ left: '100%', opacity: 0 }}
          animate={{ left: '-200px', opacity: [0, 0.6, 0] }}
          transition={{
            duration: 1 + Math.random(),
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

export const ComicScene: React.FC = () => {
  const { phase, windPower, triggerSnap } = useStory();

  const isStormy = phase === 'STORM_BUILD' || phase === 'PEAK_STORM' || phase === 'SNAP';
  const isAftermath = phase === 'AFTERMATH';

  const treeAnimation = () => {
    if (triggerSnap) return { rotate: 35, x: 40, opacity: 1 };
    if (windPower > 60) return { rotate: [0, 8, -5, 6, -3], x: [0, 5, -3, 4, -2] };
    if (windPower > 20) return { rotate: [0, 3, -2, 2, -1], x: [0, 2, -1, 1, 0] };
    return { rotate: [0, 1, -1, 0], x: 0 };
  };

  const bushAnimation = () => {
    if (windPower > 60) return {
      rotate: [0, 15, -10, 12, -8],
      scaleX: [1, 0.85, 1.1, 0.9, 1],
      x: [0, -8, 5, -6, 3]
    };
    if (windPower > 20) return {
      rotate: [0, 5, -4, 3, -2],
      scaleX: [1, 0.95, 1.05, 0.97, 1],
      x: [0, -3, 2, -2, 1]
    };
    return { rotate: [0, 1, -1, 0], scaleX: 1, x: 0 };
  };

  return (
    <div className="relative w-full h-full overflow-hidden border-[3px] border-foreground" style={{ boxShadow: 'var(--comic-shadow)' }}>
      {/* Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isStormy ? 'storm' : isAftermath ? 'aftermath' : 'calm'}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <img
            src={isStormy ? stormBg : mountainBg}
            alt=""
            className="w-full h-full object-cover"
            style={isAftermath ? { filter: 'sepia(0.3) brightness(0.9)' } : undefined}
          />
          {/* Halftone overlay */}
          <div className="absolute inset-0 comic-halftone" />
        </motion.div>
      </AnimatePresence>

      {/* Storm darkening overlay */}
      <motion.div
        className="absolute inset-0 bg-foreground/0 pointer-events-none z-[1]"
        animate={{ backgroundColor: isStormy ? 'hsla(0,0%,10%,0.3)' : 'hsla(0,0%,10%,0)' }}
        transition={{ duration: 1.5 }}
      />

      {/* Weather effects */}
      <RainEffect intensity={windPower} />
      <WindLines power={windPower} />
      <LightningFlash active={phase === 'PEAK_STORM' || phase === 'SNAP'} />

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-[15%] bg-comic-green/80 border-t-[3px] border-foreground z-[3]">
        <div className="comic-halftone absolute inset-0" />
      </div>

      {/* Fir Tree */}
      <motion.div
        className="absolute z-[4]"
        style={{
          bottom: '10%',
          left: '25%',
          transformOrigin: 'bottom center',
        }}
        animate={treeAnimation()}
        transition={{
          duration: triggerSnap ? 0.3 : windPower > 60 ? 0.8 : 2,
          repeat: triggerSnap ? 0 : Infinity,
          ease: triggerSnap ? 'easeIn' : 'easeInOut',
        }}
      >
        <img
          src={triggerSnap ? firTreeSnappedImg : firTreeImg}
          alt="Fir Tree"
          className="h-[55vh] max-h-[400px] w-auto drop-shadow-[3px_3px_0px_rgba(0,0,0,0.8)]"
          style={{ filter: isStormy ? 'brightness(0.7)' : 'none' }}
        />
      </motion.div>

      {/* Bramble Bush */}
      <motion.div
        className="absolute z-[4]"
        style={{
          bottom: '8%',
          right: '20%',
          transformOrigin: 'bottom center',
        }}
        animate={bushAnimation()}
        transition={{
          duration: windPower > 60 ? 0.6 : 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <img
          src={brambleBushImg}
          alt="Bramble Bush"
          className="h-[25vh] max-h-[200px] w-auto drop-shadow-[3px_3px_0px_rgba(0,0,0,0.8)]"
          style={{ filter: isStormy ? 'brightness(0.7)' : 'none' }}
        />
      </motion.div>

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
    </div>
  );
};
