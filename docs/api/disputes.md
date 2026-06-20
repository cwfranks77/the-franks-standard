# API — Disputes

Order dispute lifecycle endpoints.

---

## `POST /disputes`

**Auth:** buyer (order owner)

**Body:**
```json
{
  "order_id": "uuid",
  "reason": "not_as_described",
  "description": "Received wrong model, photos attached.",
  "attachment_ids": ["uuid"]
}
```

**Response `201`:**
```json
{
  "id": "uuid",
  "status": "opened",
  "seller_response_due_at": "...",
  "created_at": "..."
}
```

---

## `GET /disputes/:disputeId`

**Auth:** buyer or seller on order

Full dispute with timeline.

```json
{
  "id": "uuid",
  "order_id": "uuid",
  "status": "seller_response",
  "reason": "not_as_described",
  "buyer_statement": "...",
  "seller_statement": null,
  "events": [],
  "resolution": null
}
```

---

## `GET /orders/:orderId/disputes`

List disputes for an order (usually one active).

---

## `POST /disputes/:disputeId/seller-response`

**Auth:** seller

**Body:**
```json
{
  "statement": "Tracking shows delivered; photos match listing.",
  "attachment_ids": ["uuid"],
  "proposed_resolution": "none"
}
```

---

## `POST /disputes/:disputeId/buyer-reply`

**Auth:** buyer

Additional evidence during negotiation window.

---

## `POST /disputes/:disputeId/escalate`

**Auth:** buyer or seller

Request platform review when stuck.

Sets `status: escalated` for owner queue.

---

## Owner Resolution (Internal)

`POST /owner/disputes/:id/resolve` — see [owner_endpoints.md](owner_endpoints.md)

**Body:**
```json
{
  "outcome": "buyer_refund_full",
  "notes": "Listing photos showed different serial.",
  "refund_amount_cents": 49900
}
```

Triggers Stripe refund on approval.

---

## Status Enum

`opened` | `seller_response` | `escalated` | `resolved` | `closed`

---

## Related

- `docs/disputes.md`
- [fraud.md](fraud.md)
