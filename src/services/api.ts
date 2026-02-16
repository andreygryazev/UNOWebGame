import { AuthResponse, User } from '../types.ts';

// Vite standard env check
const isProd = import.meta.env.MODE === 'production';
const BASE_URL = isProd ? '/api' : 'http://localhost:3000/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API Request Failed');
  return data;
}

export const api = {
  login: (username: string, password: string) => 
    request<AuthResponse>('/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
    
  register: (username: string, password: string) => 
    request<AuthResponse>('/register', { method: 'POST', body: JSON.stringify({ username, password }) }),

  getUser: (id: number) =>
    request<User>(`/user/${id}`)
};
