import type { Card, GameState, Player, GameMode, GameRules } from '../types.ts';
import { CardColor, CardValue, GameStatus } from '../types.ts';
import { calculateBotMove } from './BotLogic.ts';
import { run, get } from '../../server/db.ts';

/**
 * Phase 2 & 5: Game Engine with Bot Logic & DB Integration
 */

export class GameEngine {
  private state: GameState;
  private deck: Card[] = [];
  private subscribers: ((state: GameState) => void)[] = [];
  public readonly roomId: string;
  private botTimeout: any;
  private turnTimeout: any; // Turn Timer

  constructor(roomId: string, mode: GameMode = 'standard') {
    this.roomId = roomId;
    this.state = this.getInitialState(roomId, mode);
  }

  public getState(): GameState {
      return JSON.parse(JSON.stringify(this.state));
  }

  private getInitialState(roomId: string, mode: GameMode): GameState {
    const rules: GameRules = {
      stacking: mode === 'chaos',
      jumpIn: mode === 'chaos',
      sevenZero: mode === 'chaos',
      forcePlay: mode === 'no-mercy'
    };

    return {
      roomId,
      players: [],
      deckCount: 0,
      discardPile: [],
      turnIndex: 0,
      direction: 1,
      status: GameStatus.LOBBY,
      winnerId: null,
      activeColor: CardColor.WILD,
      message: 'Waiting for players...',
      hasDrawnThisTurn: false,
      turnStartTime: Date.now(),
      mode,
      rules,
      pendingDrawValue: 0
    };
  }

  // --- Deck Logic ---

  private generateDeck(): Card[] {
    const deck: Card[] = [];
    const colors = [CardColor.RED, CardColor.BLUE, CardColor.GREEN, CardColor.YELLOW];
    
    let idCounter = 0;
    const createId = () => `card_${Date.now()}_${idCounter++}`;

    colors.forEach(color => {
      deck.push({ id: createId(), color, value: CardValue.ZERO });
      const values = [
        CardValue.ONE, CardValue.TWO, CardValue.THREE, CardValue.FOUR,
        CardValue.FIVE, CardValue.SIX, CardValue.SEVEN, CardValue.EIGHT, CardValue.NINE,
        CardValue.SKIP, CardValue.REVERSE, CardValue.DRAW_TWO
      ];
      values.forEach(value => {
        deck.push({ id: createId(), color, value });
        deck.push({ id: createId(), color, value });
      });
    });

    for (let i = 0; i < 4; i++) {
      deck.push({ id: createId(), color: CardColor.WILD, value: CardValue.WILD });
      deck.push({ id: createId(), color: CardColor.WILD, value: CardValue.WILD_DRAW_FOUR });
    }

    return this.shuffle(deck);
  }

