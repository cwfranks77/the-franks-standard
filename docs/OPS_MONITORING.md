# Ops monitoring — errors, AI triage, mobile alerts

Automated error capture for The Franks Standard (Nuxt SPA on GitHub Pages + Supabase Edge Functions).

## Architecture

| Layer | What |
|-------|------|
| **Capture** | `plugins/ops-error-capture.client.ts` → `ops-error-ingest` edge function |
| **Store** | `ops_incidents` + `ops_incident_events` (migration `030_ops_incidents.sql`) |
| **Dashboard** | `/ops/incidents` (owner-only, ops auth middleware) |
| **Notify** | `_shared/opsNotify.ts` — ntfy.sh push + Twilio SMS + optional email |
| **Health** | `npm run health` posts failures to ingest (when configured) |

## Environment variables (Supabase Edge secrets)

Set via Dashboard → Project Settings → Edge Functions → Secrets, or:

```bash
supabase secrets set \
  OPS_ACCESS_KEY_HASH=<same hash as NUXT_PUBLIC_OPS_ACCESS_KEY_HASH> \
  OPS_NOTIFY_ENABLED=true \
  NTFY_TOPIC=franks-ops-your-random-string \
  OPS_ALERT_EMAIL=you@example.com \
  --project-ref rochesyrxiyrxhzmkuwk
```

### Master gate

| Variable | Required | Description |
|----------|----------|-------------|
| `OPS_ACCESS_KEY_HASH` | Yes for owner actions | Same SHA-256 hash as `NUXT_PUBLIC_OPS_ACCESS_KEY_HASH`; lets Edge Functions verify the owner phrase |
| `OPS_NOTIFY_ENABLED` | Yes for alerts | Must be `true` or all notifications are skipped (logged, no crash) |

### Mobile — pick one (or both)

