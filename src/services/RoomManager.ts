import { GameEngine } from './GameEngine.ts';
import type { GameMode } from '../types.ts';

/**
 * Phase 3: Room Manager
 * Handles creation and joining of rooms.
 */

class RoomManager {
  private rooms: Map<string, GameEngine> = new Map();

  public createRoom(hostName: string, hostId: number, forcedRoomId?: string, avatarId?: number, mode: GameMode = 'standard'): { roomId: string, engine: GameEngine } {
    const roomId = forcedRoomId || Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit code
    const engine = new GameEngine(roomId, mode);
    
    engine.addPlayer(hostName, false, hostId, avatarId || 1);
    this.rooms.set(roomId, engine);
    
    return { roomId, engine };
  }

  public joinRoom(roomId: string, playerName: string, playerId: number, avatarId?: number): GameEngine | null {
    const engine = this.rooms.get(roomId);
    if (!engine) return null;

    engine.addPlayer(playerName, false, playerId, avatarId || 1);
    return engine;
  }

  public getRoom(roomId: string): GameEngine | null {
    return this.rooms.get(roomId) || null;
  }
}

export const roomManager = new RoomManager();
