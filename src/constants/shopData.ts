export interface ShopItem {
  id: string;
  type: 'table' | 'card' | 'bundle';
  name: string;
  description: string;
  price: number;
  contains?: string[]; // For bundles: IDs of items included
  preview: {
    table?: string; // CSS class or identifier
    card?: string; // CSS class or identifier
  };
}

export const SHOP_DATA: ShopItem[] = [
  // BUNDLES
  {
    id: 'bundle_casino',
    type: 'bundle',
    name: 'Casino Royale',
    description: 'Luxury red velvet table with elegant gold cards',
    price: 500,
    contains: ['table_casino', 'card_gold'],
    preview: {
      table: 'casino',
      card: 'gold'
    }
  },
  {
    id: 'bundle_cyber',
    type: 'bundle',
    name: 'Cyber City',
    description: 'Futuristic neon grid background with glowing card skins',
    price: 500,
    contains: ['table_cyber', 'card_neon'],
    preview: {
      table: 'cyber',
      card: 'neon'
    }
  },
  {
    id: 'bundle_midnight',
    type: 'bundle',
    name: 'Midnight Elite',
    description: 'Sophisticated black & gold table with premium card design',
    price: 500,
    contains: ['table_midnight', 'card_luxury'],
    preview: {
      table: 'midnight',
      card: 'luxury'
    }
  },
  {
    id: 'bundle_crystal',
    type: 'bundle',
    name: 'Crystal Caverns',
    description: 'Mystical cave with glowing geometric crystal cards',
    price: 600,
    contains: ['table_crystal', 'card_crystal'],
    preview: {
      table: 'crystal',
      card: 'crystal'
    }
  },

  // INDIVIDUAL TABLE SKINS
  {
    id: 'table_casino',
    type: 'table',
    name: 'Red Velvet Table',
    description: 'Luxurious casino-style red table',
    price: 300,
    preview: { table: 'casino' }
  },
  {
    id: 'table_cyber',
    type: 'table',
    name: 'Neon Grid Background',
    description: 'Electric neon grid pattern',
    price: 300,
    preview: { table: 'cyber' }
  },
  {
    id: 'table_midnight',
    type: 'table',
    name: 'Black & Gold Table',
    description: 'Elite midnight elegance',
    price: 300,
    preview: { table: 'midnight' }
  },
  {
    id: 'table_crystal',
    type: 'table',
    name: 'Crystal Cave Background',
    description: 'Deep blue cave with glowing crystals',
    price: 350,
    preview: { table: 'crystal' }
  },

  // INDIVIDUAL CARD SKINS
  {
    id: 'card_gold',
    type: 'card',
    name: 'Gold Card Skin',
    description: 'Gleaming golden card borders',
    price: 250,
    preview: { card: 'gold' }
  },
  {
    id: 'card_neon',
    type: 'card',
    name: 'Neon Card Skin',
    description: 'Vibrant neon glow effect',
    price: 250,
    preview: { card: 'neon' }
  },
  {
    id: 'card_luxury',
    type: 'card',
    name: 'Black & Gold Card Skin',
    description: 'Premium black and gold design',
    price: 250,
    preview: { card: 'luxury' }
  },
  {
    id: 'card_crystal',
    type: 'card',
    name: 'Crystal Card Skin',
    description: 'Sharp geometric crystal look with cyan glow',
    price: 300,
    preview: { card: 'crystal' }
  }
];
