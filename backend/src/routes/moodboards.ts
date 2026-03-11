/**
 * Mood Board Routes
 * POST   /api/moodboards/generate
 * GET    /api/moodboards
 * GET    /api/moodboards/:id
 * PUT    /api/moodboards/:id
 * DELETE /api/moodboards/:id
 * POST   /api/moodboards/:id/share
 */

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { requireAuth } from '../middleware/auth.js';
import { checkBoardLimit } from '../middleware/usageLimiter.js';
import { generationLimiter } from '../middleware/rateLimiter.js';
import { generateMoodBoard } from '../services/aiService.js';
import { uploadMoodBoardImage } from '../services/storageService.js';
import { incrementBoardUsage } from '../services/subscriptionService.js';
import pool from '../db/pool.js';

const router = Router();
router.use(requireAuth);

const GenerateSchema = z.object({
  room_type: z.enum(['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office']),
  style: z.enum(['modern', 'scandinavian', 'minimal', 'industrial', 'boho', 'classic', 'luxury']),
  color_preference: z.string().min(2).max(100),
  custom_prompt: z.string().max(500).optional(),
  title: z.string().max(100).optional(),
});

const UpdateSchema = z.object({
  title: z.string().max(100).optional(),
  canvas_data: z.record(z.unknown()).optional(),
});

// ─── POST /generate ───────────────────────────────────────────────────────────
router.post('/generate', generationLimiter, checkBoardLimit, async (req: Request, res: Response): Promise<void> => {
  const result = GenerateSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
    return;
  }

  const { room_type, style, color_preference, custom_prompt, title } = result.data;
  const userId = req.user!.id;
  const boardId = randomUUID();

  try {
    const aiResult = await generateMoodBoard({
      roomType: room_type,
      style,
      colorPreference: color_preference,
      customPrompt: custom_prompt,
    });

    const permanentImageUrls = await Promise.all(
      aiResult.images.map((url, idx) =>
        uploadMoodBoardImage(userId, boardId, idx, url)
      )
    );

    const isWatermarked = req.user!.plan === 'free';

    const { rows } = await pool.query(
      `INSERT INTO moodboards
         (id, user_id, title, room_type, style, color_preference, prompt,
          generated_images, color_palette, materials, furniture_suggestions, is_watermarked)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        boardId, userId,
        title || `${style} ${room_type}`,
        room_type, style, color_preference,
        custom_prompt || null,
        JSON.stringify(permanentImageUrls),
        JSON.stringify(aiResult.color_palette),
        JSON.stringify(aiResult.materials),
        JSON.stringify(aiResult.furniture_suggestions),
        isWatermarked,
      ]
    );

    await incrementBoardUsage(userId);

    res.status(201).json({ board: rows[0] });
  } catch (err) {
    console.error('[moodboards/generate]', err);
    res.status(500).json({ error: 'Failed to generate mood board. Please try again.' });
  }
});

// ─── GET / ────────────────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(20, Number(req.query.limit) || 12);
  const offset = (page - 1) * limit;

  const [countResult, boardsResult] = await Promise.all([
    pool.query<{ count: string }>(
      'SELECT COUNT(*) FROM moodboards WHERE user_id = $1',
      [req.user!.id]
    ),
    pool.query(
      `SELECT id, title, room_type, style, generated_images, is_watermarked, created_at
       FROM moodboards
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user!.id, limit, offset]
    ),
  ]);

  res.json({
    boards: boardsResult.rows,
    total: Number(countResult.rows[0].count),
    page,
    limit,
  });
});

// ─── GET /:id ─────────────────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const { rows } = await pool.query(
    'SELECT * FROM moodboards WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user!.id]
  );

  if (rows.length === 0) { res.status(404).json({ error: 'Mood board not found.' }); return; }

  res.json({ board: rows[0] });
});

// ─── PUT /:id ─────────────────────────────────────────────────────────────────
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const result = UpdateSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
    return;
  }

  const { title, canvas_data } = result.data;
  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (title !== undefined)       { sets.push(`title = $${i++}`);       values.push(title); }
  if (canvas_data !== undefined) { sets.push(`canvas_data = $${i++}`); values.push(JSON.stringify(canvas_data)); }

  if (sets.length === 0) { res.status(400).json({ error: 'No fields to update.' }); return; }

  values.push(req.params.id, req.user!.id);
  const { rows } = await pool.query(
    `UPDATE moodboards SET ${sets.join(', ')} WHERE id = $${i++} AND user_id = $${i} RETURNING *`,
    values
  );

  if (rows.length === 0) { res.status(404).json({ error: 'Mood board not found.' }); return; }

  res.json({ board: rows[0] });
});

// ─── DELETE /:id ──────────────────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const { rowCount } = await pool.query(
    'DELETE FROM moodboards WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user!.id]
  );

  if (!rowCount) { res.status(404).json({ error: 'Mood board not found.' }); return; }

  res.json({ message: 'Mood board deleted successfully.' });
});

// ─── POST /:id/share ──────────────────────────────────────────────────────────
router.post('/:id/share', async (req: Request, res: Response): Promise<void> => {
  const shareToken = randomUUID().replace(/-/g, '').slice(0, 16);

  const { rows } = await pool.query(
    `UPDATE moodboards SET share_token = $1 WHERE id = $2 AND user_id = $3 RETURNING share_token`,
    [shareToken, req.params.id, req.user!.id]
  );

  if (rows.length === 0) { res.status(404).json({ error: 'Mood board not found.' }); return; }

  res.json({
    share_url: `${process.env.FRONTEND_URL}/shared/${rows[0].share_token}`,
  });
});

export default router;
