import React from 'react';
import { motion } from 'framer-motion';
import { useStory } from '../../store/StoryContext';
import { SpeechBubble } from './SpeechBubble';

export const StoryOverlay: React.FC = () => {
  const { step, activeCharacter, dialogueText, isSpeaking, nextStep, resetStory } = useStory();

  return (
    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-40">
      {/* Title bar */}
      <div className="pointer-events-auto">
        <div className="bg-accent border-b-[3px] border-foreground px-4 py-2 flex items-center justify-between" style={{ boxShadow: 'var(--comic-shadow-sm)' }}>
          <h1 className="font-comic-display text-accent-foreground text-xl md:text-2xl tracking-wider">
            🌲 THE TREE & THE BRAMBLE 🌿
          </h1>
          <div className="flex items-center gap-2">
            <span className="font-comic-body font-bold text-accent-foreground/70 text-sm">
              Panel {step + 1} / 7
            </span>
          </div>
        </div>
      </div>

      {/* Speech bubble area */}
      <div className="flex-1 flex items-start justify-center pt-4 md:pt-8 px-4">
        <SpeechBubble text={dialogueText} character={activeCharacter} isSpeaking={isSpeaking} />
      </div>

      {/* Controls */}
      <div className="pointer-events-auto p-4 flex justify-center">
        {step < 6 ? (
          <motion.button
            className="bg-accent text-accent-foreground border-[3px] border-foreground px-8 py-3 font-comic-display text-xl tracking-wider cursor-pointer"
            style={{ boxShadow: 'var(--comic-shadow)' }}
            whileHover={{ y: -2 }}
            whileTap={{ y: 2, boxShadow: 'var(--comic-shadow-sm)' }}
            onClick={nextStep}
          >
            ▶ NEXT PANEL
          </motion.button>
        ) : (
          <motion.button
            className="bg-secondary text-secondary-foreground border-[3px] border-foreground px-8 py-3 font-comic-display text-xl tracking-wider cursor-pointer"
            style={{ boxShadow: 'var(--comic-shadow)' }}
            whileHover={{ y: -2 }}
            whileTap={{ y: 2, boxShadow: 'var(--comic-shadow-sm)' }}
            onClick={resetStory}
          >
            ↺ READ AGAIN
          </motion.button>
        )}
      </div>
    </div>
  );
};
