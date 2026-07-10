# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2025-01-01

### Added
- Email + password auth with email verification (Auth.js + bcrypt cost 12)
- Password reset with single-use hashed token, 30-minute TTL
- RBAC: ADMIN and REP roles, enforced in middleware and every server action
- In-memory rate limiting on auth and export routes (5 req / 15 min)
- Lead CRUD with automatic routing on creation
- Routing engine: priority-ordered rules, ROUND_ROBIN and DIRECT_ASSIGN strategies
- Rep capacity enforcement — leads backlogged when all reps are full
- SLA countdown timer (configurable via `SLA_HOURS` env var)
- Immutable audit log on every status change and routing decision
- Admin dashboard: leads routed today, avg response time, SLA breach rate, rep workload
- Rep dashboard: assigned leads with live SLA countdown
- Routing rules config: create, delete, priority ordering
- Team management: capacity editing, soft-delete with lead unassignment
- CSV export of full leads table (rate-limited, admin only)
- Cursor/keyset pagination, server-side search and filtering
- Security headers: CSP, HSTS, X-Content-Type-Options, X-Frame-Options
- Prisma seed with demo credentials (`demo@demo.com` / `demo1234`)
- Vitest unit tests for routing engine and auth actions
- GitHub Actions CI: typecheck + lint + test on every push
