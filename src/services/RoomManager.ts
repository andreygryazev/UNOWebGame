import { GameEngine } from './GameEngine.ts';
import type { GameMode } from '../types.ts';

/**
 * Phase 3+: Room Manager with Lifecycle Management
 * Handles creation, joining, cleanup and TTL expiry of rooms.
 */

const ROOM_TTL_MS = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes

class RoomManager {
  private rooms: Map<string, GameEngine> = new Map();
  private roomTimestamps: Map<string, number> = new Map(); // Last activity time
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Start periodic cleanup
    this.cleanupTimer = setInterval(() => this.cleanupExpiredRooms(), CLEANUP_INTERVAL_MS);
    console.log(`[RoomManager] TTL cleanup enabled (${ROOM_TTL_MS / 60000} min TTL, checks every ${CLEANUP_INTERVAL_MS / 60000} min)`);
  }

  public createRoom(hostName: string, hostId: number, forcedRoomId?: string, avatarId?: number, mode: GameMode = 'standard'): { roomId: string, engine: GameEngine } {
    const roomId = forcedRoomId || Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit code
    const engine = new GameEngine(roomId, mode);
    
    engine.addPlayer(hostName, false, hostId, avatarId || 1);
    this.rooms.set(roomId, engine);
    this.roomTimestamps.set(roomId, Date.now());
    
    console.log(`[RoomManager] Room ${roomId} created (total: ${this.rooms.size})`);
    return { roomId, engine };
  }

  public joinRoom(roomId: string, playerName: string, playerId: number, avatarId?: number): GameEngine | null {
    const engine = this.rooms.get(roomId);
    if (!engine) return null;

    engine.addPlayer(playerName, false, playerId, avatarId || 1);
    this.touchRoom(roomId); // Refresh TTL
    return engine;
  }

  public getRoom(roomId: string): GameEngine | null {
    return this.rooms.get(roomId) || null;
  }

  /** Refresh the TTL timestamp for a room (call on any activity) */
  public touchRoom(roomId: string) {
    if (this.rooms.has(roomId)) {
      this.roomTimestamps.set(roomId, Date.now());
    }
  }

  /**
   * Delete a room: destroy the engine (clear timers), remove from maps.
   */
  public deleteRoom(roomId: string): boolean {
    const engine = this.rooms.get(roomId);
    if (!engine) return false;

    engine.destroy();
    this.rooms.delete(roomId);
    this.roomTimestamps.delete(roomId);
    console.log(`[RoomManager] Room ${roomId} deleted (remaining: ${this.rooms.size})`);
    return true;
  }

  /** 
   * Remove a player from their room. 
   * If no human players remain, destroy the room automatically.
   * Returns true if the room was destroyed.
   */
  public handlePlayerDisconnect(roomId: string, playerId: string): boolean {
    const engine = this.rooms.get(roomId);
    if (!engine) return false;

    const humanCount = engine.removePlayer(playerId);
    
    if (humanCount === 0) {
      console.log(`[RoomManager] No humans left in room ${roomId}. Auto-deleting.`);
      this.deleteRoom(roomId);
      return true;
    }

    this.touchRoom(roomId);
    return false;
  }

  /** Periodic cleanup of expired/finished rooms */
  private cleanupExpiredRooms() {
    const now = Date.now();
    let cleaned = 0;

    for (const [roomId, lastActivity] of this.roomTimestamps.entries()) {
      const engine = this.rooms.get(roomId);
      const isExpired = (now - lastActivity) > ROOM_TTL_MS;
      const isOver = engine?.isGameOver() && (now - lastActivity) > 60000; // 1 min after game over

      if (isExpired || isOver) {
        console.log(`[RoomManager] Cleanup: ${roomId} (expired: ${isExpired}, gameOver: ${isOver})`);
        this.deleteRoom(roomId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[RoomManager] Cleaned ${cleaned} room(s). Active: ${this.rooms.size}`);
    }
  }

  /** Get count of active rooms (for monitoring) */
  public getRoomCount(): number {
    return this.rooms.size;
  }
}

export const roomManager = new RoomManager();
