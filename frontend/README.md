# FoundIt

A lost & found community platform built with Next.js 14 (App Router), TypeScript, and Tailwind CSS.

## Features included

- **Landing page** with live stats and a "how it works" section
- **Login / Signup** (mock auth, persisted to `localStorage`)
- **Lost items** and **Found items** listing pages with search + category filters
- **Report page** with two columns — report a lost item / report a found item
- **Item detail page** — full report view, "message reporter", "mark as resolved" (+50 karma)
- **Karma page** — points balance, badges, history, and a community leaderboard
- **Chat page** — per-item conversation threads with a live message composer
- **Dashboard** — personal summary of karma, open reports, and resolved items

All data (users, items, karma, chat) is currently mocked and stored in the browser via `localStorage`
through `context/AppContext.tsx`, so the app is fully clickable without a backend. To go to
production, swap the functions inside `AppContext.tsx` (`login`, `signup`, `addItem`, `sendMessage`, etc.)
for real API calls to your backend/database (e.g. Postgres + Prisma, Supabase, or Firebase), and move
password handling to a real auth provider — never store plaintext passwords as this demo does.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Demo login: `priya@example.com` / `password123`

## Project structure

```
app/
  page.tsx                → landing page
  login/page.tsx          → login
  signup/page.tsx         → signup
  lost-items/page.tsx     → lost items list (+ shared Filters/EmptyState)
  found-items/page.tsx    → found items list
  report/page.tsx         → two-column report form
  item/[id]/page.tsx      → item detail, messaging, resolve
  karma/page.tsx          → karma points, badges, leaderboard
  chat/page.tsx           → conversations + message thread
  dashboard/page.tsx      → personal summary
components/               → Navbar, Footer, ItemCard, badges
context/AppContext.tsx    → mock backend (auth, items, chat, karma) via localStorage
lib/types.ts              → shared TypeScript types
lib/mockData.ts           → seed data
```

## Suggested next steps

- Replace the mock `AppContext` with real API routes / a database
- Add image upload for item photos (currently emoji placeholders)
- Add push/email notifications when a possible match is found
- Add admin moderation tools for flagged reports
