import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onDeclare: () => void;
  myHandSize: number;
}

export const UnoButton: React.FC<Props> = ({ onDeclare, myHandSize }) => {
  const [hasDeclared, setHasDeclared] = useState(false);

  // Reset when hand size changes
  useEffect(() => {
    if (myHandSize !== 1) {
      setHasDeclared(false);
    }
  }, [myHandSize]);

  const handleClick = () => {
    if (myHandSize === 1 && !hasDeclared) {
      onDeclare();
      setHasDeclared(true);
    }
  };

  // Only show when player has 1 card
  if (myHandSize !== 1) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <motion.button
        onClick={handleClick}
        disabled={hasDeclared}
        animate={
          hasDeclared
            ? { scale: 1 }
            : {
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 0 0px rgba(239, 68, 68, 0.7)',
                  '0 0 0 20px rgba(239, 68, 68, 0)',
                  '0 0 0 0px rgba(239, 68, 68, 0)'
                ]
              }
        }
        transition={{ duration: 1.5, repeat: hasDeclared ? 0 : Infinity }}
        className={`
          w-32 h-32 rounded-full font-black text-3xl tracking-wider shadow-2xl
          transform transition-all duration-300
          ${
            hasDeclared
              ? 'bg-green-500 text-white cursor-default'
              : 'bg-gradient-to-br from-red-500 to-orange-500 text-white hover:scale-110 cursor-pointer'
          }
          border-4 ${hasDeclared ? 'border-green-400' : 'border-red-400'}
        `}
      >
        {hasDeclared ? '✓ UNO!' : 'UNO!'}
      </motion.button>

      {!hasDeclared && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full whitespace-nowrap animate-bounce">
          Click before time runs out!
        </div>
      )}
    </motion.div>
  );
};
