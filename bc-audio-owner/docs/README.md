# BC Audio Owner Tools

This folder contains owner/admin tools:
- Theme editor (themes stored in DB)
- Activity recorder and audit logs
- Refund processing endpoint (Stripe integration placeholder)
- Feature flags and admin actions
- Background jobs: backups and activity cleanup

Environment variables:
- MONGO_URI
- JWT_SECRET
- STRIPE_SECRET_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- APP_URL
- AUTO_REFUND_ENABLED
- AUTO_REFUND_MAX_AMOUNT

Run background jobs via bc-audio-owner/scripts/run_owner_jobs.sh (cron).

**Note:** The live B&C website runs on Nuxt 3 + Supabase. Operational owner tools are wired in `bc-performance-audio/`. This folder is a reference scaffold for Express/Mongo integrations.
