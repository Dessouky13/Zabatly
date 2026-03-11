# Zabatly — Enhancement Plan & Infrastructure Decisions

---

## 1. Infrastructure Change: Drop Supabase → Own VPS Stack

### Decision
No Supabase. Run everything on your existing VPS. Goal: **minimal monthly cost, maximum profit margin**.

### Chosen Stack (Cheap & Production-Ready)

| Layer | Choice | Monthly Cost |
|---|---|---|
| Database | **PostgreSQL** (self-hosted on VPS) | $0 extra |
| File Storage | **Local disk + Nginx** or **Cloudflare R2** | $0–$0.015/GB |
| Auth | **Custom JWT** (jsonwebtoken + bcrypt) | $0 |
| Email | **Resend free tier** (3,000 emails/mo free) | $0 |
| AI | **OpenAI API** (pay per use) | ~$0.04/mood board |
| Frontend | **Vercel free tier** | $0 |
| Backend | **Your VPS** (already paying for it) | $0 extra |
| Reverse Proxy | **Nginx** (already on VPS) | $0 |
| Process Manager | **PM2** | $0 |

**Estimated total infra cost: ~$0–5/month** (just AI API usage per generation)

---

### Database: PostgreSQL on VPS

Replace all `@supabase/supabase-js` calls with:
- **`pg`** (node-postgres) — raw SQL, no ORM overhead
- Or **`drizzle-orm`** with `pg` driver — lightweight typed ORM, no migration mess
- Schema stays identical (same SQL from `schema.sql`)

```bash
# On VPS (Ubuntu)
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb zabatly
sudo -u postgres createuser zabatly_user
```

### Auth: Custom JWT (no Auth service needed)

```
Register: hash password with bcrypt → store in users table → return JWT
Login: compare bcrypt hash → issue JWT (access: 7d, refresh: 30d)
Middleware: verify JWT with jsonwebtoken → attach user to req
```

No external service. Full control. Zero cost.

### Storage: Two Options

**Option A — Local VPS disk + Nginx (cheapest, ~$0)**
- Upload files to `/var/www/zabatly/uploads/{user_id}/`
- Nginx serves static files directly
- Backup: cron job to external storage weekly
- Limit: disk space on VPS

**Option B — Cloudflare R2 (recommended for scale, ~$0–2/mo)**
- S3-compatible API
- 10GB free storage, $0.015/GB after
- No egress fees (unlike AWS S3)
- Use `@aws-sdk/client-s3` with R2 endpoint
- Keeps VPS disk free

**Recommendation: Start with Option A, migrate to R2 when storage > 5GB**

---

## 2. Translation Fixes ✅ COMPLETED

### Problems Found & Fixed

| File | Issues | Status |
|---|---|---|
| LandingPage.tsx | Broken nav key generation (regex chain bug), 50+ hardcoded strings | ✅ Fixed |
| MoodBoardGenerator.tsx | `useLanguage` not imported at all, 20+ hardcoded labels | ✅ Fixed |
| RoomRedesign.tsx | `useLanguage` not imported at all, 20+ hardcoded labels | ✅ Fixed |
| Payment.tsx | Uses `isAr ? '...' : '...'` ternaries instead of `t()` everywhere | ✅ Fixed |
| Pricing.tsx | Duplicate local TRANSLATIONS object, not using LanguageContext | ✅ Fixed |
| Dashboard.tsx | "+3 this week", footer links all hardcoded | ✅ Fixed |
| Layout.tsx | Search placeholder hardcoded, Settings icon not linked | ✅ Fixed |
| LanguageContext.tsx | ~80 keys, missing most pages | ✅ Expanded to 300+ keys |

### What Was Done
1. Added all missing keys to `LanguageContext.tsx` (EN + AR) — 300+ keys covering all pages
2. Fixed nav key bug in LandingPage — replaced broken `.map()` with explicit `NAV_LINKS` array
3. Fixed `t` variable collision in LandingPage testimonials `.map((t, idx)` → `.map((testimonial, idx)`
4. Added `useLanguage` to MoodBoardGenerator and RoomRedesign
5. Replaced all `isAr ? 'X' : 'Y'` ternaries with `t('key')` calls in Payment.tsx
6. Deleted local `TRANSLATIONS` object in Pricing.tsx, converted to `featKey` references
7. Wired Settings icon in Header to `/settings` route
8. Fixed Pricing nav link to use `<Link to="/pricing">` instead of `<a href="#pricing">`

