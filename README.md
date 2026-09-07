# PrepNest

Curriculum-aligned practice exams and tutoring for Australian students, Grade 3 to Year 12.

> Note: this repo/folder is still named `mathmatrix` (its original working name).
> The product itself has been rebranded to **PrepNest** throughout the app —
> see the "Naming" section below for why, and rename the repo separately if desired.

Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Auth & DB | Supabase (PostgreSQL + Row Level Security) |
| Hosting | Vercel |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Animation | Framer Motion |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/mathmatrix.git
cd mathmatrix
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. In the Supabase SQL editor, run the contents of `/supabase/schema.sql`
3. Copy your project URL and anon key from **Settings > API**

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your Supabase credentials.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing / home
│   ├── practice/           # Practice session flow
│   ├── leaderboard/        # Weekly leaderboard
│   ├── parent/             # Parent dashboard
│   ├── admin/              # Admin — question management
│   └── auth/
│       ├── login/
│       └── register/
├── components/
│   ├── ui/                 # Reusable primitives (Button, Card, Input...)
│   ├── practice/           # Quiz, question card, timer, results
│   ├── layout/             # Navbar, sidebar, footer
│   └── dashboard/          # Parent dashboard charts and tables
├── lib/
│   ├── supabase/           # Browser + server Supabase clients
│   └── questions/          # Question bank and query helpers
├── hooks/                  # Custom React hooks
└── types/                  # Shared TypeScript interfaces
supabase/
└── schema.sql              # Full database schema — run once on new project
```

---

## Roadmap

### Phase 1 — Foundation ✅ (current)
- [x] Next.js + TypeScript scaffold
- [x] Tailwind design system
- [x] Core types and database schema
- [x] Question bank (Australian Curriculum v9.0 aligned)
- [x] Practice flow (grade select → topic → quiz → results)
- [x] Login page scaffold

### Phase 2 — Auth & Persistence
- [ ] Supabase auth (email + Google OAuth)
- [ ] Student registration with year level
- [ ] Parent registration + invite-code linking
- [ ] Session results saved to database
- [ ] XP and streak tracking

### Phase 3 — Content Engine
- [ ] Admin panel for adding/editing questions
- [ ] Adaptive difficulty (auto-scale based on performance)
- [ ] Per-question curriculum code tagging
- [ ] Question bank expanded to 20+ questions per topic per year level

### Phase 4 — Gamification
- [ ] XP system with level thresholds
- [ ] Weekly leaderboard with real data
- [ ] Timed challenge mode
- [ ] Achievement badges

### Phase 5 — Parent Dashboard
- [ ] Full session history and topic heatmap
- [ ] Weak area detection and recommendations
- [ ] Weekly email digest

### Phase 6 — Freemium & Scale
- [ ] Stripe subscription integration
- [ ] Feature flags for premium content
- [ ] School/class licensing model
- [ ] Teacher dashboard

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit with conventional commits: `git commit -m "feat: add timer component"`
3. Push and open a pull request

---

## Deployment

This project is designed to deploy to Vercel with zero configuration.

### First-time deploy

1. Create a free account at [vercel.com](https://vercel.com) (sign up with GitHub — same account as `ericho1995/mathmatrix`).
2. From the Vercel dashboard: **Add New → Project**, import the `mathmatrix` GitHub repo (the repo is still named `mathmatrix`; the deployed product is branded PrepNest — you can rename the Vercel project itself to `prepnest` during import).
3. Vercel auto-detects Next.js — leave the build settings as-is and click **Deploy**.
4. Add environment variables under **Settings → Environment Variables** (copy the keys from `.env.example`; Supabase values only matter once auth is wired up, `MAINTENANCE_MODE=false` should always be set).
5. You'll get a live URL like `https://prepnest.vercel.app` — works on any device, no domain purchase required. Once you buy `prepnest.com.au` (see "Naming" below), attach it under **Settings → Domains**.

Every push to `main` auto-deploys. No CLI needed, but `npx vercel` works too if you prefer the terminal.

### Taking the site down (kill switch)

If something's broken in production and you need the whole site offline immediately:

1. Vercel dashboard → your project → **Settings → Environment Variables**.
2. Set `MAINTENANCE_MODE` to `true` (add it if it isn't there yet).
3. **Deployments** tab → latest deployment → **⋯ → Redeploy**.
4. Within ~30-60 seconds, every page shows a plain "back shortly" maintenance page instead of the app.

To bring it back: set `MAINTENANCE_MODE` back to `false` and redeploy again the same way.

This is enforced in [`src/middleware.ts`](src/middleware.ts), which runs before every request.

---

## Naming

The product was originally called MathMatrix. That was dropped after checking
for conflicts and finding **Matrix Education** (matrix.edu.au), an established
Australian Year 3–12 tutoring company — too close for comfort in the same
market. Renamed to **PrepNest**:

- No existing tutoring/education brand found under this name (web search, 2026-09-07)
- `prepnest.com.au` is unregistered and available to purchase (checked via the
  official `.au` registry RDAP lookup, 2026-09-07) — `.com.au` fits better
  than `.com` anyway, since this is an Australian-curriculum-specific product
- `prepnest.com` is already registered by someone else, so `.com.au` is the
  primary domain going forward

This is a best-effort check, not a legal clearance — run an actual trademark
search at [IP Australia](https://search.ipaustralia.gov.au/trademarks)
(class 41 — education/training) before finalising, and register
`prepnest.com.au` while it's available (`.com.au` registration requires an
active Australian ABN).

---

## Licence

MIT
