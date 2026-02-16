# UNO Clone Universal

A modern, real-time multiplayer UNO game built with React, Vite, Node.js, Socket.io, and SQLite.

## Features

- **Real-time Multiplayer**: Play with friends or bots.
- **Bot Mode**: Single-player mode with intelligent bots.
- **Game Logic**: Full UNO rules implementation (Draw 2, Wild, Skip, Reverse, etc.).
- **Shop & Inventory**: Earn coins by winning games and buy custom card skins and table backgrounds.
- **Profile System**: Track stats, MMR, and customize your avatar.
- **Responsive Design**: Works on desktop and mobile.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express, Socket.io, TypeScript
- **Database**: SQLite
- **State Management**: React State + Socket.io Events

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd uno-clone-universal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup Environment:
   Create a `.env` file in the root directory (optional, uses defaults otherwise):
   ```
   PORT=3000
   ```

### Running Development

To run both the frontend (Vite) and backend (Server) concurrently:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Building for Production

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Folder Structure

- `src/`: Frontend React source code
- `server/`: Backend Node.js source code
- `public/`: Static assets
- `dist/`: Build output (generated)


