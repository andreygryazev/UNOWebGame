import { AuthResponse, User } from '../types.ts';

// Always use relative path — Vite proxy handles /api → localhost:3000 in dev,
// and in production the Express server serves both static files and API.
const BASE_URL = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API Request Failed');
  return data;
}

export interface InventoryItem {
  id: number;
  user_id: number;
  item_id: string;
  type: string;
  is_equipped: boolean;
}

export interface BuyResponse {
  success: boolean;
  coins: number;
}

export interface EquipResponse {
  success: boolean;
}

export const api = {
  // Auth
  login: (username: string, password: string) => 
    request<AuthResponse>('/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
    
  register: (username: string, password: string) => 
    request<AuthResponse>('/register', { method: 'POST', body: JSON.stringify({ username, password }) }),

  // User
  getUser: (id: number) =>
    request<User>(`/user/${id}`),

  // Inventory
  getInventory: (userId: number) =>
    request<InventoryItem[]>(`/inventory/${userId}`),

  // Shop
  buyItem: (userId: number, itemId: string) =>
    request<BuyResponse>('/shop/buy', { 
      method: 'POST', 
      body: JSON.stringify({ userId, itemId }) 
    }),

  // Equip
  equipItem: (userId: number, type: 'table' | 'card', value: string) =>
    request<EquipResponse>('/inventory/equip', { 
      method: 'POST', 
      body: JSON.stringify({ userId, type, value }) 
    }),
};
