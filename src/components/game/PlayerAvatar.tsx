import React from 'react';
import { Player } from '../../types.ts';
import { TurnTimer } from './TurnTimer.tsx';
import { getAvatarUrl } from '../../utils/avatarHelper.ts';
import { EmoteBubble } from './EmoteBubble.tsx';

interface Props {
  player: Player;
  isActive: boolean;
  isMe: boolean;
  turnStartTime: number;
  emote?: { id: string; timestamp: number } | null;
}

export const PlayerAvatar: React.FC<Props> = ({ player, isActive, isMe, turnStartTime, emote }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100 opacity-80'}`}>
      
      {/* Avatar Circle */}
      <div className="relative w-20 h-20">
        {/* Timer Ring */}
        <TurnTimer startTime={turnStartTime} isActive={isActive} />
        
        {/* Profile Image */}
        <div className={`
            absolute inset-2 rounded-full flex items-center justify-center shadow-lg border-2 overflow-hidden
            ${isActive ? 'border-white shadow-purple-500/50' : 'border-slate-600 bg-slate-800'}
        `}>
          <img 
            src={getAvatarUrl(player.avatarId || 1)}
            alt={player.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Active Indicator */}
        {isActive && (
          <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        )}

        {/* Emote Bubble */}
        {emote && (
          <EmoteBubble emoteId={emote.id} timestamp={emote.timestamp} />
        )}
      </div>
      
      {/* Player Name */}
      <div className="mt-2 px-3 py-1 bg-slate-800/70 backdrop-blur-sm rounded-full">
        <div className="text-white font-bold text-sm">{player.name}</div>
      </div>
      
      {/* Card Count Badge */}
      <div className={`
        mt-1 px-3 py-1 rounded-full text-xs font-black tracking-wider
        ${player.hand.length === 1 ? 'bg-red-500 text-white animate-pulse' : 'bg-purple-600 text-white'}
      `}>
        {player.hand.length} {player.hand.length === 1 ? 'CARD' : 'CARDS'}
      </div>
    </div>
  );
};
