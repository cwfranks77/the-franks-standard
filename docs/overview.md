# Platform Overview — Technical Documentation

The Franks Standard (TFS) is a **Nuxt 3** multi-vendor marketplace with server API routes, Supabase persistence, Stripe payments, and owner-operated administration tools.

---

## Product Summary

| Attribute | Description |
|-----------|-------------|
| Type | Multi-vendor marketplace |
| Focus | Authentic gear — collectibles, audio, specialty |
| Brand lane | B&C Performance Audio (competition audio; shared rails) |
| Operator model | Owner-operated with manual fraud/dispute escalation |
| Default seller fee | 10% (plans and B&C qualification may vary) |

---

## Core Capabilities

- **Listings & stores** — sellers publish inventory under store profiles
- **Checkout** — Stripe; on-platform only
- **Sales tax** — calculated from buyer **shipping destination ZIP** (Louisiana marketplace facilitator compliance)
- **COA** — chain-of-custody uploads hashed and order-linked
- **Fraud** — reporting, monitoring, owner review queue
- **Disputes** — buyer-initiated, seller response window, escalation
- **Search** — catalog discovery and recommendations
- **Messaging** — buyer–seller threads with risk monitoring
- **AI agents** — chat and phone FAQ/intake with escalation prompts
- **Owner tools** — status dashboards, actions, logs, audit export, lockdown

---

## Architecture Layers

```
Browser (Nuxt 3 pages/components)
    ↓
server/api/* (Nitro handlers)
    ↓
backend/* (domain services, cron, owner scripts)
    ↓
Supabase (Postgres, auth, storage)
    ↓
Stripe (payments, Connect payouts, refunds)
```

---

## Repository Areas (Conceptual)

| Path | Role |
|------|------|
| `pages/`, `components/` | Franks marketplace UI shell |
| `server/api/` | HTTP API for app and owner |
| `backend/` | Jobs, owner actions, AI routers, launch validation |
| `supabase/migrations/` | Schema evolution |
| `content/`, `brand/`, `marketing/` | Copy and onboarding |
| `docs/` | Technical documentation (this tree) |

B&C Performance Audio maintains isolated UI namespace per architecture locks; shares checkout and backend.

---

## Users

- **Buyers** — browse, checkout, disputes, reviews
- **Sellers** — Stripe Connect, listings, COA, payouts
- **Owner** — elevated endpoints for status, actions, logs
- **AI agents** — read-only knowledge base + bounded actions

---

## Compliance Highlights

- No off-platform payment facilitation
- Tax on shipping ZIP, not billing address
- Owner income tax reserve logic in financial backend (operator accounting)
- Law enforcement reports manual only

---

## Related Documents

- [architecture.md](architecture.md)
- [security.md](security.md)
- [fraud_systems.md](fraud_systems.md)
- [payments_and_payouts.md](payments_and_payouts.md)
- [api_overview.md](api_overview.md)
