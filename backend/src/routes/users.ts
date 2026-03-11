/**
 * User Routes
 * GET    /api/users/profile
 * PUT    /api/users/profile
 * PUT    /api/users/language
 * DELETE /api/users/account
 */

import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { uploadFile } from '../services/storageService.js';
import pool from '../db/pool.js';

const router = Router();
router.use(requireAuth);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for avatars
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});

const ProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
});

const LanguageSchema = z.object({
  language: z.enum(['en', 'ar']),
});

// ─── GET /profile ─────────────────────────────────────────────────────────────
router.get('/profile', async (req: Request, res: Response): Promise<void> => {
  const { rows } = await pool.query(
    'SELECT id, email, name, avatar_url, language, created_at FROM users WHERE id = $1',
    [req.user!.id]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  res.json({ user: rows[0] });
});

// ─── PUT /profile ─────────────────────────────────────────────────────────────
router.put('/profile', upload.single('avatar'), async (req: Request, res: Response): Promise<void> => {
  const result = ProfileSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
    return;
  }

  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (result.data.name) { sets.push(`name = $${i++}`); values.push(result.data.name); }

  if (req.file) {
    try {
      const ext = req.file.mimetype.includes('png') ? 'png' : 'jpg';
      const avatarPath = `${req.user!.id}/avatar.${ext}`;
      const avatarUrl = await uploadFile('avatars', avatarPath, req.file.buffer, req.file.mimetype);
      sets.push(`avatar_url = $${i++}`);
      values.push(avatarUrl);
    } catch (err) {
      console.error('[users/profile avatar]', err);
    }
  }

  if (sets.length === 0) {
    res.status(400).json({ error: 'No fields to update.' });
    return;
  }

  values.push(req.user!.id);
  const { rows } = await pool.query(
    `UPDATE users SET ${sets.join(', ')} WHERE id = $${i} RETURNING id, email, name, avatar_url, language`,
    values
  );

  res.json({ user: rows[0] });
});

// ─── PUT /language ────────────────────────────────────────────────────────────
router.put('/language', async (req: Request, res: Response): Promise<void> => {
  const result = LanguageSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Language must be "en" or "ar".' });
    return;
  }

  await pool.query(
    'UPDATE users SET language = $1 WHERE id = $2',
    [result.data.language, req.user!.id]
  );

  res.json({ language: result.data.language });
});

// ─── DELETE /account ──────────────────────────────────────────────────────────
router.delete('/account', async (req: Request, res: Response): Promise<void> => {
  // FK CASCADE on all dependent tables (subscriptions, moodboards, redesigns, payments)
  const { rowCount } = await pool.query(
    'DELETE FROM users WHERE id = $1',
    [req.user!.id]
  );

  if (!rowCount) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  res.json({ message: 'Account deleted successfully.' });
});

export default router;
