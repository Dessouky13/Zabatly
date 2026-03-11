import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db/pool.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        plan: 'free' | 'basic' | 'premium';
      };
    }
  }
}

/**
 * Middleware: verifies custom JWT from Authorization header.
 * Sets req.user on success.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as { sub: string; email: string };

    // Fetch active subscription plan
    const { rows } = await pool.query<{ plan: string }>(
      `SELECT plan FROM subscriptions WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
      [payload.sub]
    );

    req.user = {
      id: payload.sub,
      email: payload.email,
      plan: (rows[0]?.plan as 'free' | 'basic' | 'premium') ?? 'free',
    };

    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
