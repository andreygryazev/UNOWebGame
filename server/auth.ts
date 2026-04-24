import { get, run } from './db.ts';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import type { User, AuthResponse } from '../src/types.ts';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// JWT Secret: MUST be set in production, fallback only in development
const isProd = process.env.NODE_ENV === 'production';

if (!process.env.JWT_SECRET && isProd) {
    console.error('❌ FATAL: JWT_SECRET is not set in environment variables. Server cannot start in production without it.');
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.warn('⚠️  WARNING: JWT_SECRET not set. Using insecure dev fallback. Set JWT_SECRET in .env.local for production.');
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-DO-NOT-USE-IN-PROD';

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

export const authenticateJWT = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};
