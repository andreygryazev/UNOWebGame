import React, { useState } from 'react';
import { getAvatarUrl } from '../../utils/avatarHelper.ts';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface Props {
  currentAvatarId: number;
  onSelect: (id: number) => void;
}

export const AvatarSelector: React.FC<Props> = ({ currentAvatarId, onSelect }) => {
  const [loading, setLoading] = useState<number | null>(null);
  const avatarIds = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleSelect = async (id: number) => {
    setLoading(id);
    await onSelect(id);
    setLoading(null);
  };

  return (
    <div className="w-full">
      <h3 className="text-white text-lg font-bold mb-4 text-center">Choose Your Avatar</h3>
      <div className="grid grid-cols-4 gap-4">
        {avatarIds.map((id) => (
          <motion.button
            key={id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(id)}
            disabled={loading !== null}
            className={`
              relative aspect-square rounded-2xl overflow-hidden transition-all duration-200
              ${currentAvatarId === id ? 'ring-4 ring-purple-500 shadow-xl shadow-purple-500/50' : 'ring-2 ring-white/10'}
              ${loading === id ? 'opacity-50' : 'opacity-100'}
              hover:ring-purple-400 hover:shadow-lg
            `}
          >
            <img 
              src={getAvatarUrl(id)} 
              alt={`Avatar ${id}`}
              className="w-full h-full object-cover bg-slate-800"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23334155" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" font-size="40" text-anchor="middle" dy=".3em" fill="%23fff"%3E%3F%3C/text%3E%3C/svg%3E';
              }}
            />
            {loading === id && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
            {currentAvatarId === id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
