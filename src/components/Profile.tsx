import React from 'react';
import { User } from '../types.ts';
import { ArrowLeft, Trophy, BarChart2 } from 'lucide-react';
import { api } from '../services/api.ts';
import { motion } from 'framer-motion';
import { AvatarSelector } from './AvatarSelector.tsx';
import { getAvatarUrl } from '../utils/avatarHelper.ts';

interface Props {
  user: Omit<User, 'password_hash'>;
  onBack: () => void;
}

export const Profile: React.FC<Props> = ({ user: initialUser, onBack }) => {
  const [stats, setStats] = React.useState(initialUser);

  React.useEffect(() => {
     api.getUser(initialUser.id).then(user => {
         const { password_hash, ...safe } = user;
         setStats(safe);
     }).catch(console.error);
  }, [initialUser.id]);

  const handleAvatarSelect = async (avatarId: number) => {
    try {
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: stats.id, avatarId })
      });
      
      if (!response.ok) throw new Error('Failed to update avatar');
      
      setStats({ ...stats, avatar_id: avatarId });
    } catch (error) {
      console.error('Avatar update failed:', error);
    }
  };

  const winRate = stats.wins + stats.losses > 0 
    ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
       <button onClick={onBack} className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 z-10">
        <ArrowLeft size={20} /> Back
      </button>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-2xl w-full"
      >
         <div className="text-center mb-8">
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-24 h-24 mx-auto rounded-full flex items-center justify-center shadow-2xl ring-4 ring-slate-900 mb-4 overflow-hidden bg-slate-800"
            >
                <img 
                  src={getAvatarUrl(stats.avatar_id || 1)} 
                  alt={stats.username}
                  className="w-full h-full object-cover"
                />
            </motion.div>
            <h1 className="text-3xl font-bold text-white">{stats.username}</h1>
            <p className="text-slate-400 text-sm mt-1">Player ID: #{stats.id.toString().padStart(4, '0')}</p>
         </div>

         {/* Avatar Selector */}
         <div className="mb-8 bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-800">
           <AvatarSelector 
             currentAvatarId={stats.avatar_id || 1} 
             onSelect={handleAvatarSelect}
           />
         </div>

         <div className="grid grid-cols-2 gap-4">
             <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center shadow-xl"
             >
                 <div className="flex justify-center mb-2 text-yellow-500"><Trophy /></div>
                 <div className="text-3xl font-black text-white">{stats.mmr}</div>
                 <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">MMR Rating</div>
             </motion.div>

             <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center shadow-xl"
             >
                 <div className="flex justify-center mb-2 text-blue-500"><BarChart2 /></div>
                 <div className="text-3xl font-black text-white">{winRate}%</div>
                 <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Win Rate</div>
             </motion.div>

             <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-green-900/20 p-4 rounded-xl border border-green-500/20 flex items-center justify-between px-6"
             >
                 <span className="text-green-400 font-bold">WINS</span>
                 <span className="text-2xl font-mono text-white">{stats.wins}</span>
             </motion.div>

             <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-red-900/20 p-4 rounded-xl border border-red-500/20 flex items-center justify-between px-6"
             >
                 <span className="text-red-400 font-bold">LOSSES</span>
                 <span className="text-2xl font-mono text-white">{stats.losses}</span>
             </motion.div>
         </div>
      </motion.div>
    </div>
  );
};