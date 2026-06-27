# zeeheal — app demo (PWA)

A clickable demo of the zeeheal client app and nutritionist dashboard, built as a PWA so it can be opened and "installed" directly from a phone browser. All data is static/mock — nothing is saved permanently, this is for visual review only.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it will redirect to the login screen.

## Deploying to Vercel

1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → import the repo
3. Leave all settings default (Next.js is auto-detected) → Deploy
4. Open the deployed link on your phone → tap browser menu → "Add to home screen"

## How the demo works

- The login screen has two buttons: **Continue as client** and **Continue as Zainab**. Both lead into the same app, just different views — there's no real authentication.
- **Client view**: Home (today's plan, water, streak), Plan (full week), Progress (charts), Chat.
- **Nutritionist view**: Clients (dashboard + flags), client detail (history, notes), Plan templates, Inbox.
- Tapping a meal as "done", logging water, or sending a chat message updates the screen instantly (in memory) but resets on page refresh, since there's no backend yet.
- All mock data lives in `lib/mock-data/` — edit those files to change client names, meals, chat content, etc. without touching any UI code.

## Project structure

```
app/
  login/              shared entry point, switches between client/nutritionist view
  (client)/            client-facing screens (route group, maps to /, /plan, /progress, /chat)
  (nutritionist)/      nutritionist-facing screens (/dashboard, /client/[id], /plan-builder, /inbox)
components/
  ui/                  shared Button, Card, Pill
  client/              client-side bottom nav
  nutritionist/        nutritionist-side bottom nav
lib/
  mock-data/           static demo data (clients, plans, messages)
  store.ts             in-memory state (zustand) for interactivity without a backend
```

## Next steps (when ready to go beyond the demo)

This is intentionally a frontend-only shell. To turn it into the real product:
- Add a database (Postgres/Supabase works well with Next.js) and replace `lib/mock-data` reads with real queries
- Add real auth (phone OTP is common for this audience in India)
- Add push notifications for meal reminders (requires a service worker update + a notifications backend)
- Wire the chat to a real-time layer (Supabase Realtime, Pusher, or similar)
