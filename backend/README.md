# Zabatly Backend API

Node.js + Express + TypeScript REST API for the Zabatly interior design platform.

## Quick Start

```bash
cd backend
cp .env.example .env    # Fill in all required values
npm install
npm run dev             # Development with hot-reload (tsx watch)
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server with hot-reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run lint` | TypeScript type check |

## API Base URL

Development: `http://localhost:4000`

## Endpoints Summary

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login → returns JWT |
| POST | `/api/auth/logout` | Invalidate session |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Send reset link |

### Mood Boards
| Method | Path | Description |
|---|---|---|
| POST | `/api/moodboards/generate` | Generate AI mood board |
| GET | `/api/moodboards` | List user's boards |
| GET | `/api/moodboards/:id` | Get single board |
| PUT | `/api/moodboards/:id` | Update board |
| DELETE | `/api/moodboards/:id` | Delete board |
| POST | `/api/moodboards/:id/share` | Generate shareable link |

### Room Redesign
| Method | Path | Description |
|---|---|---|
| POST | `/api/redesign/generate` | Upload image → AI redesign |
| GET | `/api/redesign` | List user's redesigns |
| GET | `/api/redesign/:id` | Get single redesign |

### Payments
| Method | Path | Description |
|---|---|---|
| POST | `/api/payments/upload-screenshot` | Upload + OCR verify payment |
| GET | `/api/payments/status/:txId` | Check payment status |
| GET | `/api/payments/history` | Payment history |

### Subscriptions
| Method | Path | Description |
|---|---|---|
| GET | `/api/subscriptions/current` | Current plan + status |
| GET | `/api/subscriptions/usage` | Usage counters + limits |

### Users
| Method | Path | Description |
|---|---|---|
| GET | `/api/users/profile` | Get profile |
| PUT | `/api/users/profile` | Update name/avatar |
| PUT | `/api/users/language` | Set language (en/ar) |
| DELETE | `/api/users/account` | Delete account |

## Database Setup

1. Create a Supabase project at https://supabase.com
2. Open the SQL Editor and run `src/models/schema.sql`
3. Create Storage buckets: `moodboard-images`, `redesign-images`, `avatars` (public), `payment-screenshots` (private)

## Authentication

All protected routes require a JWT in the `Authorization` header:
```
Authorization: Bearer <supabase_access_token>
```

## Production Deployment (VPS)

```bash
npm run build
pm2 start dist/app.js --name zabatly-api
pm2 save
pm2 startup
```

Nginx config:
```nginx
server {
    listen 443 ssl;
    server_name api.zabatly.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```
