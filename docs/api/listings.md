# API — Listings

Catalog CRUD, search, and COA fields.

---

## `GET /listings`

Search/browse.

**Query parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Full-text query |
| `category` | string | Category slug/path |
| `min_price` | int | Cents |
| `max_price` | int | Cents |
| `condition` | string | new, used, etc. |
| `coa` | boolean | COA present filter |
| `brand_lane` | string | `bc_audio` or omit for all |
| `sort` | string | relevance, price_asc, price_desc, newest |
| `page`, `per_page` | int | Pagination |

**Response `200`:** paginated listing cards

---

## `GET /listings/:listingId`

Full listing detail.

```json
{
  "id": "uuid",
  "store_id": "uuid",
  "title": "Amp Model X 3000W",
  "description": "...",
  "price_cents": 49900,
  "condition": "used",
  "quantity": 1,
  "images": [{ "url": "...", "sort": 0 }],
  "coa": {
    "required": true,
    "uploaded": true,
    "serial": "COA-2026-000123",
    "verification_enabled": true
  },
  "category_path": "audio/amplifiers",
  "ship_from_zip": "70112",
  "created_at": "..."
}
```

---

## `POST /listings`

**Auth:** seller with active store

**Body:**
```json
{
  "title": "...",
  "description": "...",
  "price_cents": 19900,
  "condition": "used",
  "quantity": 1,
  "category_id": "uuid",
  "images": ["storage_key_1"],
  "coa_upload_ids": ["uuid"],
  "attributes": {}
}
```

**Response `201`:** listing object

Validation fails if `coa.required` for category and no COA provided.

---

## `PATCH /listings/:listingId`

**Auth:** owning seller

Partial update; major changes on orders with active buyers may be restricted.

---

## `DELETE /listings/:listingId`

**Auth:** owning seller

Soft-delete or end listing; cannot delete with open unpaid orders.

---

## `POST /listings/:listingId/coa`

Upload or attach COA.

**Multipart** or JSON with storage reference:

```json
{
  "files": ["storage_key"],
  "item_serial": "SN12345"
}
```

**Response:** hash recorded, serial assigned if applicable

---

## `GET /listings/:listingId/coa/verify`

**Auth:** optional (public if enabled)

**Query:** `serial=COA-2026-000123`

**Response `200`:**
```json
{
  "valid": true,
  "listing_id": "uuid",
  "issued_at": "..."
}
```

---

## Checkout Adjacency

`POST /orders/checkout` (separate order module) validates listing price/inventory snapshot at payment time—not documented in full here.

Tax uses buyer shipping ZIP from session/cart address.

---

## Related

- [stores.md](stores.md)
- `docs/search_and_recommendations.md`
- `docs/payments_and_payouts.md`
