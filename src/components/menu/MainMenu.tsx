import React, { useState } from 'react';
import { User } from '../../types.ts';
import { Play, Users, User as UserIcon, LogOut, ShoppingCart, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAvatarUrl } from '../../utils/avatarHelper.ts';

interface Props {
  user: Omit<User, 'password_hash'>;
  onLogout: () => void;
  onNavigate: (view: 'lobby' | 'profile' | 'bot-game' | 'shop' | 'inventory') => void;
  onCoinsUpdate: (coins: number) => void;
}

const FloatingCard = ({ delay, x, y, rotate, color }: any) => (
  <motion.div
    initial={{ x, y, rotate, opacity: 0 }}
    animate={{ 
      y: [y, y - 20, y],
      rotate: [rotate, rotate + 5, rotate - 5, rotate],
      opacity: 0.1
    }}
    transition={{ 
      duration: 5, 
      delay, 
      repeat: Infinity, 
      repeatType: "reverse" 
    }}
    className={`absolute w-32 h-48 rounded-xl ${color} shadow-2xl pointer-events-none`}
  />
);

export const MainMenu: React.FC<Props> = ({ user, onLogout, onNavigate, onCoinsUpdate }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingCard delay={0} x={100} y={100} rotate={-15} color="bg-red-500" />
        <FloatingCard delay={1} x={window.innerWidth - 200} y={200} rotate={15} color="bg-blue-500" />
        <FloatingCard delay={2} x={300} y={window.innerHeight - 200} rotate={-5} color="bg-green-500" />
        <FloatingCard delay={1.5} x={window.innerWidth - 400} y={100} rotate={10} color="bg-yellow-500" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        
        {/* User Stats Summary */}
        <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-2xl flex items-center justify-between"
        >
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg ring-2 ring-blue-500/20 overflow-hidden bg-slate-800">
                    <img 
                      src={getAvatarUrl(user.avatar_id || 1)} 
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                </div>
                <div>
                    <div className="text-white font-bold text-xl">{user.username}</div>
                    <div className="text-yellow-400 text-sm font-bold flex items-center gap-1">
                        <span className="text-lg">🪙</span> {user.coins || 0} Coins
                    </div>
                </div>
            </div>
            <button onClick={onLogout} className="text-red-400 hover:text-red-300 p-2 hover:bg-red-950/30 rounded-full transition-colors">
                <LogOut size={20} />
            </button>
        </motion.div>

        {/* Action Buttons */}
        <div className="grid gap-4">
            <motion.button 
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('lobby')}
                className="group relative overflow-hidden h-28 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl flex items-center px-8 shadow-xl hover:shadow-blue-500/20 border border-blue-400/20"
            >
                <div className="bg-white/10 p-4 rounded-full mr-6 group-hover:bg-white/20 transition-colors">
                    <Users className="text-white" size={32} />
                </div>
                <div className="text-left relative z-10">
                    <h3 className="text-2xl font-black text-white italic tracking-wider">PLAY ONLINE</h3>
                    <p className="text-blue-100 text-sm font-medium">Join a room or create a lobby</p>
                </div>
                <Users className="absolute -right-8 -bottom-8 text-white/5 group-hover:text-white/10 transition-colors transform group-hover:scale-110 duration-500" size={140} />
            </motion.button>

            <motion.button 
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('bot-game')}
                className="group relative overflow-hidden h-28 bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl flex items-center px-8 shadow-xl hover:shadow-purple-500/20 border border-purple-400/20"
            >
                <div className="bg-white/10 p-4 rounded-full mr-6 group-hover:bg-white/20 transition-colors">
                    <Play className="text-white" size={32} />
                </div>
                <div className="text-left relative z-10">
                    <h3 className="text-2xl font-black text-white italic tracking-wider">VS BOTS</h3>
                    <p className="text-purple-100 text-sm font-medium">Instant match against AI</p>
                </div>
                 <Play className="absolute -right-8 -bottom-8 text-white/5 group-hover:text-white/10 transition-colors transform group-hover:scale-110 duration-500" size={140} />
            </motion.button>

            {/* SHOP BUTTON */}
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('shop')}
                className="group h-16 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-xl flex items-center px-8 shadow-lg hover:shadow-yellow-500/30 transition-all border border-yellow-400/30"
            >
                <ShoppingCart className="text-white mr-4" size={24} />
                <span className="text-white font-black text-lg tracking-wider">SHOP</span>
            </motion.button>

            {/* INVENTORY BUTTON */}
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('inventory')}
                className="group h-16 bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-xl flex items-center px-8 shadow-lg hover:shadow-cyan-500/30 transition-all border border-cyan-400/30"
            >
                <Package className="text-white mr-4" size={24} />
                <span className="text-white font-black text-lg tracking-wider">INVENTORY</span>
            </motion.button>

             <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('profile')}
                className="group h-16 bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl flex items-center px-8 hover:bg-slate-800 hover:border-slate-600 transition-all"
            >
                <UserIcon className="text-slate-400 mr-4 group-hover:text-white transition-colors" size={24} />
                <span className="text-slate-300 font-bold text-lg group-hover:text-white transition-colors">View Profile</span>
            </motion.button>
        </div>
      </motion.div>
    </div>
  );
};