  private shuffle(deck: Card[]): Card[] {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  // --- Game Loop Management ---

  public subscribe(callback: (state: GameState) => void): () => void {
    this.subscribers.push(callback);
    callback(this.state);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private broadcast() {
    const safeState = JSON.parse(JSON.stringify(this.state));
    this.subscribers.forEach(cb => cb(safeState));
  }

  // --- Actions ---

  public addPlayer(playerName: string, isBot: boolean = false, dbId?: number, avatarId?: number): Player | null {
    if (this.state.players.length >= 4) return null;
    if (this.state.status !== GameStatus.LOBBY) return null;

    // Check if re-joining (simplification: just deny for now if same name)
    if (this.state.players.find(p => p.name === playerName)) return null;

    const newPlayer: Player = {
      id: isBot ? `bot_${Date.now()}_${Math.random()}` : (dbId ? dbId.toString() : `player_${Date.now()}`),
      name: playerName,
      hand: [],
      isBot,
      avatarId: avatarId || 1, // Default to 1 if not provided
      hasSaidUno: false
    };

    this.state.players.push(newPlayer);
    this.broadcast();
    return newPlayer;
  }

  public startGame() {
    if (this.state.players.length < 2) return;

    this.deck = this.generateDeck();
    
    this.state.players.forEach(player => {
      player.hand = this.deck.splice(0, 7);
    });

    let startCard = this.deck.pop()!;
    while (startCard.color === CardColor.WILD) {
      this.deck.unshift(startCard);
      this.deck = this.shuffle(this.deck);
      startCard = this.deck.pop()!;
    }

    this.state.discardPile = [startCard];
    this.state.activeColor = startCard.color;
    this.state.deckCount = this.deck.length;
    this.state.status = GameStatus.PLAYING;
    this.state.message = "Game Started!";
    this.state.turnStartTime = Date.now();
    
    this.startTurnTimer(); // Start Timer
    this.broadcast();
    
    // Check if first player is bot
    this.handleBotTurn();
  }

  public drawCard(playerId: string) {
    if (this.state.status !== GameStatus.PLAYING) return;
    const playerIndex = this.state.players.findIndex(p => p.id === playerId);
    if (playerIndex !== this.state.turnIndex) return; 
    
    // Fix: Infinite Draw Exploit
    if (this.state.hasDrawnThisTurn) {
        return; // Already drawn, must play or pass (if supported)
    }

    // Stacking Logic: Accepting the Penalty
    if (this.state.pendingDrawValue > 0) {
        this.state.message = `${this.state.players[playerIndex].name} accepted the stack! (+${this.state.pendingDrawValue})`;
        this.handleDraw(playerIndex, this.state.pendingDrawValue);
        this.state.pendingDrawValue = 0;
        this.advanceTurn();
        this.broadcast();
        return;
    }

    // Draw 1 Card
    this.handleDraw(playerIndex, 1);
    this.state.hasDrawnThisTurn = true;
    this.startTurnTimer(); // Reset Timer on Draw (Give them time to play)
    
    const player = this.state.players[playerIndex];
    const drawnCard = player.hand[player.hand.length - 1];
    const topCard = this.state.discardPile[this.state.discardPile.length - 1];

    // Check if playable
    const isPlayable = 
        drawnCard.color === CardColor.WILD || 
        drawnCard.color === this.state.activeColor || 
        drawnCard.value === topCard.value;

    if (isPlayable) {
        this.state.message = `${player.name} drew a playable card!`;
        // Do NOT advance turn. Let player choose.
        this.broadcast();
        
        // If it's a bot, we need to trigger logic again to play it
        if (player.isBot) {
             this.handleBotTurn(true); // Immediate follow-up for bot
        }
    } else {
        this.state.message = `${player.name} drew and passed.`;
        this.advanceTurn();
        this.broadcast();
    }
  }

  public playCard(playerId: string, cardId: string, chosenColor?: CardColor, targetPlayerId?: string) {
    if (this.state.status !== GameStatus.PLAYING) return;
    
    const playerIndex = this.state.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    const player = this.state.players[playerIndex];
    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const card = player.hand[cardIndex];
    const topCard = this.state.discardPile[this.state.discardPile.length - 1];

    // Turn Validation & Jump-In Logic
    if (playerIndex !== this.state.turnIndex) {
        // Check if Jump-In is allowed
        if (!this.state.rules.jumpIn) return;
        
        // Cannot Jump-In during a Stack war
        if (this.state.pendingDrawValue > 0) return;

        // Jump-In Requirement: EXACT MATCH (Color & Value)
        // Note: We compare physical card color, not activeColor
        const isExactMatch = card.color === topCard.color && card.value === topCard.value;
        
        if (!isExactMatch) return;

        // Successful Jump-In!
        this.state.message = `${player.name} JUMPED IN!`;
        console.log(`[Jump-In] ${player.name} interrupted the turn order!`);
        
        // Update turn index to the jumper so the play proceeds as if it's their turn
        this.state.turnIndex = playerIndex;
        
        // Reset draw flag for the new turn owner
        this.state.hasDrawnThisTurn = false;
        this.state.turnStartTime = Date.now();
        this.startTurnTimer(); // Restart Timer for Jumper
    }
    
    const isColorMatch = card.color === this.state.activeColor;
    const isValueMatch = card.value === topCard.value;
    const isWild = card.color === CardColor.WILD;

    // Stacking Validation: If stack is active, must play matching +2 or +4
    if (this.state.pendingDrawValue > 0) {
        const topIsPlusTwo = topCard.value === CardValue.DRAW_TWO;
        const topIsPlusFour = topCard.value === CardValue.WILD_DRAW_FOUR;
        
        if (topIsPlusTwo && card.value !== CardValue.DRAW_TWO) return;
        if (topIsPlusFour && card.value !== CardValue.WILD_DRAW_FOUR) return;
    } else {
        if (!isColorMatch && !isValueMatch && !isWild) return;
    }

    player.hand.splice(cardIndex, 1);
    
    // Assign random rotation for visual flair
    card.rotation = Math.floor(Math.random() * 30) - 15;
    
    this.state.discardPile.push(card);

    if (isWild) {
       this.state.activeColor = chosenColor || CardColor.RED;
       
       // Update card in discard pile with chosen color for visuals
       const playedCard = this.state.discardPile[this.state.discardPile.length - 1];
       playedCard.chosenColor = this.state.activeColor;

       this.state.message = `${player.name} picked ${this.state.activeColor}`;
    } else {
       this.state.activeColor = card.color;
       this.state.message = `${player.name} played ${card.color} ${card.value}`;
    }

    // === UNO PENALTY SYSTEM ===
    if (player.hand.length === 1 && !player.hasSaidUno) {
      console.log(`[UNO] ${player.name} has 1 card but hasn't said UNO. Starting penalty timer...`);
      
      // Start 2-second penalty timer
      setTimeout(() => {
        // Re-check after 2 seconds (player might have clicked UNO button)
        if (this.state.players[playerIndex]?.hand.length === 1 && !this.state.players[playerIndex]?.hasSaidUno) {
          console.log(`[UNO] ${player.name} FAILED to say UNO! Drawing 2 cards as penalty.`);
          this.handleDraw(playerIndex, 2);
          this.state.message = `${player.name} forgot to say UNO! +2 cards`;
          this.broadcast();
        }
      }, 2000);
    }

    // Special Cards
    let skipNext = false;
    if (card.value === CardValue.REVERSE) {
      this.state.direction *= -1;
      this.state.message += " (Reverse)";
      if (this.state.players.length === 2) skipNext = true;
    } else if (card.value === CardValue.SKIP) {
      skipNext = true;
      this.state.message += " (Skip)";
    } else if (card.value === CardValue.DRAW_TWO) {
        if (this.state.rules.stacking) {
            this.state.pendingDrawValue += 2;
            this.state.message += ` (Stack: ${this.state.pendingDrawValue})`;
            // Stacking: Do NOT skip. Next player must respond.
        } else {
            const nextIdx = this.getNextPlayerIndex(1);
            this.handleDraw(nextIdx, 2);
            skipNext = true;
            this.state.message += " (+2)";
        }
    } else if (card.value === CardValue.WILD_DRAW_FOUR) {
        if (this.state.rules.stacking) {
            this.state.pendingDrawValue += 4;
            this.state.message += ` (Stack: ${this.state.pendingDrawValue})`;
            // Stacking: Do NOT skip. Next player must respond.
        } else {
            const nextIdx = this.getNextPlayerIndex(1);
            this.handleDraw(nextIdx, 4);
            skipNext = true;
            this.state.message += " (+4)";
        }
    } else if (card.value === CardValue.ZERO && this.state.rules.sevenZero) {
        this.rotateHands();
        this.state.message += " (Hands Rotated!)";
    } else if (card.value === CardValue.SEVEN && this.state.rules.sevenZero) {
        // 7-0 Rule: Swap Hands
        let targetIndex = -1;
        
        if (targetPlayerId) {
            targetIndex = this.state.players.findIndex(p => p.id === targetPlayerId);
        }
        
        // Fallback: If no target or invalid target, swap with next player
        if (targetIndex === -1 || targetIndex === playerIndex) {
            targetIndex = this.getNextPlayerIndex(1);
        }

        const targetPlayer = this.state.players[targetIndex];
        const tempHand = [...player.hand];
        player.hand = [...targetPlayer.hand];
        targetPlayer.hand = tempHand;
        this.state.message += ` (Swapped with ${targetPlayer.name})`;
    }

    // Check for ANY winner (including swap recipients)
    const winner = this.state.players.find(p => p.hand.length === 0);
    if (winner) {
        this.endGame(winner);
        return;
    }

    this.advanceTurn(skipNext ? 2 : 1);
    this.broadcast();
    this.handleBotTurn();
  }

  private rotateHands() {
      const hands = this.state.players.map(p => p.hand);
      if (this.state.direction === 1) {
          // Clockwise: Last player's hand goes to first (shifting array right)
          // [A, B, C, D] -> [D, A, B, C]
          // Player 0 (A) gets D's hand. Player 1 (B) gets A's hand.
          hands.unshift(hands.pop()!);
      } else {
          // Counter-Clockwise: First player's hand goes to last (shifting array left)
          // [A, B, C, D] -> [B, C, D, A]
          // Player 0 (A) gets B's hand.
          hands.push(hands.shift()!);
      }
      
      this.state.players.forEach((p, i) => {
          p.hand = hands[i];
      });
  }

  // --- End Game Logic (Updated for Async/Await & Sqlite3) ---
  private async endGame(winner: Player) {
    clearTimeout(this.turnTimeout); // Stop Timer
    clearTimeout(this.botTimeout);

    this.state.status = GameStatus.GAME_OVER;
    this.state.winnerId = winner.id;
    this.state.message = `${winner.name} WINS!`;
    
    // Update Database asynchronously
    if (!winner.isBot) {
        console.log(`[DB] Updating Winner ${winner.name} (+25 MMR, +50 Coins)`);
        try {
            // Use 'any' cast if TS complains about strict type of rows returned
            const user: any = await get('SELECT * FROM users WHERE id = ?', parseInt(winner.id));
            if (user) {
                await run("UPDATE users SET mmr = ?, wins = wins + 1, coins = coins + 50 WHERE id = ?", user.mmr + 25, user.id);
                
                // Emit currency update event
                // Note: We'll emit a special currencyUpdate event via the subscriber
            }
        } catch (error) {
            console.error('[DB] Failed to update winner stats:', error);
        }
    }

    // Update Losers
    for (const p of this.state.players) {
        if (!p.isBot && p.id !== winner.id) {
            console.log(`[DB] Updating Loser ${p.name} (-10 MMR, +15 Coins)`);
            try {
                const user: any = await get('SELECT * FROM users WHERE id = ?', parseInt(p.id));
                if (user) {
                    await run("UPDATE users SET mmr = ?, losses = losses + 1, coins = coins + 15 WHERE id = ?", Math.max(0, user.mmr - 10), user.id);
                }
            } catch (error) {
                console.error('[DB] Failed to update loser stats:', error);
            }
        }
    }

    this.broadcast();
  }

  // --- Helpers ---

  private getNextPlayerIndex(step: number = 1): number {
    const len = this.state.players.length;
    const rawIndex = (this.state.turnIndex + (step * this.state.direction)) % len;
    return (rawIndex + len) % len;
  }

  private advanceTurn(step: number = 1) {
    this.state.turnIndex = this.getNextPlayerIndex(step);
    this.state.hasDrawnThisTurn = false; // Reset draw flag
    this.state.turnStartTime = Date.now(); // Reset timer
    
    // Chaos Mode: Auto-Penalty Check
    if (this.state.mode === 'chaos' && this.state.pendingDrawValue > 0) {
        const currentPlayer = this.state.players[this.state.turnIndex];
        const topCard = this.state.discardPile[this.state.discardPile.length - 1];
        
        // Check if player has a counter card (Stacking)
        const hasCounter = currentPlayer.hand.some(c => {
            if (topCard.value === CardValue.DRAW_TWO && c.value === CardValue.DRAW_TWO) return true;
            if (topCard.value === CardValue.WILD_DRAW_FOUR && c.value === CardValue.WILD_DRAW_FOUR) return true;
            return false;
        });

        if (!hasCounter) {
            console.log(`[Chaos] ${currentPlayer.name} has no counter! Auto-drawing ${this.state.pendingDrawValue}`);
            this.state.message = `${currentPlayer.name} had no counter! Auto-drew ${this.state.pendingDrawValue}`;
            
            this.handleDraw(this.state.turnIndex, this.state.pendingDrawValue);
            this.state.pendingDrawValue = 0;
            
            // Recursively advance to next player (Player loses turn after penalty)
            this.advanceTurn(1);
            return;
        }
    }

    this.startTurnTimer(); // Start Timer for Next Player

    // Reset UNO declaration for the new turn
    this.state.players[this.state.turnIndex].hasSaidUno = false;
    
    // Fix: Trigger Bot Loop
    this.handleBotTurn();
  }

  private startTurnTimer() {
      clearTimeout(this.turnTimeout);
      
      // 30 Seconds per turn
      this.turnTimeout = setTimeout(() => {
          if (this.state.status !== GameStatus.PLAYING) return;
          
          const currentPlayer = this.state.players[this.state.turnIndex];
          console.log(`[Timer] ${currentPlayer.name} ran out of time!`);
          
          this.state.message = `${currentPlayer.name} ran out of time!`;
          
          // Penalty: Draw 1 and Pass
          this.handleDraw(this.state.turnIndex, 1);
          this.advanceTurn();
          this.broadcast();
      }, 30000);
  }

  private handleDraw(playerIndex: number, count: number) {
    for (let i = 0; i < count; i++) {
        if (this.deck.length === 0) {
            if (this.state.discardPile.length > 1) {
                const top = this.state.discardPile.pop()!;
                const rest = this.state.discardPile;
                this.state.discardPile = [top];
                this.deck = this.shuffle(rest);
                this.state.deckCount = this.deck.length;
            } else {
                break;
            }
        }
        if (this.deck.length > 0) {
            this.state.players[playerIndex].hand.push(this.deck.pop()!);
        }
    }
    this.state.deckCount = this.deck.length;
  }

  // === UNO DECLARATION ===
  public sayUno(playerId: string) {
    const player = this.state.players.find(p => p.id === playerId);
    if (!player) return;
    
    player.hasSaidUno = true;
    this.state.message = `${player.name} said UNO!`;
    console.log(`[UNO] ${player.name} declared UNO!`);
    this.broadcast();
  }

  // --- Bot AI Integration ---

  public passTurn(playerId: string) {
    if (this.state.status !== GameStatus.PLAYING) return;
    const playerIndex = this.state.players.findIndex(p => p.id === playerId);
    if (playerIndex !== this.state.turnIndex) return;
    
    // Only allow passing if they have drawn a card
    if (this.state.hasDrawnThisTurn) {
        this.state.message = `${this.state.players[playerIndex].name} passed.`;
        this.advanceTurn();
        this.broadcast();
    }
  }

  // --- Bot AI Integration ---

  private async handleBotTurn(isFollowUp: boolean = false) {
    if (!isFollowUp) clearTimeout(this.botTimeout);
    
    // Check if game is over
    if (this.state.status !== GameStatus.PLAYING) return;

    const currentPlayer = this.state.players[this.state.turnIndex];
    if (!currentPlayer || !currentPlayer.isBot) return;

    console.log(`[Bot] Turn: ${currentPlayer.name} (FollowUp: ${isFollowUp})`);

    // Artificial Delay (1.5s - 2.5s)
    // If it's a follow-up (played immediately after draw), make it faster (500ms)
    const delay = isFollowUp ? 500 : (1500 + Math.random() * 1000);
    
    this.botTimeout = setTimeout(() => {
        // Re-check state inside timeout
        if (this.state.status !== GameStatus.PLAYING) return;
        const currentNow = this.state.players[this.state.turnIndex];
        if (currentNow.id !== currentPlayer.id) return; // Turn changed?

        const topCard = this.state.discardPile[this.state.discardPile.length - 1];
        
        const move = calculateBotMove(currentPlayer.hand, topCard, this.state.activeColor, this.state.players, currentPlayer.id, this.state.pendingDrawValue);
        console.log(`[Bot] ${currentPlayer.name} decides to: ${move.action}`);

        if (move.action === 'PLAY' && move.cardId) {
            this.playCard(currentPlayer.id, move.cardId, move.chosenColor, move.targetPlayerId);
            
            // === BOT UNO LOGIC ===
            // Check if bot now has 1 card left
            if (currentPlayer.hand.length === 1) {
              const forgetChance = Math.random(); // 0.0 to 1.0
              if (forgetChance < 0.8) {
                // 80% chance: Bot remembers to say UNO
                console.log(`[Bot] ${currentPlayer.name} remembers to say UNO!`);
                this.sayUno(currentPlayer.id);
              } else {
                // 20% chance: Bot forgets (will be caught by penalty timer)
                console.log(`[Bot] ${currentPlayer.name} forgot to say UNO! Will be penalized...`);
              }
            }
        } else {
            // If we already drawn and still can't play, we must PASS.
            if (!this.state.hasDrawnThisTurn) {
                this.drawCard(currentPlayer.id);
            } else {
                console.log(`[Bot] ${currentPlayer.name} cannot play after drawing. Passing.`);
                this.passTurn(currentPlayer.id);
            }
        }
    }, delay);
  }
}