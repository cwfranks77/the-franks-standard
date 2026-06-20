# Backup Strategy

## What is backed up

`POST /api/owner/actions/run-backup` creates a JSON manifest including:

- Table row counts (profiles, listings, orders, payouts, fraud, disputes, COA, etc.)
- Storage bucket inventory (listings, coa-certificates, platform-reports)
- Audit log and security event samples
- Local snapshot file in `backend/backups/snapshots/`

## Metadata

Stored in Supabase `backups` table with label, size, and manifest JSON.

## Schedule

| When | Action |
|------|--------|
| Pre-launch | Required — see `owner/launch_checklist.md` |
| Weekly | Owner-triggered or scheduled Sunday 04:00 UTC |
| Before major migration | Manual backup |

## Restore

`POST /api/owner/actions/restore-backup` marks metadata restored. Full row-level recovery requires DBA `pg_restore` from Supabase dashboard backups.

## Off-platform copies

Download snapshot JSON from server filesystem or export audit bundle for compliance archives.
