# API — Stores

Multi-vendor store profiles and B&C lane qualification.

---

## `GET /stores/:storeId`

Public store page data.

**Response `200`:**
```json
{
  "id": "uuid",
  "slug": "bc-performance-audio",
  "name": "BC Performance Audio",
  "description": "...",
  "brand_lane": "bc_audio",
  "fee_plan": "bc_audio_qualified",
  "platform_fee_rate": 0.08,
  "rating_avg": 4.9,
  "review_count": 87,
  "member_since": "2025-03-01"
}
```

`brand_lane` null = standard TFS store.

---

## `GET /stores/me`

**Auth:** seller

Own store settings including Stripe status.

---

## `PATCH /stores/me`

**Auth:** seller

**Body (partial):**
```json
{
  "name": "My Gear Shop",
  "description": "...",
  "ship_from_zip": "70112",
  "policies": {
    "handling_days": 2,
    "return_policy": "..."
  }
}
```

---

## `GET /stores/:storeId/listings`

Paginated active listings for storefront.

Query: `page`, `per_page`, `sort`

---

## B&C Qualification

Store record may include:

```json
{
  "bc_audio_qualified": true,
  "bc_audio_qualified_at": "2026-01-01T00:00:00Z"
}
```

Qualification affects `platform_fee_rate` and `brand_lane` for marketing—not security boundaries.

---

## Stripe Connect

```json
{
  "stripe_connect_account_id": "acct_...",
  "stripe_connect_status": "complete",
  "payouts_enabled": true
}
```

Payouts blocked when `payouts_enabled: false` or account frozen.

---

## Owner

`GET /owner/status/stores` — aggregate store health (see [owner_endpoints.md](owner_endpoints.md))

---

## Related

- [listings.md](listings.md)
- [users.md](users.md)
