# Zabatly — Production Readiness Plan

> Last updated: 2026-03-11
> Status: Pre-production · MVP feature-complete

---

## 1. Current State Summary

### What Works ✅
| Area | Status |
|---|---|
| Auth (register, login, logout, forgot/reset password) | ✅ Real API wired |
| JWT middleware + route protection | ✅ Complete |
| Mood board generation (DALL-E 3 + GPT-4o) | ✅ Real AI, real API |
| Mood board CRUD (list, view, edit, delete, share) | ✅ Complete |
| Dashboard (real boards + real usage stats) | ✅ Wired |
| Settings (profile update, account delete) | ✅ Wired |
| Subscription usage tracking | ✅ pg stored procedures |
| Payment page UI + screenshot upload to API | ✅ Wired |
| Payment OCR + verification logic | ✅ Complete (paymentVerifier.ts) |
| Email service (welcome, reset, confirmation, expiry, admin alert) | ✅ Resend (real) |
| Shared board public view (`/shared/:token`) | ✅ Complete |
| Auth guards on all protected routes | ✅ RequireAuth component |
| Database schema (PostgreSQL) | ✅ schema.sql complete |
| Backend `.env.example` | ✅ Complete |
| Frontend `.env.example` | ✅ Complete |

### What Is Incomplete ⚠️
| Area | Status | Blocker Level |
|---|---|---|
| RoomRedesign — no API wiring (shows fake images) | ❌ Not wired | HIGH |
| MoodBoardEditor — canvas is placeholder (no Fabric.js) | ⚠️ Stub | MEDIUM |
| Nginx config for static file serving (`/uploads`) | ❌ Missing | HIGH |
| CORS config for production domain | ⚠️ Needs update | HIGH |
| PM2 ecosystem config | ❌ Missing | MEDIUM |
| RTL audit on all pages | ⚠️ Partial | MEDIUM |

---

## 2. Immediate Fixes Needed Before Deployment

### 2.1 Infrastructure — Before Any Deploy

#### A. Set up PostgreSQL on VPS
```bash
sudo apt update && sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE USER zabatly_user WITH PASSWORD 'your_strong_password';"
sudo -u postgres psql -c "CREATE DATABASE zabatly OWNER zabatly_user;"
sudo -u postgres psql -d zabatly -f /path/to/backend/src/models/schema.sql
```

#### B. Set up upload directory
```bash
sudo mkdir -p /var/www/zabatly/uploads/{public,private}
sudo mkdir -p /var/www/zabatly/uploads/public/{avatars,moodboard-images,redesign-images}
sudo mkdir -p /var/www/zabatly/uploads/private/payment-screenshots
sudo chown -R www-data:www-data /var/www/zabatly/uploads
```

#### C. Nginx configuration
```nginx
server {
    listen 80;
    server_name api.zabatly.com;

    # Serve static uploaded files
    location /uploads/public/ {
        alias /var/www/zabatly/uploads/public/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Block private uploads (payment screenshots) from direct access
    location /uploads/private/ {
        deny all;
        return 403;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Then: `sudo certbot --nginx -d api.zabatly.com`

#### D. Backend static file serving
Add to `backend/src/app.ts` (before routes):
```typescript
import path from 'path';
// Serve public uploads via Express (or use Nginx — Nginx is preferred)
app.use('/uploads/public', express.static(
  path.join(process.env.STORAGE_LOCAL_PATH || '/var/www/zabatly/uploads', 'public')
));
```

### 2.2 Backend Config Fixes

#### Update CORS for production
In `backend/src/app.ts`, update CORS origin to only allow your actual domain:
```typescript
origin: process.env.NODE_ENV === 'production'
  ? process.env.FRONTEND_URL  // e.g. https://zabatly.com
  : 'http://localhost:3000',
