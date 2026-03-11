/**
 * Payment Routes
 * POST /api/payments/upload-screenshot
 * GET  /api/payments/status/:transactionId
 * GET  /api/payments/history
 */

import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { requireAuth } from '../middleware/auth.js';
import { paymentLimiter } from '../middleware/rateLimiter.js';
import { extractPaymentData } from '../services/ocrService.js';
import { verifyPayment } from '../utils/paymentVerifier.js';
import { uploadPaymentScreenshot } from '../services/storageService.js';
import { activateSubscription } from '../services/subscriptionService.js';
import { sendPaymentConfirmationEmail, sendManualReviewAlert } from '../services/emailService.js';
import pool from '../db/pool.js';

const router = Router();
router.use(requireAuth);

// In-memory file upload for screenshots — max 10MB
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

const UploadSchema = z.object({
  plan: z.enum(['basic', 'premium']),
  method: z.enum(['instapay', 'vodafone_cash']),
});

const PLAN_PRICES = {
  basic: Number(process.env.PLAN_PRICE_BASIC) || 39,
  premium: Number(process.env.PLAN_PRICE_PREMIUM) || 79,
} as const;

// ─── POST /upload-screenshot ──────────────────────────────────────────────────
router.post(
  '/upload-screenshot',
  paymentLimiter,
  upload.single('screenshot'),
  async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'Payment screenshot is required.' });
      return;
    }

    const result = UploadSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
      return;
    }

    const { plan, method } = result.data;
    const userId = req.user!.id;
    const paymentId = randomUUID();

    try {
      const screenshotPath = await uploadPaymentScreenshot(
        userId, paymentId, req.file.buffer, req.file.mimetype
      );

      const base64 = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64}`;
      const ocrResult = await extractPaymentData(dataUrl);

      const verification = await verifyPayment(ocrResult, plan, method);

      await pool.query(
        `INSERT INTO payments
           (id, user_id, plan, amount, method, transaction_id, screenshot_url,
            ocr_result, status, rejection_reason, verified_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          paymentId, userId, plan, PLAN_PRICES[plan], method,
          ocrResult.transaction_id,
          screenshotPath,
          JSON.stringify(ocrResult),
          verification.status,
          verification.reason || null,
          verification.valid ? new Date() : null,
        ]
      );

      if (verification.valid && verification.status === 'verified') {
        await activateSubscription(userId, plan as 'basic' | 'premium');

        // Get user info for confirmation email
        const { rows } = await pool.query<{ email: string; name: string }>(
          'SELECT email, name FROM users WHERE id = $1',
          [userId]
        );
        if (rows.length > 0) {
          sendPaymentConfirmationEmail(
            rows[0].email,
            rows[0].name || 'there',
            plan,
            PLAN_PRICES[plan]
          ).catch(console.error);
        }

        res.json({
          status: 'verified',
          message: 'Payment verified! Your subscription is now active.',
          payment_id: paymentId,
        });
      } else if (verification.status === 'manual_review') {
        sendManualReviewAlert(paymentId, userId, screenshotPath, ocrResult).catch(console.error);

        res.json({
          status: 'manual_review',
          message: "We couldn't automatically verify your payment. Our team will review it within 24 hours.",
          payment_id: paymentId,
        });
      } else {
        res.status(422).json({
          status: 'rejected',
          error: verification.reason || 'Payment verification failed.',
          payment_id: paymentId,
        });
      }
    } catch (err) {
      console.error('[payments/upload-screenshot]', err);
      res.status(500).json({ error: 'Payment processing failed. Please try again.' });
    }
  }
);

// ─── GET /status/:transactionId ───────────────────────────────────────────────
router.get('/status/:transactionId', async (req: Request, res: Response): Promise<void> => {
  const { rows } = await pool.query(
    `SELECT id, status, plan, amount, method, verified_at, rejection_reason, created_at
     FROM payments
     WHERE transaction_id = $1 AND user_id = $2`,
    [req.params.transactionId, req.user!.id]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: 'Payment not found.' });
    return;
  }

  res.json({ payment: rows[0] });
});

// ─── GET /history ─────────────────────────────────────────────────────────────
router.get('/history', async (req: Request, res: Response): Promise<void> => {
  const { rows } = await pool.query(
    `SELECT id, plan, amount, method, status, verified_at, created_at
     FROM payments
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 20`,
    [req.user!.id]
  );

  res.json({ payments: rows });
});

export default router;
