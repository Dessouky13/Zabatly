# Zabatly — Master Project Plan (CLAUDE.md)

---

## 1. Project Overview

**Product:** Zabatly (ظبطلي)
**Tagline EN:** Design your home before you furnish it
**Tagline AR:** ظبط شقتك قبل ما تفرشها

Zabatly is an AI-powered interior design platform targeting Egyptian homeowners — primarily newly married couples, first-time apartment buyers, and people furnishing or renovating their homes. It enables users to generate AI mood boards, redesign existing rooms using photos, and collaborate with an interactive canvas editor — all without needing a professional designer.

The tone is friendly, modern, premium, and approachable. Design inspiration: Pinterest + Airbnb + Apple.

---

## 2. Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 6 |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS v4 |
| Animations | Motion (Framer Motion) |
| Icons | Lucide React |
| Canvas Editor | Fabric.js or Konva.js |
| i18n | Custom LanguageContext (EN/AR) |
| PDF Export | jsPDF + html2canvas |
| HTTP Client | Axios or native fetch |
| TypeScript | ~5.8 |
| Deployment | Vercel |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express.js |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage (S3-compatible) |
| Auth | Supabase Auth (JWT) |
| AI: Images | OpenAI DALL-E 3 + Replicate (Stable Diffusion) |
| AI: OCR | OpenAI GPT-4 Vision |
| AI: Text | OpenAI GPT-4o |
| Automation | n8n (self-hosted) |
| Email | Resend or SendGrid |
| Validation | Zod |
| Deployment | Private VPS (Ubuntu) + PM2 + Nginx |

---

## 3. Project Structure

```
zabatly/
├── CLAUDE.md                    # This file — master plan
├── README.md                    # Getting started guide
├── frontend/                    # React + Vite app
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── context/
│       │   └── LanguageContext.tsx   # EN/AR i18n + RTL
│       ├── components/
│       │   ├── Layout.tsx            # Sidebar, Header, Button, Card
│       │   ├── Logo.tsx
│       │   ├── AuthLayout.tsx
│       │   ├── Input.tsx
│       │   ├── StylePresetPicker.tsx  # NEW
│       │   ├── ColorPalettePicker.tsx # NEW
│       │   ├── UploadZone.tsx         # NEW
│       │   ├── MoodBoardGrid.tsx      # NEW
│       │   ├── BeforeAfterSlider.tsx  # NEW
│       │   ├── PlanCard.tsx           # NEW
│       │   ├── UsageBar.tsx           # NEW
│       │   ├── LanguageToggle.tsx     # NEW
│       │   └── LoadingSpinner.tsx     # NEW
│       ├── pages/
│       │   ├── LandingPage.tsx        # EXISTS — enhance
│       │   ├── Login.tsx              # EXISTS — enhance
│       │   ├── SignUp.tsx             # EXISTS — enhance
│       │   ├── ForgotPassword.tsx     # EXISTS — enhance
│       │   ├── Dashboard.tsx          # EXISTS — enhance
│       │   ├── MoodBoardGenerator.tsx # EXISTS — enhance
│       │   ├── RoomRedesign.tsx       # EXISTS — enhance
│       │   ├── MoodBoardEditor.tsx    # NEW
│       │   ├── Pricing.tsx            # NEW
│       │   ├── Payment.tsx            # NEW
│       │   └── Settings.tsx           # NEW
│       └── utils/
│           └── cn.ts
│
└── backend/                     # Node.js + Express API
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── README.md
    └── src/
        ├── app.ts
        ├── routes/
        │   ├── auth.ts
        │   ├── moodboards.ts
        │   ├── redesign.ts
        │   ├── payments.ts
        │   ├── subscriptions.ts
        │   └── users.ts
        ├── services/
        │   ├── aiService.ts
        │   ├── ocrService.ts
        │   ├── storageService.ts
        │   ├── emailService.ts
        │   └── subscriptionService.ts
        ├── middleware/
        │   ├── auth.ts
        │   ├── rateLimiter.ts
        │   └── usageLimiter.ts
        ├── models/
        │   └── schema.sql
        └── utils/
            ├── promptBuilder.ts
            └── paymentVerifier.ts
```

