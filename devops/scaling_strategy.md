# Scaling Strategy

## Current architecture

- **Frontend**: Nuxt 3 static generate (gh-pages / CDN)
- **API**: Nuxt server routes + Supabase Edge Functions
- **Database**: Supabase Postgres with RLS
- **Cache**: Redis optional (`REDIS_URL`), in-memory fallback
- **Search**: `search_index_*` tables, cron reindex

## Horizontal scaling

- Edge functions scale per Supabase plan
- Server routes scale with Vercel/hosting compute
- Redis shared cache reduces DB read load for homepage, search, SEO content

## Database

- Index migrations in `051_section10_performance.sql` and later
- Archive old logs via `cron-log-cleanup`
- Monitor connection pool on high traffic

## Search

- Increase `index_listings` cron batch size if catalog grows
- Owner `POST /api/owner/actions/reindex-search` for full refresh

## Cost controls

- No unbounded API loops in cron workflows
- Rate limits on messaging and auth (`backend/security/rate_limit.js`)
- Owner-only heavy exports paginated or limited

## Future

- Read replicas via Supabase when available on plan
- Dedicated Redis for multi-instance cache coherence
