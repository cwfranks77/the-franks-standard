# Owner Tools

Administrative interfaces and backend scripts for the platform operator.

---

## Philosophy

The Franks Standard is **owner-operated**. Critical fraud, dispute, and security decisions escalate to human review—not fully automated policy engines.

---

## API Namespace

Base path: `server/api/owner/`

### Status (`/owner/status/*`)

Read-only health and queue snapshots:

| Endpoint | Purpose |
|----------|---------|
| `platform` | Overall platform health |
| `financial` | Revenue, holds, payout exposure |
| `security` | Auth anomalies, lockdown state |
| `fraud` | Open fraud cases |
| `disputes` | Escalated dispute queue |
| `users` | User counts, freeze summary |
| `stores` | Store status, B&C qualification counts |

### Actions (`/owner/actions/*`)

Mutating operations (logged):

| Action | Purpose |
|--------|---------|
| `freeze-user` / `unfreeze-user` | Account financial/access hold |
| `ban-user` / `unban-user` | Policy ban |
| `ban-ip` / `ban-device` | Network/device block |
| `reset-password` | Assisted recovery (audited) |
| `force-logout` | Session revocation |
| `clear-cache` | Cache bust |
| `reindex-search` | Search rebuild |
| `run-backup` / `restore-backup` | Backup operations |

### Logs (`/owner/logs/*`)

| Log | Content |
|-----|---------|
| `activity` | General owner actions |
| `security` | Security events |
| `violations` | Policy violations |
| `fraud` | Fraud case trail |
| `disputes` | Dispute state changes |
| `payouts` | Payout and hold events |
| `emails` | Transactional email send log |
| `sms` | SMS log |
| `jobs` | Background job results |

### Other

- `GET owner/lockdown` — lockdown readiness
- `GET owner/export/audit` — audit export bundle
- `GET/POST owner/api-keys` — integration keys
- `GET owner/alerts` — alert feed

---

## Backend Scripts

| Script | Role |
|--------|------|
| `backend/owner/manual_fraud_review.js` | Fraud queue processing |
| `backend/owner/manual_dispute_review.js` | Dispute escalation |
| `backend/owner/final_lockdown_check.js` | Pre-lockdown validation |
| `backend/owner/export_audit.js` | Audit export generation |
| `backend/owner/get_*_status.js` | Status aggregators |
| `backend/owner/actions.js` | Shared action helpers |

---

## Launch & Monitor

- `backend/launch/validate_platform.js` — pre-go-live checks
- `backend/cron/post_launch_monitor.js` — ongoing health

---

## Access Control

- Owner credentials separate from seller admin
- All actions write to activity log with actor id and timestamp
- API keys rotatable via owner UI

---

## Financial Oversight

Owner financial status includes:

- Platform fee collection
- Tax remittance buckets
- 25% owner income tax reserve tracking (operator accounting)
- Distributor wholesale transfer logs
- Dispute/payout holds

---

## AI Escalation

Chat and phone agents route to owner when:

- Refund amount guarantees requested
- Law enforcement involvement
- Policy override demands

---

## Related

- [security.md](security.md)
- [fraud_systems.md](fraud_systems.md)
- `docs/api/owner_endpoints.md`