| Variable | Channel | Description |
|----------|---------|-------------|
| `NTFY_TOPIC` | **ntfy push (recommended MVP)** | Private topic name, e.g. `franks-ops-x7k2m9`. No API key. |
| `OPS_ALERT_PHONE` | Twilio SMS | E.164 number, e.g. `+18778370527` |
| `TWILIO_ACCOUNT_SID` | SMS | From [twilio.com/console](https://www.twilio.com/console) |
| `TWILIO_AUTH_TOKEN` | SMS | Twilio auth token |
| `TWILIO_FROM_NUMBER` | SMS | Your Twilio number (or `TWILIO_PHONE_NUMBER`) |

### Email (optional, longer reports)

| Variable | Description |
|----------|-------------|
| `OPS_ALERT_EMAIL` | Owner email for incident reports |
| `SENDGRID_API_KEY` | Already used for auth email — reused if set |

### Ingest hardening (optional)

| Variable | Description |
|----------|-------------|
| `OPS_INGEST_KEY` | If set, clients must send header `x-ops-ingest-key` |

### AI auto-fix (future — not enabled by default)

| Variable | Description |
|----------|-------------|
| `OPS_AUTO_FIX_ENABLED` | Must be `true` to allow automated patches (not implemented in MVP) |

## Mobile alerts — 2-minute setup (ntfy, recommended)

1. Install **ntfy** on your phone: [ntfy.sh](https://ntfy.sh) (Android / iOS).
2. Pick a **private** topic name nobody can guess, e.g. `franks-ops-x7k2m9`.
3. In the ntfy app: **Subscribe to topic** → enter that exact name.
4. Set Supabase secrets:
   ```bash
   supabase secrets set OPS_ACCESS_KEY_HASH=<hash> OPS_NOTIFY_ENABLED=true NTFY_TOPIC=franks-ops-x7k2m9 --project-ref rochesyrxiyrxhzmkuwk
   ```
   Or set GitHub Actions secrets and run workflow **Push ops monitoring secrets to Supabase**.
5. Deploy functions (see below) and run test:
   ```bash
   OPS_ACCESS_KEY="your ops phrase" npm run ops:notify:test
   ```
6. You should get a push: `Franks Standard ALERT: critical test — …`

**Why ntfy first:** No Twilio billing, no carrier quirks, instant push on Android and iOS.

### Topic name must match exactly (case-sensitive)

`TFSWebsitealerts` and `tfswebsitealerts` are **different topics**. Set `NTFY_TOPIC` in Supabase to the **exact** string you subscribed to in the app.

### Alerts slow or delayed?

| Platform | What helps |
|----------|------------|
| **Android** | ntfy → **Instant delivery in doze mode** ON; system battery → **Unrestricted** for ntfy |
| **iPhone** | Native app push can lag minutes; use [ntfy.sh/app](https://ntfy.sh/app) PWA (Add to Home Screen) for faster web push |
| **Critical ops alerts** | Edge functions send **max** priority for critical/high; redeploy functions after code changes |
| **Need instant** | Add Twilio SMS (`OPS_ALERT_PHONE`) — texts usually arrive in seconds |

## Mobile alerts — Twilio SMS setup

1. [Twilio console](https://www.twilio.com/console) → copy Account SID + Auth Token.
2. Buy or use an existing SMS-capable number → note E.164 form (`+1…`).
3. Set secrets:
   ```bash
   supabase secrets set \
     OPS_NOTIFY_ENABLED=true \
     TWILIO_ACCOUNT_SID=AC... \
     TWILIO_AUTH_TOKEN=... \
     TWILIO_FROM_NUMBER=+1... \
     OPS_ALERT_PHONE=+18778370527 \
     --project-ref rochesyrxiyrxhzmkuwk
   ```
4. Test: `OPS_ACCESS_KEY="phrase" npm run ops:notify:test`

### SMS message format

- **New (critical/high):** `Franks Standard ALERT: [severity] [source] — [first 80 chars]`
- **Resolved:** `Franks Standard FIXED: [incident id] — [fix_summary 80 chars] — [time ET]`

### Email-to-SMS gateway (fallback only)

Some carriers expose `{number}@txt.att.net` etc. Unreliable (delays, filtering, no delivery receipts). Prefer ntfy or Twilio.

## When alerts fire

| Event | Notify? |
|-------|---------|
| New incident, severity `critical` or `high` | Yes (if `OPS_NOTIFY_ENABLED=true`) |
| New incident, `medium` / `low` | No (stored only) |
| Status → `resolved` | Yes — FIXED message |
| Duplicate same fingerprint within 1 hour | No (deduped) |

## Deploy

1. Apply migration:
   ```bash
   npx supabase db push --project-ref rochesyrxiyrxhzmkuwk
   ```
   Or push to `master` — workflow `Apply Supabase migrations` runs automatically.

2. Deploy edge functions:
   ```bash
   npx supabase functions deploy ops-error-ingest --no-verify-jwt --project-ref rochesyrxiyrxhzmkuwk
   npx supabase functions deploy ops-incident-action --no-verify-jwt --project-ref rochesyrxiyrxhzmkuwk
   ```
   Or merge to `master` — `Deploy Supabase Edge Functions` workflow.

3. Rebuild + deploy site (client error plugin ships in static bundle).

## Manual test steps

### 1. Test notification (fastest)

```bash
OPS_ACCESS_KEY="your ops unlock phrase" npm run ops:notify:test
```

Resolved variant:

```bash
OPS_ACCESS_KEY="your phrase" npm run ops:notify:test -- --resolved
```

### 2. Test ingest (curl)

```bash
curl -X POST "https://rochesyrxiyrxhzmkuwk.supabase.co/functions/v1/ops-error-ingest" \
  -H "Content-Type: application/json" \
  -d '{"source":"manual","severity":"critical","message":"Manual test incident"}'
```

### 3. Dashboard

1. Unlock ops from homepage (logo ×5).
2. Open `/ops/incidents`.
3. Mark an incident **resolved** → phone should get FIXED message.

### 4. Client error (after site deploy)

In browser console on production:

```javascript
throw new Error('ops capture test')
```

Refresh `/ops/incidents` — new row should appear.

## Ops dashboard

- **URL:** `/ops/incidents`
- **Auth:** Same as other `/ops/*` pages (session after logo unlock)
- **Actions:** Triaging, Fixing, Mark resolved (prompts for fix summary → triggers FIXED alert)

Link also on `/ops/panel`.

## AI triage / auto-fix (MVP limits)

This static GitHub Pages site cannot self-deploy code. MVP stores incidents and sends alerts.

**Safe path for later:**

1. GitHub Action or edge cron on new `critical` incident → call OpenAI/Anthropic for `root_cause` + suggested fix → write to DB.
2. **Auto-fix:** only with `OPS_AUTO_FIX_ENABLED=true` → open draft PR via GitHub API or Cursor SDK webhook — never push to production automatically.
3. Document Cursor agent webhook in your CI when ready.

**Realistic auto-fix targets:** client typos, env misconfig, missing migration, broken edge secret — not arbitrary runtime data bugs.

## Optional: Sentry

If you add `@sentry/vue`, set `NUXT_PUBLIC_SENTRY_DSN` and forward Sentry webhooks to `ops-error-ingest` for unified incidents. Not required for MVP.

## Related docs

- [OPERATIONS-MONITORING.md](./OPERATIONS-MONITORING.md) — daily health checks + Telegram deploy pings
- `.env.example` — local reference (never commit secrets)

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `notify.sent` empty | Set `OPS_NOTIFY_ENABLED=true` + `NTFY_TOPIC` or Twilio vars |
| ntfy silent | Confirm app subscribed to **exact** topic; try `curl -d "hi" https://ntfy.sh/YOUR_TOPIC` |
| SMS fails | Check Twilio trial verified recipient numbers; E.164 format |
| No incidents in UI | Run migration; deploy functions; check browser network tab for ingest 404 |
| Functions 401 on ingest | Set `OPS_INGEST_KEY` on Edge **and** client header, or leave unset |
