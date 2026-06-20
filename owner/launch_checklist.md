# Owner Launch Checklist — The Franks Standard

Backend-only launch procedure. Use the owner ops key (`x-ops-key` header) on every step below.

---

## Pre-launch sequence

### 1. Validate platform

```http
GET /api/owner/launch/validate
```

Expect `{ "status": "ok", "errors": [] }`. Fix every item in `errors` before continuing.

### 2. Run readiness check

```http
GET /api/owner/launch/readiness
```

Review all status fields. `launch_ready` must be `true` before go-live.

### 3. Lock platform

```http
POST /api/owner/launch/lock
Content-Type: application/json

{ "action": "lock", "reason": "pre_launch" }
```

While locked: no new listings, registrations, purchases, payouts, or disputes.

### 4. Run cleanup (dry run first)

```http
POST /api/owner/launch/cleanup
Content-Type: application/json

{ "dry_run": true }
```

Then execute:

```http
POST /api/owner/launch/cleanup
Content-Type: application/json

{ "dry_run": false, "confirm": true }
```

Removes test listings, users, orders, payouts, disputes, fraud cases, COA files, messages, and notifications.

### 5. Create backup

```http
POST /api/owner/launch/backup
Content-Type: application/json

{ "action": "create", "label": "pre-launch-snapshot" }
```

List backups:

```http
GET /api/owner/launch/backup
```

### 6. Unlock platform

```http
POST /api/owner/launch/lock
Content-Type: application/json

{ "action": "unlock" }
```

---

## Post-unlock smoke tests

Run these manually after unlock. Each should succeed on a staging or low-risk test account.

| Step | What to test |
|------|----------------|
| Test payments | Complete a small checkout on a test listing |
| Test payouts | Queue and release a test seller payout via ops |
| Test disputes | Open and resolve a test dispute |
| Test fraud cases | Open a test fraud case (`evidence.is_test: true`) then cleanup |
| Test COA uploads | Upload a test COA and verify chain-of-custody log |
| Test messaging | Send a platform message between two test accounts |
| Test notifications | Trigger order/payout notification delivery |
| Test search | `GET /api/search/query?q=test` returns indexed results |
| Test recommendations | `GET /api/search/recommendations` returns items |

---

## Approve launch

- [ ] Validation passed (`status: ok`)
- [ ] Readiness `launch_ready: true`
- [ ] Pre-launch backup created and recorded in `backups` table
- [ ] Test data cleanup completed
- [ ] Smoke tests passed
- [ ] Post-launch monitor cron active (every 10 minutes)
- [ ] Owner approves go-live

---

## Emergency controls

**Shutdown** (freezes all accounts, disables marketplace activity):

```http
POST /api/owner/emergency/shutdown
Content-Type: application/json

{ "confirm": true }
```

**Restart** (clears emergency freeze):

```http
POST /api/owner/emergency/restart
Content-Type: application/json

{ "confirm": true }
```

Both actions are logged to `audit_logs`.

---

## Database migration

Apply in Supabase SQL Editor before first use:

`supabase/migrations/055_section14_launch.sql`

Creates `launch_lock`, `backups`, and `post_launch_events` tables.

---

## Post-launch monitoring

Cron job `cron-post-launch-monitor` runs every 10 minutes. Events are stored in `post_launch_events`.

Checks: error rate, fraud spikes, dispute spikes, payout failures, SMS failures, email failures, cache failures, job queue failures.
