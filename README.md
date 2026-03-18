# MathMatrix

Curriculum-aligned maths practice for Australian students, Grade 3 to Year 12.

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

```bash
npx vercel
```

Set your environment variables in the Vercel dashboard under **Settings > Environment Variables**.

---

## Licence

MIT
