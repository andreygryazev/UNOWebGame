import React, { useState, useEffect } from 'react';
import { GameState, CardColor, CardValue } from '../../types.ts';
import { CardComponent } from './CardComponent.tsx';
import { WildColorModal } from './WildColorModal.tsx';
import { PlayerSelectModal } from './PlayerSelectModal.tsx';
import { DirectionIndicator } from './DirectionIndicator.tsx';
import { PlayerAvatar } from './PlayerAvatar.tsx';
import { socket } from '../../services/socket.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';

import { GameOverModal } from './GameOverModal.tsx';
import { UnoButton } from './UnoButton.tsx';
import { EmoteMenu } from './EmoteMenu.tsx';

interface GameTableProps {
  gameState: GameState;
  myPlayerId: string;
  onPlayCard: (cardId: string, chosenColor?: CardColor, targetPlayerId?: string) => void;
  onDrawCard: () => void;
  onPassTurn: () => void;
  onBackToMenu: () => void;
  equippedTable?: string;
  equippedCard?: string;
}

// Sound effects
const emoteSfx = new Howl({
  src: ['/sfx/pop.mp3'],
  volume: 0.5,
  onloaderror: () => console.warn('Emote SFX not found'),
  onplayerror: () => console.warn('Emote SFX play error')
});

