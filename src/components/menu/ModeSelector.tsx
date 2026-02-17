import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Zap, Skull, Repeat, Users, Layers } from 'lucide-react';
import type { GameMode } from '../../types';

interface ModeSelectorProps {
  onSelect: (mode: GameMode) => void;
  onBack: () => void;
}

interface ModeCardProps {
  id: GameMode;
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  isLocked?: boolean;
  color: string;
  onClick: () => void;
}

const ModeCard: React.FC<ModeCardProps> = ({ id, title, description, icon, isActive, isLocked, color, onClick }) => {
  return (
    <motion.div
      whileHover={!isLocked ? { scale: 1.05, y: -5 } : {}}
      whileTap={!isLocked ? { scale: 0.95 } : {}}
      onClick={!isLocked ? onClick : undefined}
      className={`
        relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300
        ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:shadow-2xl'}
        ${isActive ? 'ring-4 ring-white shadow-[0_0_30px_rgba(255,255,255,0.3)]' : 'border border-white/10'}
      `}
      style={{
        background: `linear-gradient(135deg, ${color}20 0%, ${color}05 100%)`,
        borderColor: isActive ? color : 'rgba(255,255,255,0.1)'
      }}
    >
      {/* Background Glow */}
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[50px] opacity-30" style={{ background: color }} />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl bg-black/30 text-white`}>
            {icon}
          </div>
          {isLocked && (
            <div className="px-3 py-1 rounded-full bg-black/50 text-xs font-bold text-white/50 flex items-center gap-1">
              <Lock size={12} /> COMING SOON
            </div>
          )}
          {isActive && (
            <div className="px-3 py-1 rounded-full bg-white text-black text-xs font-bold flex items-center gap-1">
              SELECTED
            </div>
          )}
        </div>

        <h3 className="text-2xl font-black text-white mb-2 tracking-wide">{title}</h3>
        <p className="text-white/60 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

export const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelect, onBack }) => {
  const [selected, setSelected] = React.useState<GameMode>('standard');

  const handleConfirm = () => {
    onSelect(selected);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl flex flex-col gap-8"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black text-white tracking-tighter">SELECT GAME MODE</h2>
          <p className="text-white/50 text-lg">Choose your rules of engagement</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Standard Mode */}
          <ModeCard
            id="standard"
            title="STANDARD"
            description="The classic UNO experience you know and love. Match colors, numbers, and ruin friendships."
            icon={<Layers size={32} className="text-blue-400" />}
            color="#3B82F6"
            isActive={selected === 'standard'}
            onClick={() => setSelected('standard')}
          />

          {/* Chaos Mode */}
          <ModeCard
            id="chaos"
            title="CHAOS MODE"
            description="Stack +2/+4 cards, Jump-In anytime, and 7-0 rule enabled. Pure absolute mayhem."
            icon={<Zap size={32} className="text-yellow-400" />}
            color="#EAB308"
            isActive={selected === 'chaos'}
            onClick={() => setSelected('chaos')}
          />

          {/* No Mercy (Disabled) */}
          <ModeCard
            id="no-mercy"
            title="NO MERCY"
            description="Elimination at 25 cards. Stack +4s and +10s. For those who want to suffer."
            icon={<Skull size={32} className="text-red-500" />}
            color="#EF4444"
            isActive={selected === 'no-mercy'}
            isLocked
            onClick={() => {}}
          />

          {/* UNO Flip (Disabled) */}
          <ModeCard
            id="uno-flip"
            title="UNO FLIP"
            description="Play with Light and Dark sides. Flip the deck to change the entire game state."
            icon={<Repeat size={32} className="text-purple-500" />}
            color="#A855F7"
            isActive={selected === 'uno-flip'}
            isLocked
            onClick={() => {}}
          />

          {/* All Wild (Disabled) */}
          <ModeCard
            id="all-wild"
            title="ALL WILD"
            description="No colors, just action cards. Every card is a Wild card. Fast-paced chaos."
            icon={<Layers size={32} className="text-pink-500" />}
            color="#EC4899"
            isActive={selected === 'all-wild'}
            isLocked
            onClick={() => {}}
          />

          {/* 2v2 Teams (Disabled) */}
          <ModeCard
            id="2v2"
            title="2v2 TEAMS"
            description="Partner up! Share information and win together against another team."
            icon={<Users size={32} className="text-green-500" />}
            color="#22C55E"
            isActive={selected === '2v2'}
            isLocked
            onClick={() => {}}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex justify-center gap-4 mt-4">
          <button 
            onClick={onBack}
            className="px-8 py-4 rounded-xl font-bold text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            BACK
          </button>
          <button 
            onClick={handleConfirm}
            className="px-12 py-4 rounded-xl font-black text-black bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            CONFIRM MODE
          </button>
        </div>
      </motion.div>
    </div>
  );
};
