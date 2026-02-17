import { get, run } from './db.ts';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { User, AuthResponse } from '../src/types.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export const register = async (username: string, password: string): Promise<AuthResponse> => {
    // Check existing
    const existing = await get('SELECT * FROM users WHERE username = ?', username);
    if (existing) throw new Error('Username taken');

    const hash = await bcrypt.hash(password, 10);
    const info = await run('INSERT INTO users (username, password_hash) VALUES (?, ?)', username, hash);
    
    const user = await get('SELECT * FROM users WHERE id = ?', info.lastID) as User;
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);

    const { password_hash, ...safeUser } = user;
    return { token, user: safeUser };
};

export const login = async (username: string, password: string): Promise<AuthResponse> => {
    const user = await get('SELECT * FROM users WHERE username = ?', username) as User;
    if (!user) throw new Error('Invalid credentials');

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new Error('Invalid credentials');

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    const { password_hash, ...safeUser } = user;
    return { token, user: safeUser };
};
