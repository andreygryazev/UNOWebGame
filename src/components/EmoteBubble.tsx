import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  emoteId: string;
  timestamp: number; // Unique key for each emote instance
}

const EMOTE_MAP: Record<string, string> = {
  laugh: '😂',
  plus4: '➕4️⃣',
  clown: '🤡',
  cold: '🥶',
  hurry: '⏳',
  cool: '😎'
};

export const EmoteBubble: React.FC<Props> = ({ emoteId, timestamp }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-remove after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [timestamp]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={timestamp}
          initial={{ scale: 0, y: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1.2, 1.0],
            y: [-10, -20, -30],
            opacity: [0, 1, 1, 0]
          }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ 
            duration: 3,
            times: [0, 0.2, 0.3, 1],
            ease: "easeOut"
          }}
          className="absolute -top-16 left-1/2 -translate-x-1/2 pointer-events-none z-50"
        >
          <div className="text-5xl drop-shadow-lg">
            {EMOTE_MAP[emoteId] || '❓'}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
