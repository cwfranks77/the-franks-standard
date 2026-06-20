# DevOps — Deployment Checklist

## Environment variables

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`
- `NUXT_OPS_ACCESS_KEY_HASH` (owner API auth)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`
- `CRON_SECRET` (GitHub Actions → Supabase cron)
- `REDIS_URL` (optional cache)
- `SITE_URL`

See `devops/env_example.env` for full list.

## Database migrations

Apply all migrations in `supabase/migrations/` in order through **057_expansion_ai_agents.sql** in Supabase SQL Editor before deploy.

## Backup schedule

- Pre-launch: `POST /api/owner/actions/run-backup`
- Weekly: Sunday 04:00 UTC (see `backup_strategy.md`)
- Store manifests in `backups` table

## Monitoring setup

- Post-launch monitor: every 10 minutes (`cron-post-launch-monitor`)
- Owner alerts: `GET /api/owner/alerts`
- Health: `GET /api/system/health`, `GET /api/owner/status/platform`

## Log retention

- `cron-log-cleanup`: 180-day retention on activity, violation, security, audit logs
- Export audit trail before purge if needed: `GET /api/owner/export/audit`

## Security checks

- Run `GET /api/owner/lockdown` — `secure` must be `true`
- Run `GET /api/owner/launch/validate`
- Confirm `OPS_ACCESS_KEY_HASH` is set (never commit plaintext ops key)
- Verify owner routes return 401 without `x-ops-key`

## Launch lock usage

1. `POST /api/owner/launch/lock` with `{ "action": "lock" }` before cleanup
2. Run cleanup and backup
3. `POST /api/owner/launch/lock` with `{ "action": "unlock" }` after verification
4. Emergency: `POST /api/owner/emergency/shutdown` with `{ "confirm": true }`

## Deploy steps

1. Push `master` → GitHub Actions deploys Supabase edge functions
2. Apply pending SQL migrations
3. `npm run docs:api-index` to refresh API index
4. `npm run test:backend` before promote
5. Vercel/static: `npm run build` (gh-pages workflow if applicable)
