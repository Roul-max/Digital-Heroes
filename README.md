# LeadRouter

> Automatically round-robin inbound leads to sales reps by configurable rules, with real-time SLA tracking on response time.

[![CI](https://github.com/your-org/leadrouter/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/leadrouter/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

![LeadRouter Dashboard](docs/screenshots/dashboard.png)

**[Live Demo →](https://leadrouter.vercel.app)**

---

## Features

- **Automatic lead routing** — priority-ordered rules match on region, deal size, and product line
- **Round-robin & direct assignment** — fair distribution or pin to a specific rep
- **Rep capacity enforcement** — leads queue to backlog when all reps are full
- **SLA countdown** — live timer per lead; turns amber at 30 min, red on breach
- **Admin dashboard** — leads routed today, avg response time, SLA breach rate, rep workload bars
- **Immutable audit log** — every routing decision and status change recorded with actor + timestamp
- **CSV export** — full leads table, rate-limited, streamed
- **Email verification + password reset** — single-use hashed tokens, 30-min TTL
- **RBAC** — ADMIN and REP roles, enforced server-side on every route and mutation
- **Accessible UI** — WCAG 2.1 AA, keyboard navigable, focus rings, semantic HTML

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15, App Router, TypeScript strict |
| Database | PostgreSQL via Prisma (Neon / Supabase) |
| Auth | Auth.js (NextAuth v5), Credentials provider |
| Styling | Tailwind CSS v4 |
| Validation | Zod on every boundary |
| Email | Resend |
| Testing | Vitest |
| Deploy | Vercel |

## Quick Start

```bash
git clone https://github.com/your-org/leadrouter
cd leadrouter
cp .env.example .env.local   # fill in your values (see table below)
npm install
npm run db:migrate            # run Prisma migrations
npm run db:seed               # seed demo data
npm run dev                   # http://localhost:3000
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Random 32+ char string (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | — | Full URL of your deployment (defaults to `http://localhost:3000`) |
| `RESEND_API_KEY` | ✅ | API key from [resend.com](https://resend.com) |
| `EMAIL_FROM` | — | Sender address (default: `noreply@leadrouter.app`) |
| `SLA_HOURS` | — | Hours before a lead is SLA-breached (default: `2`) |

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for the full data model diagram, auth/authz explanation, and key trade-off decisions.

**In brief:**
- JWT sessions (role embedded in token — no DB hit in middleware)
- Routing engine evaluates rules in priority order; first match wins
- All timestamps in UTC; SLA rendered in client's local timezone
- Audit log is append-only — no updates, no soft-delete

## Testing

```bash
npm run test           # Vitest unit tests
npm run test:coverage  # Coverage report
npm run typecheck      # TypeScript strict check
npm run lint           # ESLint
```

## Roadmap

- [ ] Webhook intake endpoint (POST `/api/leads/ingest`) for CRM integrations
- [ ] Configurable SLA per routing rule (not just global)
- [ ] Bulk reassignment with select-all-across-pages
- [ ] Cmd+K command palette
- [ ] Playwright e2e tests
- [ ] Upstash Redis rate limiter for multi-instance deploys
- [ ] OAuth providers (Google, GitHub) via Auth.js

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `demo@demo.com` | `demo1234` |
| Rep | `rep1@demo.com` | `demo1234` |

## License

[MIT](LICENSE)
