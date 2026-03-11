/**
 * Room Redesign Routes
 * POST   /api/redesign/generate
 * GET    /api/redesign
 * GET    /api/redesign/:id
 * DELETE /api/redesign/:id
 */

import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { requireAuth } from '../middleware/auth.js';
import { checkRedesignLimit } from '../middleware/usageLimiter.js';
import { generationLimiter } from '../middleware/rateLimiter.js';
import { generateRoomRedesign } from '../services/aiService.js';
import { uploadFile, reuploadFromUrl } from '../services/storageService.js';
import { incrementRedesignUsage } from '../services/subscriptionService.js';
import pool from '../db/pool.js';

const router = Router();
router.use(requireAuth);

// File upload config — in-memory, max 10MB, images only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});

const GenerateSchema = z.object({
  style: z.enum(['modern', 'scandinavian', 'minimal', 'industrial', 'boho', 'classic', 'luxury']),
  room_type: z.enum(['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office']).optional(),
});

// ─── POST /generate ───────────────────────────────────────────────────────────
router.post(
  '/generate',
  generationLimiter,
  checkRedesignLimit,
  upload.single('image'),
  async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'Room image is required.' });
      return;
    }

    const result = GenerateSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
      return;
    }

    const { style, room_type } = result.data;
    const userId = req.user!.id;
    const redesignId = randomUUID();

    try {
      const originalPath = `${userId}/${redesignId}/original.jpg`;
      const originalUrl = await uploadFile(
        'redesign-images',
        originalPath,
        req.file.buffer,
        req.file.mimetype
      );

      const aiResult = await generateRoomRedesign(req.file.buffer, { style, roomType: room_type });

      const resultUrls = await Promise.all(
        aiResult.images.map((url, idx) => {
          const path = `${userId}/${redesignId}/result_${idx}.jpg`;
          return reuploadFromUrl(url, 'redesign-images', path);
        })
      );

      const isWatermarked = req.user!.plan === 'free';

      const { rows } = await pool.query(
        `INSERT INTO redesigns (id, user_id, original_image_url, style, result_images, is_watermarked)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [redesignId, userId, originalUrl, style, JSON.stringify(resultUrls), isWatermarked]
      );

      await incrementRedesignUsage(userId);

      res.status(201).json({ redesign: rows[0] });
    } catch (err) {
      console.error('[redesign/generate]', err);
      res.status(500).json({ error: 'Failed to generate room redesign. Please try again.' });
    }
  }
);

// ─── GET / ────────────────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(20, Number(req.query.limit) || 12);
  const offset = (page - 1) * limit;

  const [countResult, redesignsResult] = await Promise.all([
    pool.query<{ count: string }>(
      'SELECT COUNT(*) FROM redesigns WHERE user_id = $1',
      [req.user!.id]
    ),
    pool.query(
      `SELECT id, original_image_url, style, result_images, is_watermarked, created_at
       FROM redesigns
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user!.id, limit, offset]
    ),
  ]);

  res.json({
    redesigns: redesignsResult.rows,
    total: Number(countResult.rows[0].count),
    page,
    limit,
  });
});

// ─── GET /:id ─────────────────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const { rows } = await pool.query(
    'SELECT * FROM redesigns WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user!.id]
  );

  if (rows.length === 0) { res.status(404).json({ error: 'Redesign not found.' }); return; }

  res.json({ redesign: rows[0] });
});

// ─── DELETE /:id ──────────────────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const { rowCount } = await pool.query(
    'DELETE FROM redesigns WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user!.id]
  );

  if (!rowCount) { res.status(404).json({ error: 'Redesign not found.' }); return; }

  res.json({ message: 'Redesign deleted successfully.' });
});

export default router;
