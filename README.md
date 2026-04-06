# MT Assessment Tracker

A polished, mobile-first PWA that helps Mountain Training qualification candidates assess their readiness for assessment. Rate your skills, track progress over time, and see exactly where to focus your preparation.

> **Disclaimer:** This is an unofficial self-assessment support tool. It is not affiliated with, endorsed by, or an official product of Mountain Training. All qualification data links back to the official [mountain-training.org](https://www.mountain-training.org) website.

---

## Features

- **20 qualifications** across Walking and Climbing & Coaching pathways
- **Interactive checklist rating** with 5-point pills (Not yet → Assessment ready)
- **Confidence scoring** — rate how sure you are of each rating
- **Readiness ring** — visual overall readiness percentage per qualification
- **Section breakdown** — traffic-light progress bars per syllabus section
- **Insights panel** — weakest/strongest areas, top 5 to improve, unrated items
- **Quick rate mode** — swipe through unrated items rapidly
- **Progress history** — snapshots over time with trend tracking
- **Manual refresh** — fetch latest qualification data from mountain-training.org on demand
- **Change diffing** — see what changed after a refresh, with user data preserved
- **Installable PWA** — add to home screen, works offline
- **Dark mode** — follows system preference

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS + shadcn/ui components |
| Database | Prisma ORM + SQLite (dev) / PostgreSQL (prod) |
| Scraping | Playwright (headless Chromium) + Cheerio + pdf-parse |
| Charts | Recharts |
| PWA | next-pwa (Workbox) |
| Testing | Vitest |
| Validation | Zod |

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
git clone https://github.com/parky93/github-slideshow.git
cd github-slideshow
git checkout claude/mountain-training-app-MEVun
npm install
```

### Database setup

```bash
# Create SQLite database and run migrations
npx prisma db push

# Seed with 20 qualifications (Mountain Leader has full 64-item checklist)
npx tsx prisma/seed.ts
```

### Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home: qualification library
│   ├── qualifications/
│   │   ├── page.tsx              # Full qualification library with search
│   │   └── [slug]/
│   │       ├── page.tsx          # Qualification dashboard
│   │       ├── checklist/        # Interactive checklist rating
│   │       ├── history/          # Progress history
│   │       └── refresh/          # Manual refresh UI
│   ├── history/                  # Global progress page
│   ├── settings/                 # App settings
│   └── api/
│       ├── qualifications/       # Qualification data API
│       ├── refresh/              # SSE refresh endpoint
│       ├── ratings/              # Rating save/clear
│       └── snapshots/            # Progress snapshot save
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   ├── layout/                   # AppShell + navigation
│   ├── qualification/            # QualCard
│   ├── checklist/                # RatingPills
│   └── charts/                   # ReadinessRing + SectionBar
├── lib/
│   ├── db/                       # Prisma client + query helpers
│   ├── scraper/                  # Fetcher + HTML/PDF parsers
│   ├── mapping/                  # Stable key generation + item mapping
│   └── scoring/                  # Readiness scoring + insights
└── tests/
    ├── scoring/                  # Score and insights tests
    ├── mapping/                  # Stable key and item mapper tests
    └── scraper/                  # HTML parser tests
```

---

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm test             # Run tests (watch mode)
npm run test:run     # Run tests once
npm run db:push      # Sync schema to DB
npm run db:seed      # Seed qualification data
npm run db:studio    # Open Prisma Studio
```

---

## Refresh Pipeline

The refresh feature fetches live data from Mountain Training when the user explicitly requests it. It never runs in the background.

**Fetch strategy (403-resistant):**
1. `fetch()` with browser-like headers — fast, sometimes works
2. Playwright headless Chromium — handles bot protection reliably
3. Graceful fallback — keep existing data, show clear error message

**Item mapping across refreshes:**
- Exact `stableKey` match (SHA-256 of slug+section+prompt) → confidence 1.0
- Jaro-Winkler fuzzy match ≥ 0.85 → confidence 0.7–0.99
- Positional fallback → confidence 0.4–0.69
- Unmatched → orphaned (user reviews and re-maps)

User ratings are **always** preserved across refreshes.

---

## Scoring Model

```
itemScore = (ratingValue / 5) × (0.7 + 0.3 × confidenceValue / 5)

sectionScore = mean(itemScores) × 100   [unrated items = 0]
overallScore = weighted mean of sectionScores

scoreConfidence = (ratedItems / totalItems) × 100
```

**Rating labels:**
| Value | Label |
|---|---|
| 1 | Not yet |
| 2 | Emerging |
| 3 | Developing |
| 4 | Solid |
| 5 | Assessment ready |

**Traffic lights:**
- Red: < 40%
- Amber: 40–69%
- Green: >= 70%

---

## Production Deployment (Vercel + Neon/PlanetScale)

1. Create a PostgreSQL database (Neon, Supabase, or PlanetScale)
2. Update `prisma/schema.prisma` provider to `postgresql`
3. Set `DATABASE_URL` environment variable in Vercel
4. Deploy: `vercel deploy`
5. Run migrations: `npx prisma migrate deploy`
6. Seed: `npx tsx prisma/seed.ts`

**Note:** Playwright is a large dependency (~300MB with browsers). For serverless deployment, the refresh feature falls back to `fetch()` with browser headers if Playwright is unavailable. If the MT site blocks these requests, the app shows a clear error and keeps existing data.

---

## Environment Variables

```bash
# Required
DATABASE_URL="file:./dev.db"           # SQLite for development
# DATABASE_URL="postgresql://..."      # PostgreSQL for production

# Optional
PLAYWRIGHT_BROWSERS_PATH=/path/to/browsers   # Custom Playwright browser path
NODE_ENV=production                           # Disables PWA service worker in dev
```

---

## Testing

```bash
npm run test:run
```

Test coverage:
- `scoring/score.test.ts` — scoring algorithm edge cases
- `scoring/insights.test.ts` — insights generation
- `mapping/stable-key.test.ts` — deterministic key generation
- `mapping/item-mapper.test.ts` — exact/fuzzy/unmatched item mapping
- `scraper/html-parser.test.ts` — HTML parsing against inline fixtures

---

## Data Privacy

All data is stored **locally** in your SQLite database. Nothing is sent to external servers except when you explicitly use the "Refresh from Mountain Training" feature, which fetches publicly available pages from mountain-training.org.

---

## License

MIT

---

## Contributing

This project was built as a personal tool. PRs welcome for bug fixes and improvements.
