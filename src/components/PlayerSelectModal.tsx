import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '../types';

interface Props {
  isOpen: boolean;
  players: Player[];
  myPlayerId: string;
  onSelect: (playerId: string) => void;
  onCancel: () => void;
}

export const PlayerSelectModal: React.FC<Props> = ({ isOpen, players, myPlayerId, onSelect, onCancel }) => {
  if (!isOpen) return null;

  const opponents = players.filter(p => p.id !== myPlayerId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl"
      >
        <h2 className="text-2xl font-black text-white mb-2">SWAP HANDS</h2>
        <p className="text-slate-400 mb-6">Choose a player to swap cards with:</p>

        <div className="grid grid-cols-1 gap-3">
          {opponents.map(p => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="flex items-center gap-4 p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="text-white font-bold">{p.name}</div>
                <div className="text-xs text-slate-500">{p.hand.length} Cards</div>
              </div>
            </button>
          ))}
        </div>

        <button 
          onClick={onCancel}
          className="mt-6 text-slate-500 hover:text-white text-sm font-bold transition-colors"
        >
          CANCEL
        </button>
      </motion.div>
    </div>
  );
};
