import React from 'react';
import { CardColor } from '../types.ts';
import { CARD_COLORS_MAP } from '../constants';
import { Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onSelect: (color: CardColor) => void;
  onCancel: () => void;
}

export const WildColorModal: React.FC<Props> = ({ isOpen, onSelect, onCancel }) => {
  if (!isOpen) return null;

  const options = [CardColor.RED, CardColor.BLUE, CardColor.GREEN, CardColor.YELLOW];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold text-center mb-4 text-slate-800">Choose a Color</h3>
        <div className="grid grid-cols-2 gap-4">
          {options.map((color) => (
            <button
              key={color}
              onClick={() => onSelect(color)}
              className={`${CARD_COLORS_MAP[color]} w-24 h-24 rounded-full shadow-lg hover:scale-105 transition-transform ring-4 ring-offset-2 ring-transparent hover:ring-slate-300 flex items-center justify-center`}
            >
               <Check className={`w-12 h-12 ${color === CardColor.YELLOW ? 'text-black' : 'text-white'}`} />
            </button>
          ))}
        </div>
        <button 
            onClick={onCancel}
            className="mt-6 w-full py-2 text-sm text-slate-500 hover:text-slate-800"
        >
            Cancel
        </button>
      </div>
    </div>
  );
};