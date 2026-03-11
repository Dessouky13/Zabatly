Below is a **Claude-optimized engineering spec** for **Zabatly**.
It’s structured specifically so tools like **Claude**, **OpenAI Codex**, or other coding agents can **implement tasks deterministically without guessing**.

Key goals:

* remove ambiguity
* define exact file targets
* define API contracts
* define expected outputs
* minimize back-and-forth with the AI

You should put this file at:

```
/docs/ENGINEERING_SPEC.md
```

---

# Zabatly — Claude Engineering Specification

**Project:** Zabatly
**Version:** 1.0
**Status:** MVP Pre-Production
**Primary Stack:** React + Node.js + PostgreSQL

---

# 1. Project Overview

Zabatly is an AI-powered interior design platform that allows users to:

1. Generate AI mood boards
2. Redesign rooms from uploaded photos
3. Share generated designs
4. Manage subscriptions

Primary target market:

* Egypt
* newly married couples
* apartment owners

---

# 2. System Architecture

```
User
 │
Cloudflare
 │
Frontend (Vercel)
 │
Backend API (Node.js)
 │
Redis Queue
 │
AI Worker
 │
OpenAI / Flux
 │
PostgreSQL
```

Infrastructure:

Server 1 (Hetzner)

```
Node API
PostgreSQL
Redis
Nginx
```

Server 2 (Hostinger)

```
n8n
automation jobs
email workflows
```

Future server

```
GPU AI worker
Flux image generation
```

---

# 3. Repository Structure

```
zabatly/

frontend/
backend/
docs/

frontend/src/
components/
pages/
services/
hooks/

backend/src/
routes/
services/
middleware/
models/
utils/
jobs/
```

---

# 4. Backend Standards

Language

```
TypeScript
```

Framework

```
Express.js
```

Validation

```
Zod
```

Auth

```
JWT
```

Queue

```
BullMQ
Redis
```

---

# 5. API Standards

All endpoints must:

```
- return JSON
- use HTTP status codes
- use try/catch
- validate input with Zod
```

Standard response format

Success

```
{
  "success": true,
  "data": {}
}
```

Error

```
{
  "success": false,
  "error": "message"
}
```

---

# 6. Authentication

Auth method

```
JWT
```

Header

```
Authorization: Bearer <token>
```

Middleware file

```
backend/src/middleware/auth.ts
```

Responsibilities

```
verify JWT
attach user to request
block unauthenticated access
```

---

# 7. Database Schema

Primary tables

```
users
subscriptions
moodboards
redesigns
payments
```

Each table must include

```
created_at
updated_at
```

UUID primary keys required.

---

# 8. Mood Board Generation Flow

Endpoint

```
POST /api/moodboards/generate
```

Request

```
{
room_type
style
color_preference
prompt
}
```

Backend flow

```
validate request
check subscription usage
enqueue job
generate images
store results
return board data
```

---

# 9. AI Generation Pipeline

Current provider

```
OpenAI
```

Models

```
DALL-E 3
GPT-4o
GPT-4 Vision
```

Future provider

```
Flux
```

Image count

```
4 images per mood board
```

Metadata generation

```
color_palette
materials
furniture_suggestions
```

---

# 10. Room Redesign Pipeline

Endpoint

```
POST /api/redesign/generate
```

Input

```
image file
style
```

Process

```
store uploaded image
send to AI provider
generate 3 variations
store result URLs
return response
```

---

# 11. Payment Verification

Supported methods

```
InstaPay
Vodafone Cash
```

Flow

```
upload screenshot
run OCR
extract transaction data
validate payment
activate subscription
```

OCR model

```
GPT-4 Vision
```

Validation rules

```
transaction id unique
amount matches plan
timestamp within 48 hours
receiver phone matches config
```

---

# 12. Subscription Logic

Plans

```
free
basic
premium
```

Limits

```
free
2 boards
1 redesign

basic
10 boards
5 redesigns

premium
unlimited
```

Usage tracked in

```
subscriptions table
```

---

# 13. Storage

Current

```
local disk
```

Directory

```
/var/www/zabatly/uploads
```

Structure

```
public/
avatars
moodboard-images
redesign-images

private/
payment-screenshots
```

Future

```
Cloudflare R2
```

---

# 14. Frontend Standards

Framework

```
React
Vite
TypeScript
```

Styling

```
Tailwind
```

State

```
React hooks
```

HTTP

```
Axios
```

---

# 15. Frontend Pages

Routes

```
/
landing

/login
/signup

/dashboard

/generate/moodboard

/redesign

/editor/:id

/settings

/pricing

/payment
```

---

# 16. Required Components

Reusable components

```
UploadZone
BeforeAfterSlider
MoodBoardGrid
PlanCard
UsageBar
LoadingSpinner
```

All components must

```
support RTL
support EN/AR
```

---

# 17. i18n Requirements

Languages

```
English
Arabic
```

Context

```
LanguageContext
```

Rules

```
all UI text must use translation keys
no hardcoded strings
```

---

# 18. Security Requirements

Backend

```
helmet
rate limiting
input validation
JWT expiry
```

File uploads

```
max size 10MB
mime validation
store private files outside public path
```

Payments

```
duplicate transaction detection
manual review fallback
```

---

# 19. Logging

Use structured logging.

File

```
backend/src/utils/logger.ts
```

Log events

```
auth
generation
payments
errors
```

---

# 20. Deployment

Frontend

```
Vercel
```

Backend

```
Hetzner VPS
PM2
Nginx
```

Automation

```
Hostinger VPS
n8n
```

Future AI

```
RunPod GPU worker
```

---

# 21. Performance Rules

API request timeout

```
10 seconds
```

AI generation handled async via queue.

Cache strategy

```
Redis
```

---

# 22. Coding Rules (Important for Claude)

When modifying code Claude must:

1. never change unrelated files
2. keep TypeScript types strict
3. preserve existing folder structure
4. update imports if files move
5. write modular functions
6. avoid breaking existing APIs

---

# 23. Task Format for Claude

When assigning tasks use this format:

```
TASK:
Implement RoomRedesign API integration

FILES:
frontend/src/pages/RoomRedesign.tsx
backend/src/routes/redesign.ts

REQUIREMENTS:
- upload image
- send request to /api/redesign/generate
- show loading spinner
- display result images
```

This format produces the **best results with Claude Code**.

---

# 24. Testing Requirements

Before merge ensure

```
auth works
generation works
payment verification works
dashboard loads
share links work
```

Smoke test commands

```
curl /health
curl /api/auth/login
curl /api/moodboards
```

---

# 25. MVP Launch Scope

Must be working

```
authentication
mood board generation
dashboard
payment verification
share links
```

Not required for launch

```
editor
marketplace
mobile app
```

---

# 26. Post-Launch Improvements

Phase 1

```
room redesign
editor
google oauth
```

Phase 2

```
flux image generation
R2 storage
public gallery
```

Phase 3

```
designer marketplace
furniture affiliate links
mobile apps
```

---

# 27. Success Criteria

Launch target

```
100 users
20 paying subscribers
```

Technical metrics

```
<2s API latency
<30s generation time
<1% error rate
```

---

✅ If you want, I can also generate a **`CLAUDE_TASKS.md` backlog** (50+ tasks formatted so Claude Code can implement the entire startup automatically).
