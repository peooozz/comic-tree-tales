import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpeechBubbleProps {
  text: string;
  character: 'TREE' | 'BRAMBLE' | 'NARRATOR' | null;
  isSpeaking: boolean;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text, character, isSpeaking }) => {
  if (!character || !text) return null;

  const isNarrator = character === 'NARRATOR';
  const isTree = character === 'TREE';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={text}
        className={`
          relative z-50 max-w-[90%] md:max-w-md mx-auto
          ${isNarrator
            ? 'bg-secondary border-[3px] border-foreground px-5 py-3'
            : 'bg-comic-white border-[3px] border-foreground px-5 py-4 speech-bubble-tail'
          }
        `}
        style={{ boxShadow: 'var(--comic-shadow)' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Character label */}
        {!isNarrator && (
          <div
            className={`
              absolute -top-4 left-3 px-3 py-0.5 border-[2px] border-foreground font-comic-display text-sm tracking-wider
              ${isTree ? 'bg-comic-green text-comic-white' : 'bg-destructive text-comic-white'}
            `}
          >
            {isTree ? 'FIR TREE' : 'BRAMBLE'}
          </div>
        )}

        {isNarrator && (
          <div className="absolute -top-4 left-3 px-3 py-0.5 border-[2px] border-foreground bg-secondary text-secondary-foreground font-comic-display text-sm tracking-wider">
            NARRATOR
          </div>
        )}

        <p className={`
          font-comic-body font-bold leading-relaxed mt-1
          ${isNarrator ? 'text-secondary-foreground text-base uppercase' : 'text-foreground text-lg'}
        `}>
          {text}
        </p>

        {/* Speaking indicator */}
        {isSpeaking && (
          <motion.div
            className="absolute -right-2 -bottom-2 flex gap-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
            <span className="w-2 h-2 bg-secondary rounded-full" />
            <span className="w-2.5 h-2.5 bg-secondary rounded-full" />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
