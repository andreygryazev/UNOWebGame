
export const CardColor = {
  RED: 'RED',
  BLUE: 'BLUE',
  GREEN: 'GREEN',
  YELLOW: 'YELLOW',
  WILD: 'WILD'
} as const;
export type CardColor = typeof CardColor[keyof typeof CardColor];

export const CardValue = {
  ZERO: '0',
  ONE: '1',
  TWO: '2',
  THREE: '3',
  FOUR: '4',
  FIVE: '5',
  SIX: '6',
  SEVEN: '7',
  EIGHT: '8',
  NINE: '9',
  SKIP: 'SKIP',
  REVERSE: 'REVERSE',
  DRAW_TWO: '+2',
  WILD: 'WILD',
  WILD_DRAW_FOUR: '+4'
} as const;
export type CardValue = typeof CardValue[keyof typeof CardValue];

export interface Card {
  id: string;
  color: CardColor;
  value: CardValue;
  logicColor?: CardColor;
  rotation?: number; 
  chosenColor?: CardColor;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isBot: boolean;
  avatarId: number;
  hasSaidUno: boolean;
}

export const GameStatus = {
  LOBBY: 'LOBBY',
  PLAYING: 'PLAYING',
  GAME_OVER: 'GAME_OVER'
} as const;
export type GameStatus = typeof GameStatus[keyof typeof GameStatus];

export type GameMode = 'standard' | 'chaos' | 'no-mercy' | 'uno-flip' | 'all-wild' | '2v2';

export interface GameRules {
  stacking: boolean;
  jumpIn: boolean;
  sevenZero: boolean;
  forcePlay: boolean; // For No Mercy later
}

export interface GameState {
  players: Player[];
  deckCount: number;
  discardPile: Card[];
  turnIndex: number;
  direction: 1 | -1;
  status: GameStatus;
  winnerId: string | null;
  activeColor: CardColor;
  message: string;
  roomId?: string;
  hasDrawnThisTurn: boolean;
  turnStartTime: number;
  mode: GameMode;
  rules: GameRules;
  pendingDrawValue: number; // For Stacking Logic
}

// --- Auth & DB Types (Phase 1) ---

export interface User {
  id: number; // INTEGER PK
  username: string; // TEXT UNIQUE
  password_hash: string; // TEXT
  mmr: number; // INTEGER DEFAULT 1000
  wins: number; // INTEGER DEFAULT 0
  losses: number; // INTEGER DEFAULT 0
  avatar_id: number; // INTEGER DEFAULT 1
  coins: number; // INTEGER DEFAULT 0
  equipped_table?: string; // TEXT DEFAULT 'default'
  equipped_card?: string; // TEXT DEFAULT 'classic'
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password_hash'>;
}

export interface ServerResponse {
  state: GameState;
  error?: string;
}