---

## 4. Frontend Plan

### Current State Audit

**What exists and works:**
- ✅ React 19 + Vite + TypeScript + Tailwind v4 setup
- ✅ React Router DOM v7 routing
- ✅ LanguageContext with EN/AR translations + RTL switching
- ✅ LandingPage — hero, how-it-works, gallery, pricing section, testimonials, footer
- ✅ Dashboard — sidebar nav, header, stats cards, recent projects grid
- ✅ MoodBoardGenerator — room type selector, style dropdown, color picker, prompt textarea, mood board grid, color palette, materials
- ✅ RoomRedesign — upload zone UI, before/after slider, style variation cards
- ✅ Login, SignUp, ForgotPassword — basic forms with bilingual support
- ✅ Button, Card, Sidebar, Header shared components
- ✅ Logo, AuthLayout, Input components
- ✅ Motion animations throughout
- ✅ Brand colors partially applied (--color-primary: #c96a4a, --color-background-light: #f5f1ed)

**What is missing or incomplete:**
- ❌ Pricing page (standalone `/pricing` route)
- ❌ Payment flow page (`/payment`)
- ❌ Settings/Profile page (`/settings`)
- ❌ Mood Board Editor with canvas (`/editor/:id`)
- ❌ No actual API integration — all data is static/hardcoded
- ❌ No authentication state management (no real login/logout flow)
- ❌ No usage tracking / subscription awareness in UI
- ❌ Pricing in mockup uses 499/1499 EGP — PRD specifies Free/39/79 EGP
- ❌ No UploadZone component (only inline UI in RoomRedesign)
- ❌ No BeforeAfterSlider component (only inline in RoomRedesign)
- ❌ Missing translations for many new pages/components
- ❌ No loading states for AI generation (just static display)
- ❌ No export/PDF functionality wired up
- ❌ Mobile menu exists but mobile layout needs full testing
- ❌ RTL layout needs testing for all pages
- ❌ vite.config.ts needs path alias for `@/` to work properly

### Enhancement Plan

#### LandingPage (`/`)
- Fix pricing to match PRD: Free / Basic 39 EGP / Premium 79 EGP
- Add "Start Designing Free" as primary CTA
- Add feature highlight cards for mood board, room redesign, editor
- Add payment method logos (InstaPay, Vodafone Cash) in pricing section
- Add "Pay per design" option mention
- Fix nav links to use proper translation keys
- Add mobile-first responsive testing

#### Auth Pages
- Add Google OAuth button (UI only, wired to backend later)
- Improve form validation feedback
- Add language toggle to auth screens

#### Dashboard
- Add real usage bar (boards used / plan limit)
- Add upgrade CTA banner for free users
- Add "New Room Redesign" quick action button
- Wire "New Mood Board" to `/generate/moodboard`
- Show subscription plan badge

#### MoodBoardGenerator
- Add step-by-step wizard UI (4 steps)
- Add Bathroom room type option
- Add style preset visual picker (not just dropdown)
- Add loading state when generating
- Add "Save to Dashboard" button
- Add i18n translations
- Wire to backend API

#### RoomRedesign
- Extract BeforeAfterSlider into reusable component
- Extract UploadZone into reusable component
- Add loading animation during generation
- Wire to backend API

### New Pages & Components to Build

**Pages:**
1. `/pricing` — Standalone pricing page with plan comparison table
2. `/payment` — Payment flow with InstaPay/Vodafone Cash instructions + screenshot upload
3. `/settings` — Profile, subscription status, usage stats, language preference
4. `/editor/:id` — Canvas editor using Fabric.js

**Components:**
1. `StylePresetPicker` — Grid of style cards with preview images
2. `ColorPalettePicker` — Color swatch selector
3. `UploadZone` — Drag-and-drop with preview
4. `MoodBoardGrid` — Masonry/grid layout for generated images
5. `BeforeAfterSlider` — Reusable comparison slider
6. `PlanCard` — Pricing plan display card
7. `UsageBar` — Progress bar showing usage vs. limit
8. `LanguageToggle` — Standalone toggle button component
9. `LoadingSpinner` — Branded spinner with Zabatly logo

### Design System

**Colors:**
```css
--color-beige:      #F5EFE6   /* Background light */
--color-terracotta: #C9704A   /* Primary brand */
--color-white:      #FAFAFA   /* Surface */
--color-charcoal:   #1A1A1A   /* Text dark */
--color-primary:    #C96A4A   /* Current -- close enough */
```

**Typography:**
- EN: Manrope (already imported)
- AR: Cairo (already imported)
- Display: Manrope Black (900) for headlines
- Body: Manrope Regular (400) / Medium (500)

**Spacing:** 4px base unit, Tailwind scale
**Border Radius:** Rounded corners at 1rem–1.5rem for cards, 9999px for pills
**Shadows:** Soft, layered — `shadow-sm` for cards, `shadow-xl` for elevated
**Animations:** Motion for enter/exit, subtle hover scale, no jarring transitions

### Bilingual Support (Arabic + English)

- LanguageContext already handles EN/AR switching
- `document.documentElement.dir` set to `rtl`/`ltr` on change
- All new pages must add translations to LanguageContext for both languages
- RTL-aware layout: use `ltr:` and `rtl:` Tailwind variants where needed
- Font switches automatically via `[dir="rtl"]` CSS rule → Cairo font

---

## 5. Backend Plan

### Architecture Overview

```
Client (React) → HTTPS → Express API → Supabase (DB + Storage)
                                     → OpenAI API (AI generation, OCR)
                                     → Replicate API (Image generation)
                                     → n8n (Automation workflows)
                                     → Resend (Email notifications)
```

All API routes are prefixed with `/api/`.
Auth is JWT-based via Supabase Auth — tokens passed as `Authorization: Bearer <token>`.
Rate limiting applied at middleware level.
Input validation with Zod on all endpoints.

### API Endpoints (Full List)

#### Auth
```
POST   /api/auth/register          — Register new user (email + password)
POST   /api/auth/login             — Login, returns JWT
POST   /api/auth/logout            — Invalidate session
GET    /api/auth/me                — Get current user from JWT
POST   /api/auth/google            — Google OAuth callback
POST   /api/auth/forgot-password   — Send reset email
POST   /api/auth/reset-password    — Confirm reset with token
```

#### Mood Boards
```
POST   /api/moodboards/generate    — Trigger AI generation (room, style, color, prompt)
GET    /api/moodboards             — List user's boards (paginated)
GET    /api/moodboards/:id         — Get single board
PUT    /api/moodboards/:id         — Update board (title, canvas_data)
DELETE /api/moodboards/:id         — Delete board
POST   /api/moodboards/:id/export  — Export as PDF or image (returns URL)
POST   /api/moodboards/:id/share   — Generate shareable link
```

#### Room Redesign
```
POST   /api/redesign/generate      — Upload image + style → AI redesign
GET    /api/redesign               — List user's redesigns
GET    /api/redesign/:id           — Get single redesign
DELETE /api/redesign/:id           — Delete redesign
```

#### Payments
```
POST   /api/payments/upload-screenshot   — Upload payment screenshot for OCR
GET    /api/payments/status/:txId        — Check verification status
GET    /api/payments/history             — User's payment history
```

#### Subscriptions
```
GET    /api/subscriptions/current        — Current plan + status
POST   /api/subscriptions/activate       — Activate plan after payment verified
GET    /api/subscriptions/usage          — Boards used, redesigns used, limits
```

#### Users
```
GET    /api/users/profile               — Get profile
PUT    /api/users/profile               — Update name, avatar
PUT    /api/users/language              — Set language preference (en/ar)
DELETE /api/users/account               — Delete account
```

### Database Schema

```sql
-- Users table (mirrors Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ar')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'basic', 'premium')),
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  boards_used INT DEFAULT 0,
  redesigns_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plan limits reference (not a DB table, kept in code)
-- free:    boards=2,  redesigns=1,  watermark=true,  hd=false
-- basic:   boards=10, redesigns=5,  watermark=false, hd=true   (39 EGP/mo)
-- premium: boards=-1, redesigns=-1, watermark=false, hd=true   (79 EGP/mo)

-- Mood Boards
CREATE TABLE moodboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Untitled Board',
  room_type TEXT,
  style TEXT,
  color_preference TEXT,
  prompt TEXT,
  generated_images JSONB DEFAULT '[]',
  color_palette JSONB DEFAULT '[]',
  materials JSONB DEFAULT '[]',
  furniture_suggestions JSONB DEFAULT '[]',
  canvas_data JSONB,
  is_watermarked BOOLEAN DEFAULT TRUE,
  share_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Room Redesigns
CREATE TABLE redesigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  original_image_url TEXT NOT NULL,
  style TEXT,
  result_images JSONB DEFAULT '[]',
  is_watermarked BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  plan TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('instapay', 'vodafone_cash')),
  transaction_id TEXT UNIQUE,
  screenshot_url TEXT NOT NULL,
  ocr_result JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'manual_review')),
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_moodboards_user ON moodboards(user_id);
CREATE INDEX idx_redesigns_user ON redesigns(user_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_txid ON payments(transaction_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
```

### AI Integration

#### Mood Board Generation
1. Receive: `room_type`, `style`, `color_preference`, `custom_prompt`
2. Build prompt with `promptBuilder.ts`:
   ```
   "Create a photorealistic interior design mood board for a {room_type} in {style} style.
    Color palette dominated by {color_preference} tones.
    {custom_prompt}
    The image should feel editorial, warm, and premium. Egyptian home aesthetic."
   ```
3. Call DALL-E 3 for 4 images (or Replicate Stable Diffusion XL for cost efficiency)
4. Call GPT-4o to generate structured JSON:
   ```json
   {
     "color_palette": [{"hex": "#...", "name": "..."}],
     "materials": ["Oak Wood", "Linen", "Travertine"],
     "furniture_suggestions": [{"item": "Sofa", "style": "low-profile", "material": "linen"}]
   }
   ```
5. Store images to Supabase Storage, save URLs + metadata to DB
6. Return full board data to frontend

#### Room Redesign
1. Accept uploaded room photo → store to Supabase Storage
2. Use Replicate ControlNet (canny or depth) or OpenAI image edit API
3. Build prompt: `"Transform this room into {style} style. Keep architectural structure. Egyptian home, warm lighting."`
4. Return 3 variations
5. Apply watermark if free plan

#### Payment OCR
- Send screenshot to GPT-4 Vision:
  ```
  "This is an Egyptian mobile payment screenshot (InstaPay or Vodafone Cash).
   Extract: transaction_id, amount_egp (number only), receiver_phone, date_time (ISO format).
   Return ONLY valid JSON: { transaction_id, amount_egp, receiver_phone, date_time }"
  ```
- Validate extracted data in `paymentVerifier.ts`

### Payment Verification System

**Fraud Prevention Rules (paymentVerifier.ts):**
1. `transaction_id` must not exist in `payments` table (no duplicates)
2. `amount_egp` must match expected plan price (39 or 79 EGP, ±1 EGP tolerance for rounding)
3. `receiver_phone` must match configured INSTAPAY_PHONE or VODAFONE_PHONE env var
4. `date_time` must be within last 48 hours (prevents old screenshot reuse)
5. OCR confidence: if GPT returns `null` for any field → flag for `manual_review`
6. Max 3 failed payment attempts per user per day (rate limit)

**Verification flow:**
```
Upload screenshot
  → Store to private Supabase Storage bucket
  → Call ocrService (GPT-4 Vision)
  → Run paymentVerifier checks
  → If valid: status=verified → activate subscription → email user
  → If invalid: status=rejected → return specific error
  → If uncertain: status=manual_review → notify admin → manual check
```

### n8n Automation Workflows

1. **Mood Board AI Pipeline**
   - Trigger: POST to `/api/moodboards/generate`
   - n8n webhook → call OpenAI → call DALL-E 3 (4x) → upload to Supabase → update DB → notify frontend via callback

2. **Payment OCR Pipeline**
   - Trigger: POST to `/api/payments/upload-screenshot`
   - n8n webhook → GPT-4 Vision OCR → verify logic → activate subscription → send confirmation email → update DB

3. **Usage Tracking**
   - Trigger: After each AI generation (mood board or redesign)
   - Increment counter in subscriptions table → check if at limit → if at limit, add upgrade flag to user session

4. **Email Notifications**
   - Welcome email on registration (Resend template)
   - Payment confirmed email (with plan details)
   - Subscription expiry warning (7 days before)
   - Subscription expired notice

5. **Admin Alert**
   - Trigger: payment status = `manual_review`
   - Send email/Telegram alert to admin with screenshot URL and extracted OCR data

### Storage Strategy

**Supabase Storage Buckets:**
- `moodboard-images/` — public bucket, generated mood board images
  - Path: `{user_id}/{moodboard_id}/{image_index}.jpg`
- `redesign-images/` — public bucket
  - Path: `{user_id}/{redesign_id}/original.jpg` and `result_{n}.jpg`
- `payment-screenshots/` — private bucket (admin only)
  - Path: `{user_id}/{payment_id}/screenshot.jpg`
- `avatars/` — public bucket
  - Path: `{user_id}/avatar.jpg`

---

## 6. Implementation Phases

### Phase 1 — MVP (Current Focus)

**Frontend:**
- [x] Move mockup to `frontend/`
- [ ] Fix Tailwind v4 path aliases (`@/src/` → `@/`)
- [ ] Fix pricing section (Free / 39 EGP / 79 EGP)
- [ ] Add missing pages: Pricing, Payment, Settings, Editor
- [ ] Build missing components: StylePresetPicker, UploadZone, BeforeAfterSlider, PlanCard, UsageBar, LanguageToggle, LoadingSpinner
- [ ] Add i18n keys for all new pages
- [ ] Wire routes in App.tsx
- [ ] Add loading states for AI generation UI
- [ ] Mobile layout QA

**Backend:**
- [ ] Initialize Node.js + Express + TypeScript project
- [ ] Connect Supabase (DB + Auth + Storage)
- [ ] Implement all auth routes
- [ ] Implement mood board routes (generate + CRUD)
- [ ] Implement room redesign routes
- [ ] Implement payment screenshot upload + OCR
- [ ] Implement subscription activation
- [ ] Write DB schema (schema.sql)
- [ ] Add Zod validation on all routes
- [ ] Add JWT auth middleware
- [ ] Add rate limiter
- [ ] Add usage limiter middleware
- [ ] Write .env.example

### Phase 2 — Post-MVP

- [ ] Mood Board Canvas Editor (Fabric.js integration)
- [ ] PDF/Image export with jsPDF
- [ ] Shareable board links
- [ ] Google OAuth integration
- [ ] Admin dashboard for manual payment review
- [ ] n8n workflow setup
- [ ] Email notification templates
- [ ] Watermarking for free plan exports
- [ ] Paymob / Fawry payment integration
- [ ] PWA support

### Phase 3 — Marketplace

- [ ] Designer marketplace (professionals offering services)
- [ ] Public gallery of AI-generated rooms
- [ ] Community features (likes, comments, saves)
- [ ] Furniture shopping links (affiliate)
- [ ] 3D room viewer
- [ ] API for interior design companies

---

## 7. Environment Variables

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:4000
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

### Backend (`backend/.env`)
```
# Server
PORT=4000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...

# OpenAI
OPENAI_API_KEY=sk-...

# Replicate (alternative image gen)
REPLICATE_API_TOKEN=r8_...

# Payment verification
INSTAPAY_PHONE=01XXXXXXXXX
VODAFONE_CASH_PHONE=01XXXXXXXXX
INSTAPAY_ACCOUNT_NAME=Zabatly

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=hello@zabatly.com

# n8n
N8N_WEBHOOK_SECRET=your-secret-token
N8N_MOODBOARD_WEBHOOK=https://n8n.yourdomain.com/webhook/moodboard
N8N_PAYMENT_WEBHOOK=https://n8n.yourdomain.com/webhook/payment

# Security
JWT_SECRET=your-super-secret-jwt-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## 8. Deployment Plan

### Frontend → Vercel
1. Push `frontend/` to GitHub
2. Connect Vercel to GitHub repo, set root to `frontend/`
3. Add all `VITE_*` env vars in Vercel dashboard
4. Set build command: `npm run build`, output: `dist/`
5. Configure custom domain `zabatly.com`

### Backend → Private VPS
1. Provision Ubuntu 22.04 VPS (DigitalOcean / Hetzner)
2. Install Node.js 20+, PM2, Nginx
3. Clone repo, `cd backend`, `npm install`, copy `.env`
4. Start: `pm2 start dist/app.js --name zabatly-api`
5. Configure Nginx reverse proxy:
   ```nginx
   location /api/ {
     proxy_pass http://localhost:4000;
   }
   ```
6. SSL via Certbot (Let's Encrypt)

### n8n → Self-hosted
1. Install n8n on same VPS or separate instance
2. Configure via Docker: `docker run -d -p 5678:5678 n8nio/n8n`
3. Import workflow JSON files
4. Set webhook URLs in backend `.env`

---

## 9. Security Checklist

### Authentication
- [ ] JWT tokens expire after 7 days; refresh tokens for sessions
- [ ] Google OAuth state parameter validated to prevent CSRF
- [ ] Passwords hashed by Supabase Auth (bcrypt)
- [ ] Rate limit auth endpoints: 5 attempts/minute

### Payment Fraud Prevention
- [ ] Duplicate transaction ID check (DB unique constraint + code check)
- [ ] Phone number match against env var (not DB)
- [ ] Amount tolerance ±1 EGP only
- [ ] Timestamp within 48 hours
- [ ] Max 3 payment attempts per user per day
- [ ] Screenshots stored in private bucket — never publicly accessible
- [ ] Admin manual review workflow for ambiguous OCR results

### API Security
- [ ] All routes require JWT except public endpoints
- [ ] Input sanitization with Zod on all endpoints
- [ ] SQL injection prevented by Supabase parameterized queries
- [ ] File upload validation: MIME type check + max 10MB
- [ ] CORS configured to allow only frontend domain
- [ ] Helmet.js for HTTP security headers
- [ ] Rate limiting on all routes (express-rate-limit)

### Storage
- [ ] Payment screenshots in private Supabase bucket (no public URL)
- [ ] User files namespaced by user_id (prevents path traversal)
- [ ] Generated images have expiring signed URLs for watermarked content

### Frontend
- [ ] No API keys exposed in client-side code
- [ ] XSS prevention via React's default escaping
- [ ] Content Security Policy headers set by Vercel

---

## 10. Brand & Design Notes

**Primary Color:** `#C9704A` (terracotta — warm, earthy)
**Background:** `#F5EFE6` (warm beige — soft, inviting)
**Surface:** `#FAFAFA` (near-white)
**Text:** `#1A1A1A` (soft charcoal, not harsh black)

**Do:** Rounded corners everywhere, generous whitespace, warm photography, editorial feel
**Don't:** Cold blues, harsh grays, dense text, cluttered layouts

**RTL Notes:**
- All flex rows reverse in RTL
- Text alignment flips
- Icons that are directional (arrows, chevrons) must use `rtl:rotate-180` or `rtl:scale-x-[-1]`
- Cairo font auto-applied via `[dir="rtl"]` CSS selector