```

#### Create PM2 ecosystem file (`backend/ecosystem.config.cjs`):
```javascript
module.exports = {
  apps: [{
    name: 'zabatly-api',
    script: 'dist/app.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 4000,
    },
  }],
};
```
Deploy: `npm run build && pm2 start ecosystem.config.cjs`

### 2.3 Frontend Config Fixes

Create `frontend/.env.production`:
```env
VITE_API_URL=https://api.zabatly.com
VITE_INSTAPAY_PHONE=01XXXXXXXXX   # your real number
VITE_VODAFONE_PHONE=01XXXXXXXXX   # your real number
```

---

## 3. Features Pending (Priority Order)

### Priority 1 — HIGH (blocks revenue)

#### 3.1 Wire RoomRedesign to real API
**File:** `frontend/src/pages/RoomRedesign.tsx`
**What to do:**
- Add `useAuth()` and fetch token
- Wire Upload button to send file to `POST /api/redesign/generate` with `style` param
- Display real result images in before/after slider and variations grid
- Add loading spinner during generation
- Add error handling for 402 (limit reached) → redirect to /pricing

#### 3.2 Subscription activation after payment verified
**File:** `backend/src/routes/payments.ts`
**Current state:** Payment uploaded, OCR runs, status is saved — but subscription is NOT automatically activated.
**Fix:** In `payments.ts`, after `verifyPayment()` returns `verified`:
```typescript
if (verification.status === 'verified') {
  await pool.query(
    `INSERT INTO subscriptions (user_id, plan, status, started_at, expires_at)
     VALUES ($1, $2, 'active', NOW(), NOW() + INTERVAL '30 days')
     ON CONFLICT (user_id) DO UPDATE SET plan = $2, status = 'active',
       started_at = NOW(), expires_at = NOW() + INTERVAL '30 days'`,
    [req.user!.id, plan]
  );
}
```
Also send `sendPaymentConfirmationEmail()` after activation.

#### 3.3 Free subscription on register
**File:** `backend/src/routes/auth.ts`
**Current state:** Users register but no subscription row is created → all usage limit checks fail.
**Fix:** After INSERT INTO users:
```typescript
await pool.query(
  `INSERT INTO subscriptions (user_id, plan, status, started_at)
   VALUES ($1, 'free', 'active', NOW())`,
  [newUserId]
);
```

### Priority 2 — MEDIUM (improves UX)

#### 3.4 Add redirect-after-login
**File:** `frontend/src/pages/Login.tsx`
**Fix:** After login, redirect to `location.state?.from || '/dashboard'` so that users going to a protected URL land back there after auth.

#### 3.5 RTL safety for Toast component
**File:** `frontend/src/components/Toast.tsx`
**Fix:** Change `fixed bottom-6 right-6` to `fixed bottom-6 end-6` (CSS logical properties) or add `rtl:left-6 ltr:right-6`.

#### 3.6 MoodBoardEditor — load real board data
**File:** `frontend/src/pages/MoodBoardEditor.tsx`
**Current state:** Editor loads with placeholder canvas, doesn't fetch the board's generated images.
**Fix:** Add `useEffect` to call `GET /api/moodboards/:id` and populate the right panel with the board's actual images, palette, and materials.

#### 3.7 Dashboard upgrade redirect for free users at limit
**Already in UI** (amber banner), but the upgrade button should pass `?plan=basic` to `/pricing` then `/payment?plan=basic`.

### Priority 3 — LOW (polish)

#### 3.8 LandingPage broken nav links
**File:** `frontend/src/pages/LandingPage.tsx`
**Fix:** Remove links to `/explore`, `/designs`, `/gallery` — these pages don't exist. Replace with `/dashboard` or `#`.

