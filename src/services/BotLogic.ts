import type { Card, Player } from '../types.ts';
import { CardColor, CardValue } from '../types.ts';

/**
 * Phase 2: Bot Logic Module
 * 
 * Decision function: calculateBotMove(hand, topCard, activeColor)
 */

export const calculateBotMove = (
  hand: Card[],
  topCard: Card,
  activeColor: CardColor,
  players: Player[],
  currentPlayerId: string,
  pendingDrawValue: number // Added for Stacking Logic
): { action: 'PLAY' | 'DRAW', cardId?: string, chosenColor?: CardColor, targetPlayerId?: string } => {
  
  // 0. CRITICAL: Stacking Defense (Chaos Mode)
  // If we are under attack (pendingDrawValue > 0), we MUST Stack or Surrender.
  if (pendingDrawValue > 0) {
      const isAttackPlusTwo = topCard.value === CardValue.DRAW_TWO;
      const isAttackPlusFour = topCard.value === CardValue.WILD_DRAW_FOUR;

      // Try to find a matching stacking card
      let defenseCard: Card | undefined;
      
      if (isAttackPlusTwo) {
          defenseCard = hand.find(c => c.value === CardValue.DRAW_TWO);
      } else if (isAttackPlusFour) {
          defenseCard = hand.find(c => c.value === CardValue.WILD_DRAW_FOUR);
      }

      if (defenseCard) {
          // Option A: Stack!
          return {
              action: 'PLAY',
              cardId: defenseCard.id,
              chosenColor: defenseCard.color === CardColor.WILD ? CardColor.RED : undefined // Simple color choice for Wild +4
          };
      } else {
          // Option B: Surrender (Accept Penalty)
          // Returning DRAW will trigger the handleDraw logic which accepts the full stack
          return { action: 'DRAW' };
      }
  }

  // 1. Filter playable cards (Normal Turn)
  const playableCards = hand.filter(card => {
    return (
      card.color === CardColor.WILD || // Wilds are always playable
      card.color === activeColor ||    // Color match
      card.value === topCard.value     // Value match
    );
  });

  // 2. If no playable cards, Draw
  if (playableCards.length === 0) {
    return { action: 'DRAW' };
  }

  // 3. Simple Strategy: 
  // - Prioritize Special Cards (Skip, Reverse, +2) to disrupt
  // - Then match color
  // - Keep Wilds for last resort unless it's the only option
  
  let bestCard = playableCards.find(c => c.value === CardValue.DRAW_TWO || c.value === CardValue.SKIP || c.value === CardValue.REVERSE || c.value === CardValue.SEVEN || c.value === CardValue.ZERO);
  
  if (!bestCard) {
    // Try to find a non-wild color match
    bestCard = playableCards.find(c => c.color === activeColor && c.color !== CardColor.WILD);
  }
  
  if (!bestCard) {
     // Try to find a value match
     bestCard = playableCards.find(c => c.value === topCard.value && c.color !== CardColor.WILD);
  }

  // Fallback to whatever is playable (usually Wilds if we reached here)
  if (!bestCard) {
    bestCard = playableCards[0];
  }

  // 4. Determine Color Choice for Wilds
  let chosenColor: CardColor | undefined;
  if (bestCard.color === CardColor.WILD) {
    // Pick the color we have the most of
    const colorCounts = {
        [CardColor.RED]: 0,
        [CardColor.BLUE]: 0,
        [CardColor.GREEN]: 0,
        [CardColor.YELLOW]: 0,
        [CardColor.WILD]: -999 
    };
    
    hand.forEach(c => {
        if (c.color !== CardColor.WILD) {
            colorCounts[c.color]++;
        }
    });

    const maxColor = Object.keys(colorCounts).reduce((a, b) => 
        colorCounts[a as CardColor] > colorCounts[b as CardColor] ? a : b
    );
    
    chosenColor = maxColor as CardColor;
  }

  // 5. Determine Target for '7' (Swap Hands)
  let targetPlayerId: string | undefined;
  if (bestCard.value === CardValue.SEVEN) {
      // Strategy: Swap with the player who has the FEWEST cards (closest to winning)
      // But avoid swapping if WE have fewer cards than them (unless we want to be nice? No.)
      // Actually, if we play 7, we want to dump our hand if it's bad, or steal a good hand.
      // Simple Bot: Always try to steal the smallest hand that isn't ours.
      
      let minCards = 999;
      let target: Player | null = null;
      
      players.forEach(p => {
          if (p.id !== currentPlayerId) {
              if (p.hand.length < minCards) {
                  minCards = p.hand.length;
                  target = p;
              }
          }
      });
      
      if (target) {
          targetPlayerId = (target as Player).id;
      }
  }

  return {
    action: 'PLAY',
    cardId: bestCard.id,
    chosenColor,
    targetPlayerId
  };
};
