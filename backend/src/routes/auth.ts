/**
 * Auth Routes
 * POST /api/auth/register
 * POST /api/auth/login
 * POST /api/auth/logout
 * GET  /api/auth/me
 * POST /api/auth/forgot-password
 * POST /api/auth/reset-password
 */

import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { authLimiter } from '../middleware/rateLimiter.js';
import { requireAuth } from '../middleware/auth.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { ensureFreePlan } from '../services/subscriptionService.js';
import pool from '../db/pool.js';

const router = Router();

// Input validation schemas
const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  language: z.enum(['en', 'ar']).default('en'),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const EmailSchema = z.object({
  email: z.string().email(),
});

const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

function signToken(userId: string, email: string): string {
  return jwt.sign(
    { sub: userId, email },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
}

// ─── POST /register ──────────────────────────────────────────────────────────
router.post('/register', authLimiter, async (req: Request, res: Response): Promise<void> => {
  const result = RegisterSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
    return;
  }

  const { email, password, name, language } = result.data;

  // Check if email already exists
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    res.status(409).json({ error: 'An account with this email already exists.' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO users (email, name, language, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [email, name, language, passwordHash]
  );
  const userId = rows[0].id;

  // Create free plan subscription
  await ensureFreePlan(userId);

  // Send welcome email (non-blocking)
  sendWelcomeEmail(email, name).catch((err) =>
    console.error('[auth] Failed to send welcome email:', err)
  );

  const token = signToken(userId, email);
  res.status(201).json({
    token,
    user: { id: userId, email, name },
    message: 'Account created successfully.',
  });
});

// ─── POST /login ─────────────────────────────────────────────────────────────
router.post('/login', authLimiter, async (req: Request, res: Response): Promise<void> => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
    return;
  }

  const { email, password } = result.data;

  const { rows } = await pool.query<{ id: string; name: string; password_hash: string; avatar_url: string | null }>(
    'SELECT id, name, password_hash, avatar_url FROM users WHERE email = $1',
    [email]
  );

  if (rows.length === 0) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const token = signToken(user.id, email);
  res.json({
    token,
    user: {
      id: user.id,
      email,
      name: user.name,
      avatar_url: user.avatar_url,
    },
  });
});

// ─── POST /logout ─────────────────────────────────────────────────────────────
// JWT is stateless — client just discards the token. We return 200 as confirmation.
router.post('/logout', requireAuth, (_req: Request, res: Response): void => {
  res.json({ message: 'Logged out successfully.' });
});

// ─── GET /me ──────────────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { rows } = await pool.query(
    'SELECT id, email, name, avatar_url, language, created_at FROM users WHERE id = $1',
    [req.user!.id]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ user: rows[0], plan: req.user!.plan });
});

// ─── POST /forgot-password ────────────────────────────────────────────────────
router.post('/forgot-password', authLimiter, async (req: Request, res: Response): Promise<void> => {
  const result = EmailSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Valid email required.' });
    return;
  }

  const { email } = result.data;
  const { rows } = await pool.query<{ id: string; name: string }>(
    'SELECT id, name FROM users WHERE email = $1',
    [email]
  );

  // Always return success — don't reveal if email exists
  if (rows.length > 0) {
    const user = rows[0];
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, token, expiresAt]
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    sendPasswordResetEmail(email, user.name, resetUrl).catch((err) =>
      console.error('[auth] Failed to send reset email:', err)
    );
  }

  res.json({ message: 'If this email is registered, a reset link has been sent.' });
});

// ─── POST /reset-password ─────────────────────────────────────────────────────
router.post('/reset-password', authLimiter, async (req: Request, res: Response): Promise<void> => {
  const result = ResetPasswordSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
    return;
  }

  const { token, password } = result.data;

  const { rows } = await pool.query<{ id: string; user_id: string; expires_at: Date; used: boolean }>(
    `SELECT id, user_id, expires_at, used FROM password_reset_tokens WHERE token = $1`,
    [token]
  );

  if (rows.length === 0 || rows[0].used || new Date() > rows[0].expires_at) {
    res.status(400).json({ error: 'Reset token is invalid or has expired.' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, rows[0].user_id]);
  await pool.query('UPDATE password_reset_tokens SET used = TRUE WHERE id = $1', [rows[0].id]);

  res.json({ message: 'Password reset successfully. You can now log in.' });
});

export default router;
