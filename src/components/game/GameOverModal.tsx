import React from 'react';
import { GameState } from '../../types.ts';
import { PlayerAvatar } from './PlayerAvatar.tsx';
import { motion } from 'framer-motion';

interface Props {
  gameState: GameState;
  onBackToMenu: () => void;
}

export const GameOverModal: React.FC<Props> = ({ gameState, onBackToMenu }) => {
  if (gameState.status !== 'GAME_OVER') return null;

  const winner = gameState.players.find(p => p.id === gameState.winnerId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900/90 border border-white/20 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center relative overflow-hidden"
      >
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-purple-500/30 blur-3xl -z-10"></div>

        <h1 className="text-4xl font-black text-white mb-2 tracking-widest">GAME OVER</h1>
        <div className="text-slate-400 mb-8 font-mono text-sm">ROOM: {gameState.roomId}</div>

        {winner && (
            <div className="flex flex-col items-center mb-8">
                <div className="relative mb-4">
                    <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur opacity-50 animate-pulse"></div>
                    <PlayerAvatar 
                        player={winner} 
                        isActive={true} 
                        isMe={false} // Doesn't matter for visual
                        turnStartTime={0} // Static
                    />
                </div>
                <div className="text-2xl font-bold text-white">
                    {winner.name} WINS!
                </div>
                <div className="text-yellow-400 font-bold mt-2">+25 MMR</div>
            </div>
        )}

        <div className="space-y-3">
            <button 
                onClick={onBackToMenu}
                className="w-full py-4 bg-white text-black font-black rounded-xl hover:scale-105 transition-transform shadow-lg hover:shadow-white/20"
            >
                BACK TO MAIN MENU
            </button>
        </div>

      </motion.div>
    </div>
  );
};
