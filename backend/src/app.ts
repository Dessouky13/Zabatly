import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import authRouter from './routes/auth.js';
import moodboardsRouter from './routes/moodboards.js';
import redesignRouter from './routes/redesign.js';
import paymentsRouter from './routes/payments.js';
import subscriptionsRouter from './routes/subscriptions.js';
import usersRouter from './routes/users.js';
import pool from './db/pool.js';

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Global Rate Limiter ────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// ─── Body Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'zabatly-api' });
});

// ─── Public Routes (no auth) ────────────────────────────────────────────────
app.get('/api/shared/:token', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, room_type, style, generated_images, color_palette, materials,
              furniture_suggestions, created_at
       FROM moodboards WHERE share_token = $1`,
      [req.params.token]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'Board not found or link expired.' });
      return;
    }
    res.json({ board: rows[0] });
  } catch (err) {
    console.error('[shared]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/moodboards', moodboardsRouter);
app.use('/api/redesign', redesignRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/users', usersRouter);

// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ───────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message, err.stack);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`✓ Zabatly API running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});

export default app;
