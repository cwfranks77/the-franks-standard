# Monitoring Strategy

## Automated monitors

| Job | Interval | Output |
|-----|----------|--------|
| `cron-post-launch-monitor` | 10 min | `post_launch_events`, `owner_alerts` |
| `cron-search-index` | 5–10 min | Search index freshness |
| `cron-process-jobs` | Scheduled | Background job queue |
| `cron-log-cleanup` | Weekly | Log retention |

## Owner dashboards

- `GET /api/owner/status/{platform,financial,security,fraud,disputes,users,stores}`
- `GET /api/owner/alerts?unread=true`
- `GET /api/owner/launch/readiness`

## Thresholds

Configured in `owner/platform_config.json` under `fraud_thresholds` and `monitoring_intervals`.

## Alert types

- Fraud and dispute spikes
- Payout, email, SMS failures
- Job queue and cache failures
- Banned device access attempts
- Security error rate elevation

## Response

1. Review `owner_alerts` and `post_launch_events`
2. Use owner action endpoints (freeze, ban, hold payout) as needed
3. Emergency shutdown only when `confirm: true` on emergency endpoint
