import React from 'react';
import { Card, CardColor, CardValue } from '../../types.ts';

interface CardProps {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
  isSmall?: boolean;
  hidden?: boolean;
  skin?: string; // NEW: 'classic', 'gold', 'neon', 'luxury', 'crystal'
}

const GRADIENTS: Record<CardColor, string> = {
  [CardColor.RED]: 'bg-gradient-to-br from-red-500 to-red-600',
  [CardColor.BLUE]: 'bg-gradient-to-br from-blue-500 to-blue-600',
  [CardColor.GREEN]: 'bg-gradient-to-br from-green-500 to-green-600',
  [CardColor.YELLOW]: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
  [CardColor.WILD]: 'bg-gradient-to-br from-slate-800 to-black'
};

export const CardComponent: React.FC<CardProps & { activeColorOverride?: CardColor }> = ({ card, onClick, disabled, isSmall, hidden, skin = 'classic', activeColorOverride }) => {
  const rotation = card.rotation || 0;

  // --- CARD BACK (Hidden / Deck) ---
  if (hidden) {
    const renderBackContent = () => {
      switch (skin) {
        case 'neon':
          return (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center overflow-hidden">
              {/* Neon Grid Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15),transparent_70%)]"></div>
              
              {/* Center Logo */}
              <div className="relative z-10 w-16 h-16 rounded-full border-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                 <span className="text-cyan-400 font-black italic text-lg tracking-tighter drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">UNO</span>
              </div>
              
              {/* Corner Accents */}
              <div className="absolute top-2 left-2 w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
            </div>
          );
        
        case 'crystal':
          return (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-purple-900/80 backdrop-blur-md flex items-center justify-center overflow-hidden border border-white/20">
              {/* Crystal Facets Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-shimmer"></div>
              
              {/* Geometric Center */}
              <div className="relative z-10 w-16 h-16 rotate-45 border-2 border-white/30 bg-white/5 backdrop-blur-sm flex items-center justify-center shadow-lg">
                 <div className="w-12 h-12 border border-white/20 flex items-center justify-center">
                    <span className="-rotate-45 text-white font-black italic text-sm tracking-widest drop-shadow-md">UNO</span>
                 </div>
              </div>
              
              {/* Shards */}
              <div className="absolute -top-4 -left-4 w-12 h-24 bg-blue-400/20 rotate-45 blur-md"></div>
              <div className="absolute -bottom-4 -right-4 w-12 h-24 bg-purple-400/20 rotate-45 blur-md"></div>
            </div>
          );

        case 'gold':
        case 'luxury':
           return (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black flex items-center justify-center overflow-hidden border-2 border-yellow-600/50">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.1),transparent_70%)]"></div>
               <div className="w-20 h-20 rounded-full border-4 border-yellow-600/80 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                  <span className="text-yellow-500 font-serif font-bold text-xl tracking-widest">UNO</span>
               </div>
            </div>
           );

        default: // Classic & others
          return (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-900/50 via-slate-900 to-black"></div>
               <div className="absolute w-16 h-16 rounded-full border-2 border-violet-500/30 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border border-violet-400/50 flex items-center justify-center">
                      <span className="text-violet-200 font-black italic text-xs tracking-tighter">UNO</span>
                  </div>
               </div>
            </div>
          );
      }
    };

    return (
      <div 
        className={`
          relative rounded-xl shadow-lg border-b-4 border-black/40 
          flex items-center justify-center select-none overflow-hidden
          ${isSmall ? 'w-10 h-14' : 'w-24 h-36'}
          card-skin-${skin}
        `}
      >
        {renderBackContent()}
      </div>
    );
  }

  // --- CARD FRONT ---
  const isWild = card.color === CardColor.WILD || card.value === CardValue.WILD || card.value === CardValue.WILD_DRAW_FOUR;
  
  // Determine Effective Color (for Wilds that have been played)
  let effectiveColor = card.color;
  if (isWild) {
      if (card.chosenColor) {
          effectiveColor = card.chosenColor;
      } else if (activeColorOverride && activeColorOverride !== CardColor.WILD) {
          effectiveColor = activeColorOverride;
      }
  }

  // Helper to get color values
  const getColorHex = (c: CardColor) => {
      switch(c) {
          case CardColor.RED: return '#ef4444';
          case CardColor.BLUE: return '#3b82f6';
          case CardColor.GREEN: return '#22c55e';
          case CardColor.YELLOW: return '#eab308';
          default: return '#ffffff';
      }
  };

  const getColorClass = (c: CardColor) => {
      switch(c) {
          case CardColor.RED: return 'red-500';
          case CardColor.BLUE: return 'blue-500';
          case CardColor.GREEN: return 'green-500';
          case CardColor.YELLOW: return 'yellow-500';
          default: return 'white';
      }
  };

  // --- WILD CARD BACKGROUND LOGIC ---
  let backgroundClass = GRADIENTS[card.color]; // Default
  let borderClass = '';
  let shadowClass = '';
  let contentColor = 'text-white';

  // Dynamic styles for colors that Tailwind might purge
  let dynamicStyle: React.CSSProperties = {};

  if (isWild) {
      const isColored = effectiveColor !== CardColor.WILD;
      const colorHex = getColorHex(effectiveColor);
      const colorName = getColorClass(effectiveColor);

      switch (skin) {
          case 'neon':
              backgroundClass = 'bg-slate-900'; // Dark Slate
              if (isColored) {
                  backgroundClass = 'bg-black';
                  borderClass = 'border-2';
                  // Use inline style for dynamic colors to avoid purging
                  dynamicStyle = {
                      borderColor: colorHex,
                      boxShadow: `0 0 15px ${colorHex}`
                  };
              }
              break;
          
          case 'crystal':
              backgroundClass = 'bg-blue-900/50 backdrop-blur-md'; // Dark Blue Glass
              if (isColored) {
                  // Translucent tint - we can't easily do bg-color/30 with hex in inline style for tailwind classes
                  // So we'll use style for background too if needed, or rely on safelisted classes if we had them.
                  // But for now, let's try to use style for border.
                  // For background, we can use a semi-transparent hex or rgba.
                  
                  // Convert hex to rgba for background? Or just use style.
                  backgroundClass = 'backdrop-blur-md';
                  borderClass = 'border';
                  dynamicStyle = {
                      backgroundColor: `${colorHex}4D`, // ~30% opacity
                      borderColor: `${colorHex}80` // ~50% opacity
                  };
              }
              break;

          default: // Classic
              if (isColored) {
                  backgroundClass = GRADIENTS[effectiveColor];
              } else {
                  backgroundClass = 'bg-black';
              }
              break;
      }
  }

  // --- RENDER CONTENT (SYMBOLS) ---
  const renderContent = () => {
     if (card.value === CardValue.WILD) {
         return (
             <div className={`w-full h-full flex items-center justify-center ${skin === 'neon' ? 'drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]' : ''}`}>
                 {/* Conic Gradient Oval */}
                 <div className="w-[80%] h-[60%] rounded-[50%] bg-[conic-gradient(from_0deg,#ef4444,#eab308,#22c55e,#3b82f6,#ef4444)] shadow-lg transform rotate-45 border-4 border-white"></div>
             </div>
         );
     }
     
     if (card.value === CardValue.WILD_DRAW_FOUR) {
         return (
             <div className={`relative w-full h-full flex items-center justify-center ${skin === 'neon' ? 'drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]' : ''}`}>
                 {/* Diagonal Stack */}
                 <div className="absolute w-8 h-12 bg-green-500 rounded border-2 border-white transform -translate-x-3 translate-y-2 rotate-[-15deg]"></div>
                 <div className="absolute w-8 h-12 bg-blue-500 rounded border-2 border-white transform -translate-x-1 translate-y-0 rotate-[-5deg]"></div>
                 <div className="absolute w-8 h-12 bg-yellow-500 rounded border-2 border-white transform translate-x-1 -translate-y-2 rotate-[5deg]"></div>
                 <div className="absolute w-8 h-12 bg-red-500 rounded border-2 border-white transform translate-x-3 -translate-y-4 rotate-[15deg]"></div>
             </div>
         );
     }

     // Standard Values
     switch(card.value) {
         case CardValue.SKIP: return "⊘";
         case CardValue.REVERSE: return "⇄";
         case CardValue.DRAW_TWO: return "+2";
         default: return card.value;
     }
  };

  const centerTextColor = isWild ? 'text-black' :
    card.color === CardColor.RED ? 'text-red-600' :
    card.color === CardColor.BLUE ? 'text-blue-600' :
    card.color === CardColor.GREEN ? 'text-green-600' :
    'text-yellow-600';

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      style={{ transform: `rotate(${rotation}deg)`, ...dynamicStyle }}
      className={`
        relative rounded-xl shadow-lg select-none transition-all duration-200
        ${backgroundClass}
        ${borderClass}
        ${shadowClass}
        ${isSmall ? 'w-12 h-16 text-xl' : 'w-24 h-36 text-4xl'}
        ${!disabled && onClick ? 'cursor-pointer hover:-translate-y-4 hover:z-50 ring-4 ring-white/50' : ''}
        ${disabled ? 'opacity-100 brightness-50 cursor-not-allowed' : ''} 
        border-b-4 border-black/20
        card-skin-${skin}
        overflow-hidden
      `}
    >
      {/* Skin Specific Background Elements */}
      {isWild && skin === 'neon' && (
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>
      )}
      {isWild && skin === 'crystal' && (
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-shimmer pointer-events-none"></div>
      )}

      {/* 3D Highlight Top Edge */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-white/30 rounded-t-xl pointer-events-none"></div>

      {/* Center Area */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {isWild ? (
            // Wild Symbol (No Oval Background)
            <div className="w-[85%] h-[60%] flex items-center justify-center">
                {renderContent()}
            </div>
        ) : (
            // Standard Oval
            <div className="w-[85%] h-[60%] bg-white shadow-inner rounded-[50%] transform rotate-45 flex items-center justify-center">
                 <span className={`transform -rotate-45 font-black text-5xl drop-shadow-sm ${centerTextColor}`}>
                    {renderContent()}
                 </span>
            </div>
        )}
      </div>
      
      {/* Corner Values (Top Left) */}
      <div className="absolute top-1 left-2 flex flex-col items-center leading-none pointer-events-none">
        <span className="text-white text-xs font-bold drop-shadow-md">
            {isWild ? 'W' : renderContent()}
        </span>
      </div>

      {/* Corner Values (Bottom Right) */}
      <div className="absolute bottom-1 right-2 flex flex-col items-center leading-none transform rotate-180 pointer-events-none">
        <span className="text-white text-xs font-bold drop-shadow-md">
            {isWild ? 'W' : renderContent()}
        </span>
      </div>
      
      {/* Wild Card: Add a rainbow border or effect if needed (Classic only) */}
      {isWild && skin === 'classic' && !effectiveColor && (
          <div className="absolute inset-0 rounded-xl border-2 border-white/10 pointer-events-none"></div>
      )}
    </div>
  );
};