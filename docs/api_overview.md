# API Overview

HTTP API conventions for The Franks Standard Nuxt server routes.

---

## Base URL

- **Development:** `http://localhost:3000/api`
- **Production:** `https://<your-domain>/api`

All paths below are relative to `/api`.

---

## Transport

- JSON request/response bodies unless noted (file upload multipart)
- UTF-8 encoding
- HTTPS required in production

---

## Authentication

| Method | Header / Cookie |
|--------|-----------------|
| Session | Supabase session cookie or `Authorization: Bearer <jwt>` |
| Owner | Owner role claim + optional API key for automation |

Unauthenticated routes: public catalog read, health checks—minimal surface.

See [api/auth.md](api/auth.md).

---

## Conventions

### IDs

UUID strings for `user_id`, `store_id`, `listing_id`, `order_id`, `dispute_id`.

### Timestamps

ISO 8601 UTC (`created_at`, `updated_at`).

### Money

Integer **cents** in API (`price_cents`, `amount_cents`) to avoid float errors.

### Pagination

```json
{
  "data": [],
  "page": 1,
  "per_page": 24,
  "total": 120
}
```

Query: `?page=1&per_page=24`

### Errors

```json
{
  "error": {
    "code": "validation_error",
    "message": "Human readable message",
    "details": {}
  }
}
```

HTTP status: 400 validation, 401 unauth, 403 forbidden, 404 not found, 429 rate limit, 500 server.

---

## Resource Map

| Domain | Doc |
|--------|-----|
| Auth & session | [api/auth.md](api/auth.md) |
| Users & profiles | [api/users.md](api/users.md) |
| Stores | [api/stores.md](api/stores.md) |
| Listings & catalog | [api/listings.md](api/listings.md) |
| Messages | [api/messages.md](api/messages.md) |
| Disputes | [api/disputes.md](api/disputes.md) |
| Fraud & reports | [api/fraud.md](api/fraud.md), [api/reports.md](api/reports.md) |
| Owner admin | [api/owner_endpoints.md](api/owner_endpoints.md) |

---

## Rate Limiting

Applied per IP and per user on:

- Search
- Message send
- Report create
- Auth attempts

429 response with `Retry-After` when enforced.

---

## Webhooks (Inbound)

- **Stripe** — payment success, refund, chargeback, Connect account updates
- Verified via Stripe signature header

Webhook handlers live under `server/api` (exact paths per deployment).

---

## Versioning

Current: implicit v1 (no prefix). Breaking changes require migration notes and client coordination.

---

## CORS

Production CORS limited to site origin; server-side Nuxt calls same-origin.

---

## Related

- [architecture.md](architecture.md)
- [security.md](security.md)
