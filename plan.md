# LeadRouter - Phase 1 Planning

## 1. Data Model

**User**
*   `id` (String, UUID, PK)
*   `email` (String, Unique, Indexed)
*   `password_hash` (String)
*   `role` (Enum: ADMIN, REP)
*   `max_active_leads` (Int, default: 10, nullable for Admins)
*   `email_verified` (DateTime, Nullable)
*   `created_at` (DateTime, default: now())
*   `updated_at` (DateTime, updated_at)
*   `deleted_at` (DateTime, Nullable) - Soft delete for reps

**Lead**
*   `id` (String, UUID, PK)
*   `email` (String, Unique, Indexed)
*   `name` (String)
*   `company` (String, Nullable)
*   `region` (String, Indexed)
*   `deal_size` (Int, Indexed)
*   `product_line` (String, Indexed)
*   `status` (Enum: NEW, CONTACTED, QUALIFIED, WON, LOST) - Indexed
*   `assigned_to_id` (String, FK to User, Nullable) - Indexed
*   `routed_at` (DateTime, Nullable)
*   `first_response_at` (DateTime, Nullable)
*   `created_at` (DateTime, default: now())
*   `updated_at` (DateTime, updated_at)

**RoutingRule**
*   `id` (String, UUID, PK)
*   `name` (String)
*   `criteria_json` (JSONB) - Defines region/deal_size/product_line matching logic
*   `distribution_method` (Enum: ROUND_ROBIN, DIRECT_ASSIGN)
*   `target_user_id` (String, FK to User, Nullable) - For direct assignment
*   `is_active` (Boolean, default: true)
*   `priority` (Int) - Evaluated ascending
*   `created_at` (DateTime, default: now())
*   `updated_at` (DateTime, updated_at)

**AuditLog**
*   `id` (String, UUID, PK)
*   `lead_id` (String, FK to Lead) - Indexed
*   `actor_id` (String, FK to User)
*   `action` (String) - e.g., 'STATUS_CHANGED', 'ROUTED', 'NOTE_ADDED'
*   `metadata` (JSONB) - Captures previousState, newState, notes
*   `created_at` (DateTime, default: now())

## 2. User Stories & Acceptance Criteria

**US1: Admin creates routing rules**
*   *Given* I am an Admin on the Rules Config page
*   *When* I create a new rule specifying region="NA" and target=RoundRobin
*   *Then* the rule is saved with a specific priority and active status.

**US2: Admin manages reps and their capacity**
*   *Given* I am an Admin on the Team page
*   *When* I set Rep A's max active leads to 5
*   *Then* the system will not route a 6th "NEW" lead to Rep A until they progress an existing lead.

**US3: Rep sees assigned leads with SLA countdown**
*   *Given* I am a Rep
*   *When* I view my dashboard
*   *Then* I see only leads assigned to me, sorted by SLA proximity, with unresponded leads showing a countdown timer (e.g., 2 hours remaining).

**US4: Admin dashboard metrics**
*   *Given* I am an Admin
*   *When* I view the dashboard
*   *Then* I see aggregate metrics: leads routed today, average response time, SLA breach rate, and workload distribution per rep.

**US5: Email+password auth and role-gated views**
*   *Given* I am an unauthenticated user
*   *When* I log in with Admin credentials
*   *Then* I access the Admin dashboard. If I log in with Rep credentials, I am redirected to the Rep dashboard and cannot access routing rules.

**US6: Rep updates lead status**
*   *Given* I am a Rep viewing an assigned lead
*   *When* I change the status from NEW to CONTACTED and add a note
*   *Then* the lead status is updated, my first_response_at is stamped, and the SLA timer stops.

**US7: Admin views immutable audit log**
*   *Given* I am an Admin viewing a lead
*   *When* I open the History tab
*   *Then* I see a chronological, read-only list of all routing decisions, status changes, and notes.

## 3. API Surface (Server Actions / Routes)

*All routes require Authentication. Role guards enforce access.*

*   `login(credentials)` -> `{ sessionToken }` (Public)
*   `register(details)` -> `{ success }` (Public)
*   `verifyEmail(token)` -> `{ success }` (Public)
*   `resetPassword(token, newPass)` -> `{ success }` (Public)
*   `getDashboardStats()` -> `{ routedToday, avgResponseTime, breachRate, workload }` (Admin)
*   `getLeads(filters, sort, cursor)` -> `{ leads, nextCursor }` (Admin: All, Rep: Own)
*   `updateLeadStatus(leadId, status, note)` -> `Lead` (Admin, Assigned Rep)
*   `getUsers(role, cursor)` -> `{ users, nextCursor }` (Admin)
*   `updateUserCapacity(userId, maxLeads)` -> `User` (Admin)
*   `createRoutingRule(data)` -> `RoutingRule` (Admin)
*   `updateRoutingRule(ruleId, data)` -> `RoutingRule` (Admin)
*   `getAuditLogs(leadId)` -> `AuditLog[]` (Admin)

## 4. Edge Cases

*   **No reps available / All at capacity:** Leads fall into a "Unassigned / Backlog" queue, alerting Admins.
*   **Duplicate lead submission:** Handled via unique index on `email` or deterministic merging (updating existing lead instead of creating a duplicate).
*   **Two rules matching one lead:** Handled by `priority` integer on RoutingRule. First matching rule wins.
*   **SLA timer timezone handling:** All timestamps stored in UTC. SLA calculated against UTC `routed_at`, rendered in client's local timezone.
*   **Concurrent status updates:** Handled via optimistic locking or standard "last write wins" if acceptable, though an immutable audit log ensures no history is lost.

## 5. State Coverage per Screen

*   **Login / Register:** Loading (spinner on submit, fields disabled), Error (invalid credentials toast/inline), Success (redirect).
*   **Admin Dashboard:** Loading (skeleton cards/charts), Empty (Zero states for "No leads today"), Error (retry button for failed fetch).
*   **Lead List:** Loading (table skeleton), Empty ("No leads found" with clear filter CTA), Error (toast + retry), Success (populated table).
*   **Lead Detail:** Loading (profile skeleton), Error (404/Not Found boundary), Success (data + interactive status dropdown). Pending states on status update.
*   **Rules Config:** Loading (list skeleton), Empty ("Create your first rule"), Error (toast), Success (draggable/sortable list).
*   **Rep Management:** Loading (table skeleton), Empty ("Invite a rep"), Success (table with inline edit for capacity).

## 6. File Structure

```
leadrouter/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── admin/page.tsx
│   │   │   ├── rep/page.tsx
│   │   │   ├── leads/[id]/page.tsx
│   │   │   ├── rules/page.tsx
│   │   │   └── team/page.tsx
│   │   ├── api/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/ (shadcn)
│   │   ├── layout/ (sidebar, nav)
│   │   └── features/ (LeadTable, RuleForm)
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts (session management)
│   │   ├── utils.ts
│   │   └── routing-engine.ts
│   ├── server/
│   │   └── actions/ (server actions per domain)
│   └── types/
│       └── index.ts (Zod schemas and inferred types)
```

## 7. Open Questions / Assumptions

1.  **SLA Duration:** Assuming a default global SLA of 2 hours for first response, but this might need to be configurable globally or per rule.
2.  **Database Provider:** Assuming PostgreSQL will be provided via `DATABASE_URL` environment variable (Neon/Supabase/Cloud SQL).
3.  **Email Provider:** Assuming an external service (like Resend/SendGrid) for email verification and password resets. Need confirmation on what to mock vs implement.
4.  **Round-Robin Logic:** Assuming a pointer or "last assigned" timestamp on the User model to ensure fair distribution across eligible reps.
