import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { login, register } from './auth.ts';
import { get, run, db } from './db.ts';
import { GameEngine } from '../services/GameEngine.ts';
import { roomManager } from '../services/RoomManager.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = process.env.PORT || 3000;
const app = express();
const httpServer = createServer(app);

// Socket.io Setup (CORS allowed for development split-mode)
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow connections from Vite dev server
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json() as any);

// --- API ROUTES ---

app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await register(username, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await login(username, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

app.get('/api/user/:id', async (req, res) => {
  const user = await get('SELECT id, username, mmr, wins, losses, avatar_id, coins, equipped_table, equipped_card FROM users WHERE id = ?', req.params.id);
  if (user) res.json(user);
  else res.status(404).json({ error: 'User not found' });
});

app.post('/api/user/avatar', async (req, res) => {
  try {
    const { userId, avatarId } = req.body;
    if (!userId || !avatarId) throw new Error('Missing fields');
    
    await run('UPDATE users SET avatar_id = ? WHERE id = ?', avatarId, userId);
    res.json({ success: true, avatarId });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- SHOP SYSTEM ---

import { SHOP_DATA } from '../constants/shopData.ts';

// ... (existing imports)

app.post('/api/shop/buy', async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    if (!userId || !itemId) throw new Error('Missing fields');
    
    // 1. Find item in server-side data (Security: Don't trust client price/type)
    const shopItem = SHOP_DATA.find(i => i.id === itemId);
    if (!shopItem) throw new Error('Invalid item');

    const price = shopItem.price;
    const type = shopItem.type;

    // 2. Check if user has enough coins
    const user: any = await get('SELECT coins FROM users WHERE id = ?', userId);
    if (!user) throw new Error('User not found');
    if (user.coins < price) throw new Error('Insufficient coins');
    
    // 3. Check if already owned (The Bundle itself)
    const existing = await get('SELECT * FROM user_inventory WHERE user_id = ? AND item_id = ?', userId, itemId);
    if (existing) throw new Error('Item already owned');
    
    // 4. Deduct coins
    await run('UPDATE users SET coins = coins - ? WHERE id = ?', price, userId);
    
    // 5. Add items to inventory
    if (type === 'bundle' && shopItem.contains) {
        // Add the bundle itself
        await run('INSERT INTO user_inventory (user_id, item_id, type, is_equipped) VALUES (?, ?, ?, 0)', userId, itemId, 'bundle');
        
        // Add all contained items
        for (const containedId of shopItem.contains) {
            // Check if contained item is already owned (to avoid unique constraint error)
            const alreadyOwned = await get('SELECT * FROM user_inventory WHERE user_id = ? AND item_id = ?', userId, containedId);
            if (!alreadyOwned) {
                // Find the type of the contained item
                const containedItem = SHOP_DATA.find(i => i.id === containedId);
                if (containedItem) {
                    await run('INSERT INTO user_inventory (user_id, item_id, type, is_equipped) VALUES (?, ?, ?, 0)', userId, containedId, containedItem.type);
                }
            }
        }
    } else {
        // Single item purchase
        await run('INSERT INTO user_inventory (user_id, item_id, type, is_equipped) VALUES (?, ?, ?, 0)', userId, itemId, type);
    }
    
    // 6. Return updated user
    const updatedUser: any = await get('SELECT coins FROM users WHERE id = ?', userId);
    res.json({ success: true, coins: updatedUser.coins });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/inventory/equip', async (req, res) => {
  try {
    const { userId, type, value } = req.body;
    if (!userId || !type || !value) throw new Error('Missing fields');
    
    // Update user's equipped item in users table
    if (type === 'table') {
      await run('UPDATE users SET equipped_table = ? WHERE id = ?', value, userId);
    } else if (type === 'card') {
      await run('UPDATE users SET equipped_card = ? WHERE id = ?', value, userId);
    }
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/inventory/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const items = await new Promise((resolve, reject) => {
      (db as any).all('SELECT * FROM user_inventory WHERE user_id = ?', [userId], (err: any, rows: any) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    res.json(items);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- SOCKET.IO GAME LOOP ---

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('joinRoom', ({ roomId, username, userId, avatarId, mode }) => {
    socket.join(roomId);
    
    // Auto-create logic if room doesn't exist (Simplified Phase 3)
    let engine = roomManager.getRoom(roomId);
    if (!engine) {
       const res = roomManager.createRoom(username, userId, roomId, undefined, mode || 'standard'); // Force ID
       engine = res.engine;
       
       // CRITICAL FIX: Subscribe IO to Engine Updates for Public Rooms too
       engine.subscribe((state) => {
          io.to(roomId).emit('gameState', state);
       });
    } else {
       engine.addPlayer(username, false, userId, avatarId || 1);
    }

    // Send initial state
    socket.emit('gameState', engine.getState());
    // Note: The engine.addPlayer above triggers a broadcast via the subscription we just added (or existing one)
    // So we don't strictly need io.to(roomId).emit here, but it's fine.
  });

  socket.on('startBotGame', ({ username, userId, avatarId, mode }) => {
    // 1. Create a unique private room
    const roomId = `bot_match_${userId}_${Date.now()}`;
    const { engine } = roomManager.createRoom(username, userId, roomId, avatarId || 1, mode || 'standard');
    
    // CRITICAL FIX: Subscribe IO to Engine Updates
    // This ensures that when Bots play (via setTimeout), the state is broadcasted.
    // We only need to subscribe once per room creation.
    engine.subscribe((state) => {
        io.to(roomId).emit('gameState', state);
    });
    
    socket.join(roomId);

    // 2. Add 3 Bots immediately with random avatars (1-12)
    engine.addPlayer('Bot Alpha', true, undefined, Math.floor(Math.random() * 12) + 1);
    engine.addPlayer('Bot Beta', true, undefined, Math.floor(Math.random() * 12) + 1);
    engine.addPlayer('Bot Gamma', true, undefined, Math.floor(Math.random() * 12) + 1);

    // 3. Start Game immediately
    engine.startGame();

    // 4. Send state to client (Redundant due to subscribe, but safe for initial load)
    io.to(roomId).emit('gameState', engine.getState());
  });

  socket.on('action', ({ roomId, type, payload }) => {
     const engine = roomManager.getRoom(roomId);
     if (!engine) return;

     if (type === 'START_GAME') {
        engine.startGame();
     } else if (type === 'DRAW') {
        engine.drawCard(payload.userId);
     } else if (type === 'PLAY') {
        engine.playCard(payload.userId, payload.cardId, payload.color);
     } else if (type === 'ADD_BOT') {
        engine.addPlayer(`Bot ${Date.now().toString().slice(-4)}`, true, undefined, Math.floor(Math.random() * 12) + 1);
     } else if (type === 'PASS') {
        engine.passTurn(payload.userId);
     }

     // Broadcast new state
     io.to(roomId).emit('gameState', engine.getState());
  });

  // --- INDIVIDUAL EVENT HANDLERS (Matching Frontend) ---
  socket.on('playCard', ({ roomId, playerId, cardId, color, targetPlayerId }) => {
    const engine = roomManager.getRoom(roomId);
    if (engine) {
        engine.playCard(playerId, cardId, color, targetPlayerId);
        // State broadcast handled by subscription or we can emit here too
        // engine.subscribe handles it, but let's be safe
        io.to(roomId).emit('gameState', engine.getState());
    }
  });

  socket.on('drawCard', ({ roomId, playerId }) => {
    const engine = roomManager.getRoom(roomId);
    if (engine) {
        engine.drawCard(playerId);
        io.to(roomId).emit('gameState', engine.getState());
    }
  });

  socket.on('passTurn', ({ roomId, playerId }) => {
    const engine = roomManager.getRoom(roomId);
    if (engine) {
        engine.passTurn(playerId);
        io.to(roomId).emit('gameState', engine.getState());
    }
  });

  // --- EMOTE SYSTEM ---
  const emoteTimestamps = new Map<string, number>(); // Track last emote time per socket

  socket.on('sendEmote', ({ roomId, playerId, emoteId }) => {
    const now = Date.now();
    const lastEmoteTime = emoteTimestamps.get(socket.id) || 0;
    const cooldown = 2000; // 2 seconds

    // Rate limit check
    if (now - lastEmoteTime < cooldown) {
      socket.emit('emoteCooldown', { remaining: cooldown - (now - lastEmoteTime) });
      return;
    }

    // Validate emote ID (security check)
    const validEmotes = ['laugh', 'plus4', 'clown', 'cold', 'hurry', 'cool'];
    if (!validEmotes.includes(emoteId)) {
      return;
    }

    // Update timestamp
    emoteTimestamps.set(socket.id, now);

    // Broadcast to everyone in the room (including sender for feedback)
    io.to(roomId).emit('emoteReceived', { playerId, emoteId });
  });

  // --- UNO DECLARATION ---
  socket.on('sayUno', ({ roomId, playerId }) => {
    const engine = roomManager.getRoom(roomId);
    if (!engine) return;
    
    engine.sayUno(playerId);
    // State is automatically broadcast via engine.broadcast()
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    emoteTimestamps.delete(socket.id); // Cleanup
  });
});

// --- STATIC SERVING (PRODUCTION) ---

// Serve React Build
app.use(express.static(path.join(__dirname, '../dist')) as any);

// Handle React Routing (Catch-all)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start Server
httpServer.listen(PORT, () => {
  console.log(`\n🚀 SERVER RUNNING ON PORT ${PORT}`);
  console.log(`➜  Local:   http://localhost:${PORT}`);
  console.log(`➜  Network: http://0.0.0.0:${PORT}\n`);
});