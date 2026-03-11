/**
 * Subscription Routes
 * GET  /api/subscriptions/current
 * POST /api/subscriptions/activate
 * GET  /api/subscriptions/usage
 */

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { getUsage, activateSubscription } from '../services/subscriptionService.js';

const router = Router();
router.use(requireAuth);

const ActivateSchema = z.object({
  plan: z.enum(['basic', 'premium']),
  payment_id: z.string().uuid('Invalid payment ID'),
});

// ─── GET /current ─────────────────────────────────────────────────────────────
router.get('/current', async (req: Request, res: Response): Promise<void> => {
  try {
    const usage = await getUsage(req.user!.id);
    res.json({ subscription: usage });
  } catch (err) {
    console.error('[subscriptions/current]', err);
    res.status(500).json({ error: 'Failed to fetch subscription.' });
  }
});

// ─── POST /activate ───────────────────────────────────────────────────────────
// This is typically called by the payment service automatically.
// Can also be called by admin for manual activation.
router.post('/activate', async (req: Request, res: Response): Promise<void> => {
  const result = ActivateSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
    return;
  }

  try {
    await activateSubscription(req.user!.id, result.data.plan);
    res.json({ message: `${result.data.plan} plan activated successfully.` });
  } catch (err) {
    console.error('[subscriptions/activate]', err);
    res.status(500).json({ error: 'Failed to activate subscription.' });
  }
});

// ─── GET /usage ───────────────────────────────────────────────────────────────
router.get('/usage', async (req: Request, res: Response): Promise<void> => {
  try {
    const usage = await getUsage(req.user!.id);
    res.json({
      plan: usage.plan,
      boards: { used: usage.boards_used, limit: usage.boards_limit },
      redesigns: { used: usage.redesigns_used, limit: usage.redesigns_limit },
      expires_at: usage.expires_at,
    });
  } catch (err) {
    console.error('[subscriptions/usage]', err);
    res.status(500).json({ error: 'Failed to fetch usage data.' });
  }
});

export default router;
