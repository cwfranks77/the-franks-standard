# API — Owner Endpoints

Administrative API under `/owner/*`. **Owner role or API key required.**

---

## Authentication

```
Authorization: Bearer <owner_jwt>
X-Owner-Api-Key: <key>   # automation alternative
```

All responses logged to activity log.

---

## Status Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/owner/status/platform` | Health, version, feature flags |
| GET | `/owner/status/financial` | GMV, fees, holds, tax buckets, reserve |
| GET | `/owner/status/security` | Anomalies, failed auth spikes |
| GET | `/owner/status/fraud` | Open cases count, aging |
| GET | `/owner/status/disputes` | Escalated queue |
| GET | `/owner/status/users` | Totals, frozen/banned |
| GET | `/owner/status/stores` | Active stores, B&C qualified count |

**Example `GET /owner/status/financial` fragment:**
```json
{
  "gross_volume_cents_24h": 1250000,
  "platform_fees_cents_24h": 125000,
  "payout_holds_count": 3,
  "tax_remitted_pending_cents": 45000,
  "owner_tax_reserve_cents": 312500
}
```

---

## Action Endpoints

| Method | Path | Body |
|--------|------|------|
| POST | `/owner/actions/freeze-user` | `{ "user_id": "uuid", "reason": "..." }` |
| POST | `/owner/actions/unfreeze-user` | `{ "user_id": "uuid" }` |
| POST | `/owner/actions/ban-user` | `{ "user_id": "uuid", "reason": "..." }` |
| POST | `/owner/actions/unban-user` | `{ "user_id": "uuid" }` |
| POST | `/owner/actions/ban-ip` | `{ "ip": "...", "reason": "..." }` |
| POST | `/owner/actions/ban-device` | `{ "device_fingerprint": "...", "reason": "..." }` |
| POST | `/owner/actions/reset-password` | `{ "user_id": "uuid" }` |
| POST | `/owner/actions/force-logout` | `{ "user_id": "uuid" }` |
| POST | `/owner/actions/clear-cache` | `{}` |
| POST | `/owner/actions/reindex-search` | `{}` |
| POST | `/owner/actions/run-backup` | `{}` |
| POST | `/owner/actions/restore-backup` | `{ "backup_id": "..." }` |

**Response `202`:** action accepted with `job_id` where async

---

## Log Endpoints

| Method | Path |
|--------|------|
| GET | `/owner/logs/activity` |
| GET | `/owner/logs/security` |
| GET | `/owner/logs/violations` |
| GET | `/owner/logs/fraud` |
| GET | `/owner/logs/disputes` |
| GET | `/owner/logs/payouts` |
| GET | `/owner/logs/emails` |
| GET | `/owner/logs/sms` |
| GET | `/owner/logs/jobs` |

Query: `since`, `until`, `page`, `per_page`, `user_id` (where applicable)

---

## Lockdown

| Method | Path |
|--------|------|
| GET | `/owner/lockdown` |

Returns readiness checklist for emergency lockdown mode.

---

## Audit Export

| Method | Path |
|--------|------|
| GET | `/owner/export/audit` |

Query: `from`, `to`  
Returns signed URL or streaming archive of audit bundle.

---

## API Keys

| Method | Path |
|--------|------|
| GET | `/owner/api-keys` |
| POST | `/owner/api-keys` |
| DELETE | `/owner/api-keys/:keyId` |

---

## Alerts

| Method | Path |
|--------|------|
| GET | `/owner/alerts` |

Post-launch monitor and cron-generated alerts.

---

## Dispute / Fraud Resolution (Owner)

Internal handlers (exact paths may map to action handlers):

- Resolve dispute with outcome + refund instruction
- Close fraud case with account action flags

Implemented in `backend/owner/manual_dispute_review.js` and `manual_fraud_review.js` with server route wrappers.

---

## Error Codes

| Code | Meaning |
|------|---------|
| `owner_forbidden` | Missing owner role |
| `action_failed` | Downstream error |
| `lockdown_active` | Mutations restricted |

---

## Related

- `docs/owner_tools.md`
- `docs/security.md`
