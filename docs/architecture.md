# Architecture

## Data Model

```
User ──< Lead (assignedTo)
User ──< AuditLog (actor)
User ──< RoutingRule (targetUser, DIRECT_ASSIGN only)
Lead ──< AuditLog
```

**User** — holds auth credentials (bcrypt hash), role (ADMIN | REP), capacity (`maxActiveLeads`), and soft-delete (`deletedAt`). Verification and reset tokens are stored as SHA-256 hashes — the plaintext token is only ever in the email link.

**Lead** — the core entity. `routedAt` is stamped when the routing engine assigns it; `firstResponseAt` is stamped on the first status change away from NEW. SLA breach = `routedAt + SLA_HOURS < now && firstResponseAt IS NULL`.

**RoutingRule** — evaluated in ascending `priority` order. `criteriaJson` is a flexible JSONB object (`{ region, minDealSize, maxDealSize, productLine }`). First matching rule wins. `ROUND_ROBIN` picks the least-recently-updated eligible rep; `DIRECT_ASSIGN` routes to a specific user.

**AuditLog** — append-only. Never updated or deleted (no soft-delete, cascade on lead delete only). Captures `action`, `metadata` (prev/next state, notes), actor, and timestamp.

## Auth & Authorisation

- **Auth.js (NextAuth v5)** with a Credentials provider. Sessions are JWT-based (httpOnly cookie via Auth.js defaults).
- Role (`ADMIN` | `REP`) is embedded in the JWT at sign-in and re-read from the token on every request — no DB hit in middleware.
- **Middleware** (`src/middleware.ts`) gates routes server-side before any page renders. REPs are hard-redirected away from `/admin`, `/rules`, `/team`.
- **Server actions** re-verify the session and role on every mutation — the client-sent role is never trusted.
- Row-level auth: REPs can only read/update leads where `assignedToId === session.user.id`.

## Key Decisions & Trade-offs

| Decision | Rationale | Trade-off |
|---|---|---|
| JWT sessions (not DB sessions) | Zero DB hit on every request; simpler infra | Role changes don't take effect until token expires (~30 days). Acceptable for this use case. |
| In-memory rate limiter | Zero infra dependency for MVP | Resets on server restart; doesn't work across multiple instances. Swap for Upstash Redis in production. |
| Cursor pagination (keyset) | Stable under concurrent inserts; no page drift | Harder to jump to arbitrary pages. Acceptable since the UI uses "load more". |
| `updatedAt` as round-robin proxy | Avoids a separate `lastAssignedAt` column | A rep updating their profile would skew the order. Low risk for MVP. |
| Soft-delete on User only | Reps can be recovered; leads are hard-deleted by admin intent | AuditLogs cascade-delete with their lead — intentional, not accidental. |
