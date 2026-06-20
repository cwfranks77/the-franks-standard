# Security

Security posture for The Franks Standard platform.

---

## Principles

1. **Least privilege** — roles scoped buyer, seller, owner
2. **On-platform payments** — reduces PCI scope for seller-buyer direct card exchange
3. **Auditability** — owner logs and export for sensitive actions
4. **Defense in depth** — auth, rate limits, device/IP signals, manual review
5. **No silent LE disclosure** — law enforcement packages manual only

---

## Authentication & Sessions

- Supabase Auth for user identities
- Server routes validate session JWT / cookies per request
- Owner routes require elevated owner credentials (separate from seller)
- **Force logout** owner action revokes active sessions during incidents

---

## Authorization

| Role | Scope |
|------|-------|
| Buyer | Own orders, messages, disputes |
| Seller | Own store, listings, order fulfillment |
| Owner | Global status, actions, logs, export |

API handlers must verify resource ownership before mutate (e.g. seller cannot edit another store's listing).

---

## API Keys

Owner-managed API keys (`server/api/owner/api-keys`) for integrations—rotatable, logged, never embedded in client bundles.

---

## Data Protection

- TLS in transit for all production traffic
- Supabase RLS policies on tenant-scoped tables
- COA and PII stored in controlled buckets with signed URL patterns where applicable
- Audit export gated to owner with activity logging

---

## Threat Monitoring

Signals feeding security/fraud pipelines:

- Failed login velocity
- New device / IP mismatch
- Off-platform payment keywords in messages
- Repeat counterfeit reports
- Chargeback patterns

Owner **security status** endpoint aggregates health metrics.

---

## Incident Response Actions

Owner `actions/` include:

- `ban-user` / `unban-user`
- `ban-ip` / `ban-device`
- `freeze-user` / `unfreeze-user`
- `force-logout`
- `clear-cache`
- `lockdown` check

Use proportionally; all actions should appear in activity/security logs.

---

## AI Safety

- System prompts constrain refund/legal promises
- Escalation prompts route to human owner review
- Knowledge base read-only for factual policies

---

## Secure Development

- No secrets in `pages/` or client composables
- Webhook signature verification for Stripe
- Input validation on all `server/api` POST bodies
- SQL via parameterized Supabase client

---

## Buyer & Seller Education

Security is not only technical—policy enforcement on off-platform pay and harassment supports platform safety. See `brand/safety_principles.md`.

---

## Related

- [fraud_systems.md](fraud_systems.md)
- [owner_tools.md](owner_tools.md)
- `docs/api/auth.md`
