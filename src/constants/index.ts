import { CardColor } from './types.ts';

export const CARD_COLORS_MAP: Record<CardColor, string> = {
  [CardColor.RED]: 'bg-red-500',
  [CardColor.BLUE]: 'bg-blue-500',
  [CardColor.GREEN]: 'bg-green-500',
  [CardColor.YELLOW]: 'bg-yellow-400',
  [CardColor.WILD]: 'bg-slate-800' // Visual background for Wild cards
};

export const TEXT_COLORS_MAP: Record<CardColor, string> = {
    [CardColor.RED]: 'text-red-500',
    [CardColor.BLUE]: 'text-blue-500',
    [CardColor.GREEN]: 'text-green-500',
    [CardColor.YELLOW]: 'text-yellow-500',
    [CardColor.WILD]: 'text-white'
  };