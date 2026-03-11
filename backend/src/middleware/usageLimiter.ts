import type { Request, Response, NextFunction } from 'express';
import pool from '../db/pool.js';

// Plan limits configuration
const PLAN_LIMITS = {
  free:    { boards: 2,  redesigns: 1  },
  basic:   { boards: 10, redesigns: 5  },
  premium: { boards: -1, redesigns: -1 }, // -1 = unlimited
} as const;

/**
 * Middleware: checks if user has remaining mood board quota.
 * Must run after requireAuth middleware.
 */
export async function checkBoardLimit(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user?.id;
  const plan = req.user?.plan || 'free';
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const limits = PLAN_LIMITS[plan];
  if (limits.boards === -1) { next(); return; } // unlimited

  const { rows } = await pool.query<{ boards_used: number }>(
    `SELECT boards_used FROM subscriptions WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );

  const used = rows[0]?.boards_used ?? 0;
  if (used >= limits.boards) {
    res.status(403).json({
      error: 'Mood board limit reached for your plan.',
      code: 'LIMIT_REACHED',
      used,
      limit: limits.boards,
      upgradeUrl: '/pricing',
    });
    return;
  }

  next();
}

/**
 * Middleware: checks if user has remaining room redesign quota.
 */
export async function checkRedesignLimit(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user?.id;
  const plan = req.user?.plan || 'free';
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const limits = PLAN_LIMITS[plan];
  if (limits.redesigns === -1) { next(); return; }

  const { rows } = await pool.query<{ redesigns_used: number }>(
    `SELECT redesigns_used FROM subscriptions WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );

  const used = rows[0]?.redesigns_used ?? 0;
  if (used >= limits.redesigns) {
    res.status(403).json({
      error: 'Room redesign limit reached for your plan.',
      code: 'LIMIT_REACHED',
      used,
      limit: limits.redesigns,
      upgradeUrl: '/pricing',
    });
    return;
  }

  next();
}
