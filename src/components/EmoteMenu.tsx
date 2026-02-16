import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile } from 'lucide-react';

interface Props {
  onEmoteSelect: (emoteId: string) => void;
  disabled?: boolean;
}

const EMOTES = [
  { id: 'laugh', emoji: '😂', label: 'Laugh' },
  { id: 'plus4', emoji: '➕4️⃣', label: '+4 Attack' },
  { id: 'clown', emoji: '🤡', label: 'Clown' },
  { id: 'cold', emoji: '🥶', label: 'Cold' },
  { id: 'hurry', emoji: '⏳', label: 'Hurry' },
  { id: 'cool', emoji: '😎', label: 'Cool' }
];

export const EmoteMenu: React.FC<Props> = ({ onEmoteSelect, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (emoteId: string) => {
    onEmoteSelect(emoteId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button - Fixed Position */}
      <div className="fixed bottom-4 left-4 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            !disabled && setIsOpen(!isOpen);
          }}
          disabled={disabled}
          className={`
            w-12 h-12 rounded-full bg-slate-800/90 backdrop-blur-md border-2 border-white/10
            flex items-center justify-center shadow-lg transition-all
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700 hover:border-purple-500/50'}
            ${isOpen ? 'bg-purple-600 border-purple-400' : ''}
          `}
        >
          <Smile size={24} className={isOpen ? 'text-white' : 'text-slate-300'} />
        </motion.button>
      </div>

      {/* Grid Popover - Fixed Position with High Z-Index */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/20"
            />

            {/* Popover Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed bottom-20 left-4 z-50 p-3 bg-slate-900/95 backdrop-blur-xl border-2 border-purple-500/30 rounded-xl shadow-2xl"
            >
              {/* Grid: 3 columns x 2 rows */}
              <div className="grid grid-cols-3 gap-2">
                {EMOTES.map((emote) => (
                  <motion.button
                    key={emote.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(emote.id);
                    }}
                    className="w-14 h-14 bg-slate-800/50 hover:bg-slate-700 rounded-lg flex items-center justify-center text-3xl transition-colors border border-white/5 hover:border-purple-500/50"
                    title={emote.label}
                  >
                    {emote.emoji}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