#### 3.9 MoodBoardEditor — Fabric.js integration
Replace placeholder `<canvas>` with Fabric.js for real drag-and-drop editing.
- `npm install fabric` in frontend
- See [Fabric.js docs](http://fabricjs.com/docs/)

---

## 4. Environment Variables Reference

### Backend (`backend/.env`)
```env
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://zabatly.com

DATABASE_URL=postgresql://zabatly_user:PASSWORD@localhost:5432/zabatly

JWT_SECRET=<64+ char random string>
JWT_EXPIRES_IN=7d

STORAGE_DRIVER=local
STORAGE_LOCAL_PATH=/var/www/zabatly/uploads
STORAGE_BASE_URL=https://api.zabatly.com/uploads

OPENAI_API_KEY=sk-proj-...

RESEND_API_KEY=re_...
EMAIL_FROM=Zabatly <hello@zabatly.com>
ADMIN_EMAIL=your@email.com

INSTAPAY_PHONE=01XXXXXXXXX
VODAFONE_CASH_PHONE=01XXXXXXXXX
INSTAPAY_ACCOUNT_NAME=Zabatly
PLAN_PRICE_BASIC=39
PLAN_PRICE_PREMIUM=79

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5
PAYMENT_RATE_LIMIT_MAX=3
```

### Frontend (`frontend/.env.production`)
```env
VITE_API_URL=https://api.zabatly.com
VITE_INSTAPAY_PHONE=01XXXXXXXXX
VITE_VODAFONE_PHONE=01XXXXXXXXX
```

---

## 5. Deployment Checklist

### Backend VPS
- [ ] PostgreSQL installed and running
- [ ] Database created and schema applied (`psql -d zabatly -f schema.sql`)
- [ ] `/var/www/zabatly/uploads/` directory created with correct permissions
- [ ] `.env` file created from `.env.example` with real values
- [ ] `npm install && npm run build`
- [ ] PM2 started: `pm2 start ecosystem.config.cjs`
- [ ] PM2 saved: `pm2 save && pm2 startup`
- [ ] Nginx configured and SSL certificate issued (Certbot)
- [ ] Test: `curl https://api.zabatly.com/health` → `{"status":"ok"}`

### Frontend (Vercel)
- [ ] Push `frontend/` to GitHub
- [ ] Connect Vercel to repo, set root to `frontend/`
- [ ] Add env vars in Vercel dashboard (`VITE_API_URL`, `VITE_INSTAPAY_PHONE`, `VITE_VODAFONE_PHONE`)
- [ ] Build command: `npm run build` / Output: `dist`
- [ ] Set custom domain: `zabatly.com`
- [ ] Test registration, login, mood board generation end-to-end

### DNS
- [ ] `zabatly.com` → Vercel (A record or CNAME)
- [ ] `api.zabatly.com` → VPS IP (A record)

### Post-Deploy Smoke Tests
- [ ] Register new account → welcome email received
- [ ] Login → redirect to dashboard
- [ ] Generate mood board → images appear (costs ~$0.16 in OpenAI)
- [ ] Upload InstaPay screenshot → status shows pending/verified
- [ ] Forgot password → reset email received → password changed
- [ ] Shared board link works without login

---

## 6. Cost Projection

| Item | Cost |
|---|---|
| VPS (Hetzner CX21 or DigitalOcean Basic) | ~$6/mo |
| PostgreSQL (self-hosted on VPS) | $0 |
| Vercel (free tier) | $0 |
| Resend email (3,000 free/mo) | $0 |
| OpenAI DALL-E 3 (4 images/board) | ~$0.16/board |
| OpenAI GPT-4o (metadata) | ~$0.002/board |
| OpenAI GPT-4 Vision (OCR) | ~$0.01/payment screenshot |
| Disk storage (uploads) | $0 (VPS disk) |
| **Total fixed/mo** | **~$6** |
| **Per mood board AI cost** | **~$0.17** |

**Break-even:** 8 Basic subscribers (39 EGP × 8 = 312 EGP ≈ $6.40) covers all infra costs.
**Gross margin at 100 users:** Revenue ~3,900 EGP/mo, AI costs ~170 EGP → **96% margin**.

---

## 7. Security Pre-Deploy Checklist

- [x] Supabase removed from all backend files
- [x] No API keys exposed in frontend bundle (vite.config.ts cleaned up)
- [x] All protected routes guarded by `RequireAuth`
- [x] Payment screenshots stored in private directory (not web-accessible)
- [x] Duplicate transaction ID check (DB UNIQUE + code check)
- [x] Amount tolerance ±1 EGP
- [x] Payment timestamp within 48 hours
- [x] Bcrypt password hashing (12 rounds)
- [x] JWT expiry 7 days
- [x] Zod input validation on all routes
- [x] CORS restricted to frontend domain
- [x] Helmet.js security headers
- [x] Rate limiting on auth (5/min) and generation endpoints
- [ ] Set `NODE_ENV=production` in PM2 to hide stack traces
- [ ] Review Nginx config to ensure `/uploads/private/` is blocked
- [ ] Rotate JWT_SECRET before go-live (never use dev secret in prod)

---

## 8. After Launch — Roadmap

| Phase | Feature | Est. Effort |
|---|---|---|
| v1.1 | Fabric.js canvas editor | 3–5 days |
| v1.1 | RoomRedesign API wiring | 1 day |
| v1.1 | Subscription auto-activate on payment | 2 hours |
| v1.2 | Google OAuth | 1–2 days |
| v1.2 | Subscription expiry cron job (warn users) | 1 day |
| v1.3 | Admin dashboard (manual payment review) | 2–3 days |
| v1.3 | Cloudflare R2 storage migration | 1 day |
| v2.0 | Replicate Flux image gen (10x cheaper than DALL-E) | 1–2 days |
| v2.0 | Mobile app (React Native) | 4–6 weeks |
| v3.0 | Marketplace (designer profiles) | 2–3 months |
