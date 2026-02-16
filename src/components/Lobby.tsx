import React, { useState, useEffect } from 'react';
import { User, GameState, GameMode } from '../types.ts';
import { ArrowLeft, Users, Plus, Copy, Check } from 'lucide-react';
import { Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  user: Omit<User, 'password_hash'>;
  onJoinGame: () => void;
  onBack: () => void;
  gameState: GameState | null;
  socket: Socket;
  selectedMode: GameMode;
}

export const Lobby: React.FC<Props> = ({ user, onJoinGame, onBack, gameState, socket, selectedMode }) => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleJoin = () => {
    if (roomCode.length !== 4) {
      setError("Room code must be 4 digits");
      return;
    }
    // Joining uses the room's existing mode, so we don't pass mode here
    socket.emit('joinRoom', { roomId: roomCode, username: user.username, userId: user.id });
  };

  const copyCode = () => {
    if (gameState) {
        navigator.clipboard.writeText(gameState.roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  // If we are already in a room (gameState exists)
  if (gameState) {
      const isHost = gameState.players[0]?.name === user.username;
      
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
             <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-2xl text-center relative overflow-hidden"
             >
                 {/* Background decoration */}
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                 <div className="mb-8 relative group cursor-pointer" onClick={copyCode}>
                    <p className="text-slate-400 text-xs uppercase tracking-widest mb-2 font-bold">Room Code</p>
                    <div className="text-6xl font-mono font-black text-white tracking-[0.2em] bg-slate-950/50 py-6 rounded-2xl border border-slate-800/50 flex items-center justify-center gap-4 transition-all group-hover:border-slate-700 group-hover:bg-slate-950">
                        {gameState.roomId}
                    </div>
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-600 group-hover:text-white transition-colors">
                        {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                    </div>
                    {copied && <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-green-500 text-xs font-bold">COPIED TO CLIPBOARD</div>}
                 </div>

                 <div className="space-y-3 mb-8">
                     <div className="flex justify-between items-end mb-2">
                        <p className="text-slate-400 text-xs font-bold uppercase">Players</p>
                        <p className="text-slate-500 text-xs font-mono">{gameState.players.length}/4</p>
                     </div>
                     
                     <div className="grid grid-cols-1 gap-2">
                        {[0, 1, 2, 3].map(i => {
                            const p = gameState.players[i];
                            return (
                                <motion.div 
                                    key={i}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`h-14 rounded-xl flex items-center px-4 border transition-all ${p ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-900/30 border-dashed border-slate-800'}`}
                                >
                                    {p ? (
                                        <>
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white mr-3 shadow-lg">
                                                {p.name.substring(0,1).toUpperCase()}
                                            </div>
                                            <span className="text-white font-bold">{p.name}</span>
                                            {p.isBot && <span className="ml-auto text-[10px] font-bold bg-slate-700 text-slate-300 px-2 py-1 rounded-full">BOT</span>}
                                            {i === 0 && !p.isBot && <span className="ml-auto text-[10px] font-bold bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full">HOST</span>}
                                        </>
                                    ) : (
                                        <span className="text-slate-700 font-medium text-sm flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-slate-800"></div> Empty Slot
                                        </span>
                                    )}
                                </motion.div>
                            );
                        })}
                     </div>
                 </div>

                 <div className="flex flex-col gap-3">
                     {isHost && (
                         <button 
                            onClick={() => socket.emit('action', { roomId: gameState.roomId, type: 'ADD_BOT', payload: {} })}
                            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-700"
                         >
                            <Users size={18} /> Add Bot
                         </button>
                     )}
                     <button 
                        onClick={() => socket.emit('action', { roomId: gameState.roomId, type: 'START_GAME', payload: {} })}
                        disabled={gameState.players.length < 2 || !isHost}
                        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-black rounded-xl text-xl transition-all shadow-lg shadow-green-900/20 disabled:shadow-none uppercase tracking-wider"
                     >
                         Start Match
                     </button>
                 </div>
             </motion.div>
        </div>
      );
  }

  // JOIN / CREATE SELECTION
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {error && (
            <motion.div 
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="absolute top-8 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-2xl font-bold z-50 flex items-center gap-2"
            >
                <span>⚠️</span> {error}
            </motion.div>
        )}
      </AnimatePresence>

      <button onClick={onBack} className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors font-bold z-10">
        <ArrowLeft size={20} /> BACK
      </button>

      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
         
         {/* Join Existing Card */}
         <motion.div 
            whileHover={{ y: -5 }}
            className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-800 flex flex-col items-center text-center group hover:border-blue-500/50 transition-colors"
         >
             <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform">
                <Users size={40} />
             </div>
             <h2 className="text-3xl font-black text-white mb-2 italic">JOIN GAME</h2>
             <p className="text-slate-400 mb-8">Enter a code to join an existing lobby</p>
             
             <div className="w-full relative">
                 <input 
                    value={roomCode}
                    onChange={e => setRoomCode(e.target.value.substring(0,4))}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-4 font-mono text-center text-2xl outline-none focus:border-blue-500 transition-colors placeholder:text-slate-800 tracking-[0.5em]"
                    placeholder="0000"
                 />
             </div>
             <button 
                onClick={handleJoin}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-blue-900/20"
             >
                JOIN LOBBY
             </button>
         </motion.div>

         {/* Create New Card */}
         <motion.div 
            whileHover={{ y: -5 }}
            className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-800 flex flex-col items-center text-center group hover:border-purple-500/50 transition-colors"
         >
             <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mb-6 text-purple-500 group-hover:scale-110 transition-transform">
                <Plus size={40} />
             </div>
             <h2 className="text-3xl font-black text-white mb-2 italic">CREATE LOBBY</h2>
             <p className="text-slate-400 mb-8">Host a new public game for others to join</p>
             
             <div className="flex-1 w-full flex flex-col justify-end gap-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">SELECTED MODE</div>
                <div className={`text-lg font-black mb-4 ${selectedMode === 'chaos' ? 'text-yellow-400' : 'text-blue-400'}`}>
                    {selectedMode.toUpperCase()}
                </div>

                <button 
                    onClick={() => {
                        const newCode = Math.floor(1000 + Math.random() * 9000).toString();
                        // Pass selectedMode when creating
                        socket.emit('joinRoom', { roomId: newCode, username: user.username, userId: user.id, mode: selectedMode });
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-purple-900/20"
                >
                    CREATE NEW ROOM
                </button>
             </div>
         </motion.div>

      </div>
    </div>
  );
};