export const GameTable: React.FC<GameTableProps> = ({ gameState, myPlayerId, onPlayCard, onDrawCard, onPassTurn, onBackToMenu, equippedTable = 'default', equippedCard = 'classic' }) => {
  // ALL hooks MUST be called before any early returns (React Rules of Hooks)
  const [selectedWildId, setSelectedWildId] = useState<string | null>(null);
  const [showWildModal, setShowWildModal] = useState(false);
  
  // 7-0 Rule State
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);
  const [pendingCardId, setPendingCardId] = useState<string | null>(null);

  const [playerEmotes, setPlayerEmotes] = useState<Record<string, { id: string; timestamp: number } | null>>({});

  // Emote System
  useEffect(() => {
    const handleEmoteReceived = ({ playerId, emoteId }: { playerId: string; emoteId: string }) => {
      // Play sound effect
      emoteSfx.play();

      setPlayerEmotes(prev => ({
        ...prev,
        [playerId]: { id: emoteId, timestamp: Date.now() }
      }));

      // Clear after animation
      setTimeout(() => {
        setPlayerEmotes(prev => {
          const updated = { ...prev };
          if (updated[playerId]?.id === emoteId) {
            updated[playerId] = null;
          }
          return updated;
        });
      }, 3500);
    };

    socket.on('emoteReceived', handleEmoteReceived);
    return () => {
      socket.off('emoteReceived', handleEmoteReceived);
    };
  }, []);

  // Early return AFTER all hooks
  if (!gameState || !gameState.players) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }
  
  const myIndex = gameState.players.findIndex(p => p.id === myPlayerId);
  const totalPlayers = gameState.players.length;

  const handleEmoteSelect = (emoteId: string) => {
    socket.emit('sendEmote', {
      roomId: gameState.roomId,
      playerId: myPlayerId,
      emoteId
    });
  };

  const handleSayUno = () => {
    socket.emit('sayUno', {
      roomId: gameState.roomId,
      playerId: myPlayerId
    });
  };

  // Helper to determine screen position based on relative index
  const getPositionClass = (index: number) => {
    if (index === myIndex) return "bottom-6 left-1/2 -translate-x-1/2"; // Me (Bottom)
    
    const offset = (index - myIndex + totalPlayers) % totalPlayers;
    
    if (totalPlayers === 2) {
        return "top-6 left-1/2 -translate-x-1/2"; // Opposite
    }
    
    if (totalPlayers === 3) {
        if (offset === 1) return "top-1/2 left-6 -translate-y-1/2";
        if (offset === 2) return "top-1/2 right-6 -translate-y-1/2";
    }

    if (totalPlayers >= 4) {
        if (offset === 1) return "top-1/2 left-6 -translate-y-1/2"; // Left
        if (offset === 2) return "top-6 left-1/2 -translate-x-1/2"; // Top
        if (offset === 3) return "top-1/2 right-6 -translate-y-1/2"; // Right
    }
    
    return "hidden"; // Fallback
  };

  const canPlay = (card: any) => {
    // Jump-In Logic: Allow play if it's not my turn BUT it's an exact match and jumpIn is enabled
    if (gameState.turnIndex !== myIndex) {
        if (gameState.rules.jumpIn && gameState.pendingDrawValue === 0) {
            const topCard = gameState.discardPile[gameState.discardPile.length - 1];
            // Exact match check
            if (card.color === topCard.color && card.value === topCard.value) {
                return true;
            }
        }
        return false;
    }

    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    
    // Stacking Logic: If stack is active, can only play matching +2/+4
    if (gameState.pendingDrawValue > 0) {
        const topIsPlusTwo = topCard.value === CardValue.DRAW_TWO;
        const topIsPlusFour = topCard.value === CardValue.WILD_DRAW_FOUR;
        
        if (topIsPlusTwo && card.value === CardValue.DRAW_TWO) return true;
        if (topIsPlusFour && card.value === CardValue.WILD_DRAW_FOUR) return true;
        return false;
    }

    return (
      card.color === CardColor.WILD ||
      card.color === gameState.activeColor ||
      card.value === topCard.value
    );
  };

  const handleCardClick = (card: any) => {
    if (!canPlay(card)) return;
    
    if (card.color === CardColor.WILD) {
      setSelectedWildId(card.id);
      setShowWildModal(true);
    } else if (card.value === CardValue.SEVEN && gameState.rules.sevenZero) {
      // 7-0 Rule: Trigger Player Select
      setPendingCardId(card.id);
      setShowPlayerSelect(true);
    } else {
      onPlayCard(card.id);
    }
  };

  const handleWildColorSelect = (color: CardColor) => {
    if (selectedWildId) {
      onPlayCard(selectedWildId, color);
      setShowWildModal(false);
      setSelectedWildId(null);
    }
  };

  const handlePlayerSelect = (targetPlayerId: string) => {
      if (pendingCardId) {
          onPlayCard(pendingCardId, undefined, targetPlayerId);
          setShowPlayerSelect(false);
          setPendingCardId(null);
      }
  };

  const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];
  const activeColor = gameState.activeColor;

  // Background Gradient based on Active Color
  const getBgGradient = () => {
      switch(activeColor) {
          case 'RED': return 'from-red-900/20 to-slate-950';
          case 'BLUE': return 'from-blue-900/20 to-slate-950';
          case 'GREEN': return 'from-green-900/20 to-slate-950';
          case 'YELLOW': return 'from-yellow-900/20 to-slate-950';
          default: return 'from-slate-900 to-slate-950';
      }
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden bg-theme-${equippedTable} transition-colors duration-1000`}>
         
         {/* --- CENTER AREA --- */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            
            {/* Direction Indicator Ring */}
            <div className="absolute w-[500px] h-[500px] pointer-events-none opacity-50">
                <DirectionIndicator direction={gameState.direction} />
            </div>

            {/* Discard Pile */}
            <div className="relative z-10 mr-8">
                {/* Spotlight Glow */}
                <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 blur-3xl -z-10 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)' }}
                ></div>

                {gameState.discardPile.slice(-5).map((card, i, arr) => (
                    <div key={card.id} className="absolute top-0 left-0" style={{ zIndex: i }}>
                        {/* Pass disabled={false} explicitly or omit it to ensure full brightness */}
                        <CardComponent 
                            card={card} 
                            skin={equippedCard} 
                            activeColorOverride={i === arr.length - 1 ? gameState.activeColor : undefined}
                        /> 
                    </div>
                ))}
                {/* Invisible placeholder to keep spacing */}
                <div className="opacity-0">
                    <CardComponent card={topDiscard} skin={equippedCard} />
                </div>
            </div>

            {/* Draw Deck */}
            <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="relative z-10 cursor-pointer ml-8"
                onClick={() => {
                    if (gameState.turnIndex !== myIndex) return;
                    if (gameState.hasDrawnThisTurn) {
                        onPassTurn();
                    } else {
                        onDrawCard();
                    }
                }}
            >
                <CardComponent card={{id: 'deck', color: CardColor.WILD, value: CardValue.ZERO}} hidden skin={equippedCard} />
                
                {/* Deck Label / Pass Button */}
                {gameState.turnIndex === myIndex && (
                    <div className={`
                        absolute -bottom-10 left-1/2 -translate-x-1/2 
                        px-3 py-1 rounded-full text-xs font-black tracking-wider whitespace-nowrap shadow-lg border
                        animate-bounce
                        ${gameState.hasDrawnThisTurn 
                            ? 'bg-red-500 text-white border-red-400' 
                            : 'bg-white text-black border-white'}
                    `}>
                        {gameState.hasDrawnThisTurn ? "PASS TURN" : "DRAW CARD"}
                    </div>
                )}
            </motion.div>
         </div>

         {/* --- PLAYERS --- */}
         {gameState.players.map((player, index) => (
             <div key={player.id} className={`absolute ${getPositionClass(index)} transition-all duration-500`}>
                 {index === myIndex ? (
                     // MY PLAYER (Bottom) - Show Hand
                     <div className="flex flex-col items-center">
                         {/* My Avatar */}
                         <div className="mb-4">
                            <PlayerAvatar 
                                player={player} 
                                isActive={gameState.turnIndex === index} 
                                isMe={true}
                                turnStartTime={gameState.turnStartTime}
                                emote={playerEmotes[player.id]}
                            />
                         </div>

                         {/* My Hand */}
                         <motion.div 
                            layout 
                            className="flex items-end justify-center -space-x-8 hover:-space-x-4 transition-all duration-300 pb-4"
                         >
                             <AnimatePresence>
                                 {player.hand.map((card) => (
                                     <motion.div
                                         key={card.id}
                                         layout
                                         initial={{ y: 100, opacity: 0 }}
                                         animate={{ y: 0, opacity: 1 }}
                                         exit={{ y: -100, opacity: 0, scale: 0.5 }}
                                         transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                     >
                                         <CardComponent 
                                             card={card} 
                                             onClick={() => handleCardClick(card)}
                                             disabled={!canPlay(card)}
                                             isSmall={false}
                                             skin={equippedCard}
                                         />
                                     </motion.div>
                                 ))}
                             </AnimatePresence>
                         </motion.div>
                     </div>
                 ) : (
                     // OPPONENTS - Show Avatar Only (Cards Hidden/Counted)
                     <div className="flex flex-col items-center">
                         <PlayerAvatar 
                            player={player} 
                            isActive={gameState.turnIndex === index} 
                            isMe={false}
                            turnStartTime={gameState.turnStartTime}
                            emote={playerEmotes[player.id]}
                         />
                         {/* Opponent Hand Visual (Stacked Cards) */}
                         <div className="mt-2 flex -space-x-2">
                             {Array.from({ length: Math.min(player.hand.length, 5) }).map((_, i) => (
                                 <div key={i} className="w-6 h-9 bg-slate-800 border border-slate-600 rounded shadow-sm"></div>
                             ))}
                             {player.hand.length > 5 && (
                                 <div className="w-6 h-9 flex items-center justify-center text-[8px] text-white font-bold bg-slate-800 border border-slate-600 rounded">
                                     +{player.hand.length - 5}
                                 </div>
                             )}
                         </div>
                     </div>
                 )}
             </div>
         ))}

         {/* --- GAME MESSAGE TOAST --- */}
         <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-none text-center z-50">
             <AnimatePresence mode="wait">
                 <motion.div
                    key={gameState.message}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="bg-black/60 backdrop-blur-md text-white px-6 py-2 rounded-full border border-white/10 shadow-2xl font-bold tracking-wide"
                 >
                     {gameState.message}
                 </motion.div>
             </AnimatePresence>
         </div>

         {/* --- MODALS --- */}
         <WildColorModal 
            isOpen={showWildModal} 
            onSelect={handleWildColorSelect} 
            onCancel={() => { setShowWildModal(false); setSelectedWildId(null); }}
         />
         
         <PlayerSelectModal 
            isOpen={showPlayerSelect}
            players={gameState.players}
            myPlayerId={myPlayerId}
            onSelect={handlePlayerSelect}
            onCancel={() => { setShowPlayerSelect(false); setPendingCardId(null); }}
         />

         <GameOverModal 
            gameState={gameState} 
            onBackToMenu={onBackToMenu} 
         />

         {/* --- UNO BUTTON --- */}
         <UnoButton 
            onDeclare={handleSayUno}
            myHandSize={gameState.players[myIndex]?.hand.length || 0}
         />

         {/* --- EMOTE MENU --- */}
         <EmoteMenu 
            onEmoteSelect={handleEmoteSelect}
            disabled={false}
         />
    </div>
  );
};