---

## 3. Header Issues

### Landing Page Header
- ✅ Logo + brand name
- ✅ Nav links (broken key generation — **FIXED**)
- ✅ Language toggle
- ✅ Login button
- ✅ "Pricing" nav link goes to `/pricing` page (uses `<Link>`)
- ❌ Mobile menu doesn't exist on landing page (only in app Layout) — Phase 3

### App Header (Layout.tsx)
- ✅ Mobile hamburger menu works
- ✅ Notification bell, settings icon
- ✅ Search placeholder translated (`t('common.search')`)
- ✅ Settings icon links to `/settings`
- ❌ User name hardcoded ("Sarah Ahmed") — needs real auth state (Phase 2)

---

## 4. Feature Enhancement Roadmap

### Phase 1 — ✅ COMPLETE
- [x] Fix all translation gaps (LanguageContext expanded to 300+ keys)
- [x] Fix LandingPage header nav (NAV_LINKS array, `t()` keys, `<Link>` for /pricing)
- [x] Wire Settings icon to `/settings` in Header
- [x] Fix Pricing nav link → `/pricing` (not `#pricing`)
- [x] Fix Dashboard hardcoded strings (+3 this week, Modified, footer links)
- [x] Fix MoodBoardGenerator — added `useLanguage`, all labels translated
- [x] Fix RoomRedesign — added `useLanguage`, all labels translated
- [x] Fix Payment.tsx — removed `isAr` ternaries, uses `t()` throughout
- [x] Fix Pricing.tsx — removed local TRANSLATIONS, uses LanguageContext

### Phase 2 — Backend Migration ✅ COMPLETE
Replace Supabase with VPS PostgreSQL:
- [x] Install PostgreSQL on VPS
- [x] Replace `@supabase/supabase-js` with `pg` + connection pool (`src/db/pool.ts`)
- [x] Replace Supabase Auth with custom JWT (bcryptjs + jsonwebtoken)
- [x] Replace Supabase Storage with local disk (`storageService.ts`)
- [x] Updated schema.sql — added `password_hash` to users, added `password_reset_tokens` table
- [x] Updated all service files:
  - `middleware/auth.ts` — custom JWT verify via jsonwebtoken
  - `routes/auth.ts` — bcrypt register/login, token-based password reset
  - `services/storageService.ts` — local disk storage
  - `services/subscriptionService.ts` — pg pool queries
  - `middleware/usageLimiter.ts` — pg pool queries
  - `routes/moodboards.ts`, `routes/redesign.ts`, `routes/payments.ts`, `routes/users.ts` — all pg pool
  - Removed all supabase client instances
- [x] Updated `.env.example` — DATABASE_URL, JWT_SECRET, storage vars

### Phase 3 — UI Polish ✅ PARTIAL
- [x] Real auth state in app — `AuthContext.tsx` with JWT, `useAuth()` hook, Header reads user name/plan/avatar
- [x] Toast notifications system — `Toast.tsx` with `useToast()` hook (success/error/info)
- [x] Add Bathroom to room type options in MoodBoardGenerator and RoomRedesign
- [x] `AuthProvider` + `ToastProvider` wired in `App.tsx`
- [x] Logout button wired to `logout()` in Header + Sidebar
- [ ] Loading skeletons on Dashboard boards grid
- [ ] Mobile layout audit (test all pages on small screen)
- [ ] RTL layout audit (test all pages in Arabic)
- [ ] Make MoodBoardGenerator step-by-step wizard (Steps 1-4)
- [ ] Wire "Save to Dashboard" after generation

### Phase 4 — Feature Additions ✅ MOSTLY COMPLETE
- [ ] Fabric.js canvas editor (replace placeholder canvas in MoodBoardEditor)
- [x] PDF export via `jsPDF` in MoodBoardEditor (dynamic import, falls back to PNG)
- [x] Shareable link page (`/shared/:token`) — public view of a board
- [x] MoodBoardEditor Share button — calls `/api/moodboards/:id/share`, copies URL to clipboard
- [x] MoodBoardEditor Save button — wired to `PUT /api/moodboards/:id`
- [x] MoodBoardGenerator — wired to real `POST /api/moodboards/generate` API
- [x] Dashboard — real board list from `/api/moodboards`, real usage from `/api/subscriptions/usage`
- [x] Login, SignUp, ForgotPassword, ResetPassword — all wired to real API
- [x] Settings — wired to real profile/usage/delete API
- [x] Backend public route `GET /api/shared/:token` added in app.ts
- [ ] Google OAuth (optional, can use email-only first)
- [ ] Admin dashboard for manual payment review
- [ ] n8n workflow setup documentation

