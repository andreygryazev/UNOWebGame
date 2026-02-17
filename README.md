# 🃏 UNOWebGame - Real-Time Multiplayer Card Game

A modern, full-stack UNO game built with React, Node.js & Socket.io - play with friends online or challenge bots offline!

## 🎮 How It Works

- Create or join a **lobby** with friends via multiplayer, or start a **bot match** solo.
- Play cards following standard **UNO rules** - match by color or number.
- Use **action cards** (Skip, Reverse, Draw 2, Wild, Wild Draw 4) to gain the upper hand.
- First player to empty their hand **wins** and earns coins.
- Spend coins in the **shop** on custom card skins & table backgrounds.

## ✨ Features

- 🌐 **Real-Time Multiplayer** - play with friends via Socket.io rooms
- 🤖 **Smart Bots** - single-player mode with intelligent AI opponents
- 🎴 **Full UNO Rules** - Draw 2, Skip, Reverse, Wild, Wild Draw 4, 7-0 swap & more
- 🛒 **Shop & Inventory** - earn coins and buy custom card skins & table backgrounds
- 👤 **Profile System** - track stats, MMR rating & customize your avatar
- 😎 **Emotes** - react during games with emote bubbles
- ⏱️ **Turn Timer** - keeps the game moving
- 🔊 **Sound Effects** - immersive SFX powered by Howler.js
- 🔐 **Auth System** - JWT-based login & registration with bcrypt
- 📱 **Responsive Design** - works on desktop and mobile

## 📋 Game Modes

| Mode | Description |
|------|-------------|
| **Solo vs Bots** | Practice offline against AI opponents |
| **Multiplayer** | Create/join lobbies and play with real players |

## 🔧 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React, TypeScript, Vite, TailwindCSS, Framer Motion |
| **Backend** | Node.js, Express, Socket.io, TypeScript |
| **Database** | SQLite (via sqlite3) |
| **Auth** | JWT + bcrypt |
| **Audio** | Howler.js |

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v16+
- **npm** or **yarn**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/andreygryazev/UNOWebGame.git
   cd UNOWebGame
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. *(Optional)* Create a `.env.local` in the root:
   ```
   PORT=3000
   ```

### Running Development

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

To expose on your local network:
```bash
npm run dev:host
```

### Building for Production

```bash
npm run build
npm start
```

## 📁 File Tree

```
UNO/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── server/
│   ├── index.ts          # Express + Socket.io server
│   ├── db.ts             # SQLite database setup
│   └── auth.ts           # JWT authentication
├── src/
│   ├── App.tsx            # Main app component
│   ├── index.tsx          # Entry point
│   ├── index.css          # Global styles
│   ├── types.ts           # TypeScript types
│   ├── components/
│   │   ├── game/          # In-game components
│   │   │   ├── GameTable.tsx
│   │   │   ├── CardComponent.tsx
│   │   │   ├── PlayerAvatar.tsx
│   │   │   ├── DirectionIndicator.tsx
│   │   │   ├── WildColorModal.tsx
│   │   │   ├── PlayerSelectModal.tsx
│   │   │   ├── GameOverModal.tsx
│   │   │   ├── UnoButton.tsx
│   │   │   ├── TurnTimer.tsx
│   │   │   ├── EmoteMenu.tsx
│   │   │   └── EmoteBubble.tsx
│   │   ├── menu/          # Menu & navigation screens
│   │   │   ├── Auth.tsx
│   │   │   ├── MainMenu.tsx
│   │   │   ├── ModeSelector.tsx
│   │   │   ├── Lobby.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── AvatarSelector.tsx
│   │   └── shop/          # Shop & inventory system
│   │       ├── ShopModal.tsx
│   │       └── InventoryModal.tsx
│   ├── services/          # Game logic & networking
│   │   ├── GameEngine.ts   # Core UNO game engine
│   │   ├── BotLogic.ts     # AI bot behavior
│   │   ├── RoomManager.ts  # Lobby management
│   │   ├── socket.ts       # Socket.io client
│   │   └── api.ts          # REST API client
│   ├── constants/          # Game constants
│   └── utils/              # Utility functions
└── public/
    ├── avatars/            # Player avatar images
    └── sfx/                # Sound effect files
```

## 🛠️ Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend + backend concurrently |
| `npm run dev:host` | Same as above, exposed on LAN |
| `npm run build` | Build frontend for production |
| `npm start` | Build & start production server |
| `npm run server` | Start backend only |
