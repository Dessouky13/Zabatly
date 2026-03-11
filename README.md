# Zabatly | ظبطلي

**Design your home before you furnish it**
**ظبط شقتك قبل ما تفرشها**

AI-powered interior design platform for Egyptian homeowners. Generate mood boards, redesign rooms with AI, and plan your home before you buy a single piece of furniture.

---

## Project Structure

```
zabatly/
├── CLAUDE.md          ← Master project plan (read this!)
├── README.md          ← This file
├── frontend/          ← React + Vite + Tailwind frontend
└── backend/           ← Node.js + Express + TypeScript API
```

---

## Running Locally

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # Set VITE_API_URL=http://localhost:4000
npm run dev            # → http://localhost:3000
```

### Backend

```bash
cd backend
npm install
cp .env.example .env   # Fill in Supabase, OpenAI keys etc.
npm run dev            # → http://localhost:4000
```

---

## Environment Variables

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL (e.g. `http://localhost:4000`) |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (for Google login) |

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 4000) |
| `FRONTEND_URL` | Frontend URL for CORS (e.g. `https://zabatly.com`) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (secret!) |
| `OPENAI_API_KEY` | OpenAI API key (for DALL-E 3 + GPT-4o) |
| `INSTAPAY_PHONE` | InstaPay phone number for payment verification |
| `VODAFONE_CASH_PHONE` | Vodafone Cash phone for payment verification |
| `PLAN_PRICE_BASIC` | Basic plan price in EGP (default: 39) |
| `PLAN_PRICE_PREMIUM` | Premium plan price in EGP (default: 79) |
| `RESEND_API_KEY` | Resend API key for emails |
| `JWT_SECRET` | Secret for JWT signing (min 64 chars) |

See `backend/.env.example` for the complete list.

---

## Pages & Routes

### Public
| Route | Description |
|---|---|
| `/` | Landing page |
| `/pricing` | Pricing plans |
| `/login` | Login |
| `/signup` | Register |

### App (requires auth)
| Route | Description |
|---|---|
| `/dashboard` | User's boards + stats |
| `/mood-boards` | AI Mood Board Generator |
| `/redesign` | AI Room Redesign |
| `/editor/:id` | Canvas mood board editor |
| `/payment` | Payment flow (InstaPay/Vodafone Cash) |
| `/settings` | Profile + subscription management |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, TypeScript |
| Routing | React Router DOM v7 |
| Animations | Motion (Framer Motion) |
| Backend | Node.js, Express, TypeScript |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Auth | Supabase Auth (JWT) |
| AI Images | OpenAI DALL-E 3 |
| AI Text/OCR | OpenAI GPT-4o Vision |
| Email | Resend |
| Automation | n8n (self-hosted) |
| Deploy FE | Vercel |
| Deploy BE | Private VPS (Ubuntu + PM2 + Nginx) |

---

## Database Setup

1. Create a Supabase project
2. Go to SQL Editor → paste contents of `backend/src/models/schema.sql` → Run
3. Create Storage buckets:
   - `moodboard-images` (public)
   - `redesign-images` (public)
   - `avatars` (public)
   - `payment-screenshots` (private)

---

## Deployment

### Frontend → Vercel

1. Push repo to GitHub
2. Import project in Vercel — set root to `frontend/`
3. Add environment variables in Vercel dashboard
4. Deploy

### Backend → VPS

```bash
# On your VPS
git clone <repo>
cd zabatly/backend
npm install && npm run build
cp .env.example .env  # Fill in values
pm2 start dist/app.js --name zabatly-api
pm2 save && pm2 startup
```

Configure Nginx to proxy `api.zabatly.com` → `localhost:4000`. See `backend/README.md`.

### n8n → Self-hosted

```bash
docker run -d \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  --name n8n \
  n8nio/n8n
```

Import workflow JSONs and configure webhook URLs in backend `.env`.

---

## Pricing

| Plan | Price | Mood Boards | Redesigns | Exports |
|---|---|---|---|---|
| Free | 0 EGP | 2 | 1 | Watermarked |
| Basic | 39 EGP/mo | 10 | 5 | HD |
| Premium | 79 EGP/mo | Unlimited | Unlimited | HD Priority |
| Pay-per-use | — | 10 EGP each | 15 EGP each | HD |

**Payment:** InstaPay or Vodafone Cash — upload screenshot → AI OCR verification → instant activation.

---

## Security Notes

- Never commit `.env` files
- Payment screenshots stored in **private** Supabase Storage bucket
- All API keys in environment variables only
- Rate limiting on auth (5/min) and payment (3/day) endpoints
- Payment verification checks: duplicate TX, amount match, phone match, timestamp validity

---

## Brand

- **Primary:** `#C9704A` (terracotta)
- **Background:** `#F5EFE6` (warm beige)
- **Surface:** `#FAFAFA` (soft white)
- **Text:** `#1A1A1A` (charcoal)
- **Fonts EN:** Manrope | **Fonts AR:** Cairo
- **Bilingual:** Full Arabic (RTL) + English support

---

## Contributing

See `CLAUDE.md` for the full project plan, architecture decisions, and implementation phases.