---

## 5. Backend Migration: Supabase → VPS PostgreSQL

### New `.env` for Backend

```env
# Database (PostgreSQL on VPS)
DATABASE_URL=postgresql://zabatly_user:password@localhost:5432/zabatly

# Auth
JWT_SECRET=your-64-char-secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Storage
STORAGE_DRIVER=local                     # or 'r2'
STORAGE_LOCAL_PATH=/var/www/zabatly/uploads
STORAGE_BASE_URL=https://api.zabatly.com/uploads

# Cloudflare R2 (if STORAGE_DRIVER=r2)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=zabatly
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# AI
OPENAI_API_KEY=sk-...

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=Zabatly <hello@zabatly.com>

# Payment
INSTAPAY_PHONE=01XXXXXXXXX
VODAFONE_CASH_PHONE=01XXXXXXXXX
```

### Changed Files in Backend

| File | Change |
|---|---|
| `src/app.ts` | Add pg pool setup |
| `src/middleware/auth.ts` | Custom JWT verify (no Supabase) |
| `src/services/storageService.ts` | Local disk or R2 instead of Supabase Storage |
| `src/routes/auth.ts` | bcrypt + JWT instead of Supabase Auth |
| All other routes | Replace `supabase.from(...)` with `pool.query(...)` |
| `package.json` | Remove `@supabase/supabase-js`, add `pg`, `jsonwebtoken`, `bcrypt` |

### Cost Comparison

| | Supabase | VPS PostgreSQL |
|---|---|---|
| DB hosting | $0 (free tier, limited) or $25/mo | $0 (on your VPS) |
| Storage | $0.021/GB | $0 (disk) or $0.015/GB (R2) |
| Auth | $0 | $0 (custom JWT) |
| Real-time | Included | Not needed |
| Vendor lock-in | Yes | None |
| **Total** | **$0–25/mo** | **$0/mo** |

---

## 6. AI Cost Optimization

Current plan uses DALL-E 3 ($0.04/image). For 4 images per board = $0.16/board.

**Cheaper alternatives:**

| Model | Cost/image | Quality |
|---|---|---|
| DALL-E 3 standard | $0.040 | Best |
| DALL-E 2 | $0.020 | Good |
| Replicate SDXL | ~$0.003 | Very good |
| Replicate Flux | ~$0.003 | Excellent |

**Recommendation:** Use **Replicate Flux** for image generation.
- 10x cheaper than DALL-E 3
- Quality comparable or better
- API: `https://api.replicate.com/v1/predictions`
- Cost per mood board (4 images): ~$0.012 instead of $0.16

**Revenue at 39 EGP/month basic plan:**
- 39 EGP ≈ $0.80 USD at current rates
- Cost of 10 mood boards + 5 redesigns: ~$0.18 in AI
- Gross margin: ~$0.62/user/month (~78%)

---

## 7. Summary of Immediate Actions

| Priority | Action | Status |
|---|---|---|
| 🔴 Critical | Fix LandingPage nav key bug | ✅ Done |
| 🔴 Critical | Fix all missing translations (LanguageContext) | ✅ Done |
| 🔴 Critical | Add useLanguage to MoodBoardGenerator + RoomRedesign | ✅ Done |
| 🟠 High | Fix Payment.tsx ternary → t() | ✅ Done |
| 🟠 High | Fix Pricing.tsx local translations → LanguageContext | ✅ Done |
| 🟡 Medium | Wire Settings icon in Header | ✅ Done |
| 🟡 Medium | Fix Pricing nav link → /pricing | ✅ Done |
| 🟡 Medium | Fix Dashboard hardcoded strings | ✅ Done |
| 🔵 Next | Migrate backend from Supabase → VPS PostgreSQL | → Next session |
| 🔵 Next | Switch image gen to Replicate Flux | → Next session |
| 🔵 Next | Real auth state in app (user name from JWT) | → Phase 2 |
| 🔵 Next | Mobile menu for landing page | → Phase 3 |
