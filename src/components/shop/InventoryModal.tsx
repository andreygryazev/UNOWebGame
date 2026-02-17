import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Package, Image, CreditCard, RotateCcw } from 'lucide-react';
import { SHOP_DATA } from '../../constants/shopData';
import { CardComponent } from '../game/CardComponent';
import { CardColor, CardValue } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ownedItems: string[];
  equippedTable: string;
  equippedCard: string;
  onEquip: (type: 'table' | 'card', itemId: string) => void;
}

export const InventoryModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  ownedItems, 
  equippedTable, 
  equippedCard,
  onEquip 
}) => {
  const [activeTab, setActiveTab] = useState<'tables' | 'cards' | 'bundles'>('tables');

  if (!isOpen) return null;

  const ownedTables = SHOP_DATA.filter(item => 
    item.type === 'table' && ownedItems.includes(item.id)
  );

  const ownedCards = SHOP_DATA.filter(item => 
    item.type === 'card' && ownedItems.includes(item.id)
  );

  const ownedBundles = SHOP_DATA.filter(item => 
    item.type === 'bundle' && ownedItems.includes(item.id)
  );

  const handleResetToClassic = () => {
    onEquip('table', 'default');
    onEquip('card', 'classic');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-[85vw] h-[80vh] max-w-6xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-6 border-b-2 border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-3xl font-black text-white">MY INVENTORY</h2>
              <p className="text-slate-400 text-sm">Manage your collection</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleResetToClassic}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Classic
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-800/50">
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all ${
              activeTab === 'tables'
                ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Image className="w-5 h-5" />
            Table Skins ({ownedTables.length + 1})
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all ${
              activeTab === 'cards'
                ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            Card Skins ({ownedCards.length + 1})
          </button>
          <button
            onClick={() => setActiveTab('bundles')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all ${
              activeTab === 'bundles'
                ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Package className="w-5 h-5" />
            Bundles ({ownedBundles.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* TABLES TAB */}
          {activeTab === 'tables' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {/* Classic Table (Always Available) */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  equippedTable === 'default'
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
                onClick={() => onEquip('table', 'default')}
              >
                <div className="w-full aspect-square rounded-lg bg-theme-default mb-4"></div>
                <h3 className="text-white font-bold text-center">Classic Table</h3>
                {equippedTable === 'default' && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600 rounded-full text-xs font-bold text-white">
                    EQUIPPED
                  </div>
                )}
              </motion.div>

              {/* Owned Tables */}
              {ownedTables.map(item => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    equippedTable === item.preview.table
                      ? 'border-blue-500 bg-blue-900/30'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                  onClick={() => onEquip('table', item.preview.table!)}
                >
                  <div className={`w-full aspect-square rounded-lg bg-theme-${item.preview.table} mb-4`}></div>
                  <h3 className="text-white font-bold text-center">{item.name}</h3>
                  {equippedTable === item.preview.table && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600 rounded-full text-xs font-bold text-white">
                      EQUIPPED
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* CARDS TAB */}
          {activeTab === 'cards' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Classic Card (Always Available) */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center ${
                  equippedCard === 'classic'
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
                onClick={() => onEquip('card', 'classic')}
              >
                <CardComponent 
                  card={{ id: 'preview', color: CardColor.RED, value: CardValue.SEVEN }}
                  skin="classic"
                />
                <h3 className="text-white font-bold text-center mt-4">Classic</h3>
                {equippedCard === 'classic' && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600 rounded-full text-xs font-bold text-white">
                    EQUIPPED
                  </div>
                )}
              </motion.div>

              {/* Owned Card Skins */}
              {ownedCards.map(item => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center ${
                    equippedCard === item.preview.card
                      ? 'border-blue-500 bg-blue-900/30'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                  onClick={() => onEquip('card', item.preview.card!)}
                >
                  <CardComponent 
                    card={{ id: 'preview', color: CardColor.BLUE, value: CardValue.REVERSE }}
                    skin={item.preview.card}
                  />
                  <h3 className="text-white font-bold text-center mt-4 text-sm">{item.name.replace(' Card Skin', '')}</h3>
                  {equippedCard === item.preview.card && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600 rounded-full text-xs font-bold text-white">
                      EQUIPPED
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* BUNDLES TAB */}
          {activeTab === 'bundles' && (
            <div className="space-y-4">
              {ownedBundles.length === 0 ? (
                <div className="text-center py-20">
                  <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">No bundles purchased yet</p>
                  <p className="text-slate-500 text-sm">Visit the shop to get started!</p>
                </div>
              ) : (
                ownedBundles.map(bundle => (
                  <div key={bundle.id} className="p-6 rounded-xl border-2 border-slate-700 bg-slate-800/50">
                    <h3 className="text-white font-bold text-xl mb-2">{bundle.name}</h3>
                    <p className="text-slate-400 mb-4">{bundle.description}</p>
                    <div className="flex gap-4">
                      {bundle.contains?.map(itemId => {
                        const item = SHOP_DATA.find(i => i.id === itemId);
                        return item ? (
                          <div key={itemId} className="px-3 py-1 bg-purple-600/30 border border-purple-500 rounded-full text-purple-300 text-sm">
                            {item.name}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
