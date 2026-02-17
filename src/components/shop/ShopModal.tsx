import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Sparkles, Lock } from 'lucide-react';
import { SHOP_DATA, ShopItem } from '../../constants/shopData';
import { CardComponent } from '../game/CardComponent';
import { CardColor, CardValue } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userCoins: number;
  ownedItems: string[];
  onPurchase: (itemId: string, price: number) => void;
}

export const ShopModal: React.FC<Props> = ({ isOpen, onClose, userCoins, ownedItems, onPurchase }) => {
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'bundle' | 'table' | 'card'>('all');

  if (!isOpen) return null;

  const filteredItems = SHOP_DATA.filter(item => 
    filterType === 'all' || item.type === filterType
  );

  const isOwned = (itemId: string) => ownedItems.includes(itemId);
  const canAfford = (price: number) => userCoins >= price;

  const handlePurchase = (item: ShopItem) => {
    if (!isOwned(item.id) && canAfford(item.price)) {
      onPurchase(item.id, item.price);
    }
  };

  // Determine preview content (default to first bundle if nothing selected)
  const previewItem = selectedItem || SHOP_DATA[0];
  const previewTable = previewItem.preview.table || 'default';
  const previewCard = previewItem.preview.card || 'classic';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-[90vw] h-[85vh] max-w-7xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-6 border-b-2 border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-3xl font-black text-white">PREMIUM SHOP</h2>
              <p className="text-slate-400 text-sm">Unlock exclusive themes and card skins</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="bg-yellow-500/20 border border-yellow-500/50 px-6 py-2 rounded-full">
              <span className="text-yellow-400 font-bold text-lg">{userCoins} 🪙</span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Main Content: Split Pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Item List */}
          <div className="w-1/2 border-r-2 border-slate-700 flex flex-col">
            {/* Filter Tabs */}
            <div className="flex border-b border-slate-700 bg-slate-800/50">
              {[
                { key: 'all', label: 'All' },
                { key: 'bundle', label: 'Bundles' },
                { key: 'table', label: 'Tables' },
                { key: 'card', label: 'Cards' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilterType(key as any)}
                  className={`flex-1 py-3 text-sm font-bold transition-all ${
                    filterType === key 
                      ? 'bg-purple-600 text-white border-b-2 border-purple-400' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Item Grid */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredItems.map(item => {
                const owned = isOwned(item.id);
                const affordable = canAfford(item.price);

                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedItem(item)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedItem?.id === item.id
                        ? 'border-purple-500 bg-purple-900/30'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {item.type === 'bundle' && <Sparkles className="w-4 h-4 text-yellow-400" />}
                          <h3 className="text-white font-bold">{item.name}</h3>
                        </div>
                        <p className="text-slate-400 text-sm mb-2">{item.description}</p>
                        {item.contains && (
                          <div className="text-xs text-purple-400 mb-2">
                            Includes {item.contains.length} items
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-2">
                        <div className={`text-lg font-bold ${affordable ? 'text-yellow-400' : 'text-red-400'}`}>
                          {item.price} 🪙
                        </div>
                        {owned ? (
                          <span className="px-3 py-1 bg-green-600/30 border border-green-500 rounded-full text-green-400 text-xs font-bold">
                            OWNED
                          </span>
                        ) : !affordable ? (
                          <Lock className="w-5 h-5 text-red-400" />
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Live Preview */}
          <div className="w-1/2 bg-slate-800 flex flex-col">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-black text-white mb-1">LIVE PREVIEW</h3>
              <p className="text-slate-400 text-sm">See how it looks in-game</p>
            </div>

            {/* Preview Area */}
            <div className="flex-1 p-8 flex flex-col items-center justify-center">
              {/* Mini Game Board */}
              <div 
                className={`relative w-full max-w-md aspect-square rounded-3xl overflow-hidden bg-theme-${previewTable} shadow-2xl`}
              >
                {/* Center Card Display */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-6">
                    <div className="text-white font-black text-lg mb-4 bg-black/50 px-4 py-2 rounded-full">
                      {previewItem.name}
                    </div>
                    
                    {/* Sample Cards */}
                    <div className="flex gap-4 justify-center">
                      {/* Card Front */}
                      <div className="transform hover:scale-110 transition-transform">
                        <CardComponent 
                          card={{ 
                            id: 'preview-1', 
                            color: CardColor.RED, 
                            value: CardValue.SEVEN 
                          }}
                          skin={previewCard}
                        />
                      </div>
                      
                      {/* Card Front 2 */}
                      <div className="transform hover:scale-110 transition-transform">
                        <CardComponent 
                          card={{ 
                            id: 'preview-2', 
                            color: CardColor.BLUE, 
                            value: CardValue.WILD 
                          }}
                          skin={previewCard}
                        />
                      </div>
                    </div>

                    {/* Card Back */}
                    <div className="flex justify-center">
                      <div className="transform hover:scale-110 transition-transform">
                        <CardComponent 
                          card={{ 
                            id: 'preview-back', 
                            color: CardColor.WILD, 
                            value: CardValue.ZERO 
                          }}
                          hidden
                          skin={previewCard}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase Button */}
              {selectedItem && !isOwned(selectedItem.id) && (
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  onClick={() => handlePurchase(selectedItem)}
                  disabled={!canAfford(selectedItem.price)}
                  className={`mt-8 px-8 py-4 rounded-xl font-black text-lg shadow-lg transition-all ${
                    canAfford(selectedItem.price)
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {canAfford(selectedItem.price) 
                    ? `PURCHASE FOR ${selectedItem.price} 🪙`
                    : 'INSUFFICIENT COINS'
                  }
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
