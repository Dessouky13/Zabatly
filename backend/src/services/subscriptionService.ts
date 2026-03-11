/**
 * Subscription Service — manages plan activations, usage tracking, and limits.
 */

import pool from '../db/pool.js';

export type Plan = 'free' | 'basic' | 'premium';

/**
 * Activates or upgrades a user's subscription after successful payment.
 */
export async function activateSubscription(userId: string, plan: Plan): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  // Deactivate any existing active subscription
  await pool.query(
    `UPDATE subscriptions SET status = 'cancelled' WHERE user_id = $1 AND status = 'active'`,
    [userId]
  );

  // Create new subscription
  await pool.query(
    `INSERT INTO subscriptions (user_id, plan, status, started_at, expires_at, boards_used, redesigns_used)
     VALUES ($1, $2, 'active', $3, $4, 0, 0)`,
    [userId, plan, now, expiresAt]
  );
}

/**
 * Ensures every user has at least a free subscription record.
 */
export async function ensureFreePlan(userId: string): Promise<void> {
  const { rows } = await pool.query(
    'SELECT id FROM subscriptions WHERE user_id = $1 LIMIT 1',
    [userId]
  );

  if (rows.length === 0) {
    await pool.query(
      `INSERT INTO subscriptions (user_id, plan, status, started_at, boards_used, redesigns_used)
       VALUES ($1, 'free', 'active', NOW(), 0, 0)`,
      [userId]
    );
  }
}

/**
 * Increments mood board usage counter via stored procedure.
 */
export async function incrementBoardUsage(userId: string): Promise<void> {
  await pool.query('SELECT increment_boards_used($1)', [userId]);
}

/**
 * Increments room redesign usage counter via stored procedure.
 */
export async function incrementRedesignUsage(userId: string): Promise<void> {
  await pool.query('SELECT increment_redesigns_used($1)', [userId]);
}

/**
 * Returns current subscription and usage data for a user.
 */
export async function getUsage(userId: string) {
  const { rows } = await pool.query<{
    plan: string;
    status: string;
    started_at: Date | null;
    expires_at: Date | null;
    boards_used: number;
    redesigns_used: number;
  }>(
    `SELECT plan, status, started_at, expires_at, boards_used, redesigns_used
     FROM subscriptions
     WHERE user_id = $1 AND status = 'active'
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );

  const sub = rows[0];
  const plan = (sub?.plan as Plan) || 'free';
  const LIMITS = {
    free:    { boards: 2,  redesigns: 1  },
    basic:   { boards: 10, redesigns: 5  },
    premium: { boards: -1, redesigns: -1 },
  };

  return {
    plan,
    status: sub?.status || 'active',
    started_at: sub?.started_at,
    expires_at: sub?.expires_at,
    boards_used: sub?.boards_used ?? 0,
    boards_limit: LIMITS[plan].boards,
    redesigns_used: sub?.redesigns_used ?? 0,
    redesigns_limit: LIMITS[plan].redesigns,
  };
}
