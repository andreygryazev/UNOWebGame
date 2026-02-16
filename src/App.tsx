import React, { useState, useEffect } from 'react';
import { api } from './services/api.ts';
import { socket, connectSocket } from './services/socket.ts';
import { User, GameState, GameMode } from './types.ts';

// Components
import { Auth } from './components/Auth.tsx';
import { MainMenu } from './components/MainMenu.tsx';
import { Lobby } from './components/Lobby.tsx';
import { Profile } from './components/Profile.tsx';
import { GameTable } from './components/GameTable.tsx'; 
import { ModeSelector } from './components/ModeSelector.tsx';
import { ShopModal } from './components/ShopModal.tsx';
import { InventoryModal } from './components/InventoryModal.tsx';

type ViewState = 'AUTH' | 'MENU' | 'LOBBY' | 'PROFILE' | 'GAME';

export default function App() {
  // Core State
  const [user, setUser] = useState<Omit<User, 'password_hash'> | null>(null);
  const [view, setView] = useState<ViewState>('AUTH');
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Mode Selection
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [pendingView, setPendingView] = useState<'bot' | 'lobby' | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode>('standard');

  // Shop & Inventory
  const [showShop, setShowShop] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [equippedTable, setEquippedTable] = useState<string>('default');
  const [equippedCard, setEquippedCard] = useState<string>('classic');

  // Auth State
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Socket: Game State Updates
  useEffect(() => {
    socket.on('gameState', (state: GameState) => {
      setGameState(state);
      if (state.status === 'PLAYING' && view !== 'GAME') {
        setView('GAME');
      }
    });
    
    return () => {
      socket.off('gameState');
    };
  }, [view]);

  // Load Inventory on Login
  useEffect(() => {
    if (user) {
      loadInventory();
      setEquippedTable(user.equipped_table || 'default');
      setEquippedCard(user.equipped_card || 'classic');
    }
  }, [user]);

  const loadInventory = async () => {
    if (!user) return;
    try {
      const response = await fetch(`http://localhost:3000/api/inventory/${user.id}`);
      const items = await response.json();
      setOwnedItems(items.map((item: any) => item.item_id));
    } catch (err) {
      console.error('Failed to load inventory:', err);
    }
  };

  const handleAuth = async (username: string, password: string, isLogin: boolean) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const response = isLogin 
        ? await api.login(username, password)
        : await api.register(username, password);
      
      setUser(response.user);
      connectSocket();
      setView('MENU');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('AUTH');
    setGameState(null);
    socket.disconnect();
  };

  const handlePurchase = async (itemId: string, price: number) => {
    if (!user) return;
    try {
      const { SHOP_DATA } = await import('./constants/shopData');
      const item = SHOP_DATA.find((i: any) => i.id === itemId);
      if (!item) throw new Error('Item not found');

      const response = await fetch('http://localhost:3000/api/shop/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, itemId, type: item.type, price })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      // Update owned items
      const newOwned = [...ownedItems, itemId];
      if (item.contains) {
        newOwned.push(...item.contains);
      }
      setOwnedItems(newOwned);

      // Update coins
      setUser({ ...user, coins: data.coins });
      
      alert(`✅ Successfully purchased ${item.name}!`);
    } catch (err: any) {
      alert(`❌ Purchase failed: ${err.message}`);
    }
  };

  const handleEquip = async (type: 'table' | 'card', value: string) => {
    if (!user) return;
    try {
      const response = await fetch('http://localhost:3000/api/inventory/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, type, value })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      // Update local state
      if (type === 'table') {
        setEquippedTable(value);
        setUser({ ...user, equipped_table: value });
      } else {
        setEquippedCard(value);
        setUser({ ...user, equipped_card: value });
      }
    } catch (err: any) {
      alert(`❌ Equip failed: ${err.message}`);
    }
  };

  const handleGameAction = (action: string, data?: any) => {
    if (!gameState || !user) return;
    
    switch(action) {
      case 'PLAY':
        socket.emit('playCard', { 
          roomId: gameState.roomId,
          playerId: user.id.toString(),
          cardId: data.cardId,
          color: data.color,
          targetPlayerId: data.targetPlayerId
        });
        break;
      case 'DRAW':
        socket.emit('drawCard', { roomId: gameState.roomId, playerId: user.id.toString()});
        break;
      case 'PASS':
        socket.emit('passTurn', { roomId: gameState.roomId, playerId: user.id.toString()});
        break;
    }
  };

  // AUTH VIEW
  if (!user || view === 'AUTH') {
    return (
      <Auth 
        onLogin={(u, p) => handleAuth(u, p, true)}
        onRegister={(u, p) => handleAuth(u, p, false)}
        loading={authLoading}
        error={authError}
      />
    );
  }

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      {/* MENU */}
      {view === 'MENU' && (
        <MainMenu 
          user={user}
          onNavigate={(target) => {
            if (target === 'lobby') {
              setPendingView('lobby');
              setShowModeSelector(true);
            } else if (target === 'bot-game') {
              setPendingView('bot');
              setShowModeSelector(true);
            } else if (target === 'profile') {
              setView('PROFILE');
            } else if (target === 'shop') {
              setShowShop(true);
            } else if (target === 'inventory') {
              setShowInventory(true);
            }
          }}
          onLogout={handleLogout}
          onCoinsUpdate={async (newCoins) => {
            setUser({ ...user, coins: newCoins });
          }}
        />
      )}
      
      {/* LOBBY */}
      {view === 'LOBBY' && (
        <Lobby 
          user={user}
          onBack={() => setView('MENU')}
          socket={socket}
          gameState={gameState}
          selectedMode={selectedMode}
          onJoinGame={() => {}}
        />
      )}
      
      {/* PROFILE */}
      {view === 'PROFILE' && (
        <Profile 
          user={user}
          onBack={() => setView('MENU')}
        />
      )}
      
      {/* GAME */}
      {view === 'GAME' && gameState && (
        <GameTable 
          gameState={gameState}
          myPlayerId={user.id.toString()}
          onPlayCard={(cardId, color, targetPlayerId) => handleGameAction('PLAY', { cardId, color, targetPlayerId })}
          onDrawCard={() => handleGameAction('DRAW')}
          onPassTurn={() => handleGameAction('PASS')}
          onBackToMenu={() => { setView('MENU'); setGameState(null); }}
          equippedTable={equippedTable}
          equippedCard={equippedCard}
        />
      )}

      {/* MODE SELECTOR MODAL */}
      {showModeSelector && (
        <ModeSelector 
          onSelect={(mode) => {
            setSelectedMode(mode);
            setShowModeSelector(false);
            
            if (pendingView === 'bot') {
              socket.emit('startBotGame', { 
                username: user.username, 
                userId: user.id,
                avatarId: user.avatar_id,
                mode
              });
              setView('GAME');
            } else if (pendingView === 'lobby') {
              setView('LOBBY');
            }
            
            setPendingView(null);
          }}
          onBack={() => {
            setShowModeSelector(false);
            setPendingView(null);
          }}
        />
      )}

      {/* SHOP MODAL */}
      <ShopModal 
        isOpen={showShop}
        onClose={() => setShowShop(false)}
        userCoins={user.coins || 0}
        ownedItems={ownedItems}
        onPurchase={handlePurchase}
      />

      {/* INVENTORY MODAL */}
      <InventoryModal 
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
        ownedItems={ownedItems}
        equippedTable={equippedTable}
        equippedCard={equippedCard}
        onEquip={handleEquip}
      />
    </div>
  );
}