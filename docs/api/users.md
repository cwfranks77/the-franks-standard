# API — Users

User profiles and account management.

---

## `GET /users/me`

**Auth:** required

**Response `200`:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "display_name": "Jane Buyer",
  "roles": ["buyer", "seller"],
  "created_at": "2026-01-15T12:00:00Z",
  "shipping_addresses": [],
  "seller_onboarding_complete": false,
  "stripe_connect_status": "not_started"
}
```

---

## `PATCH /users/me`

Update profile fields.

**Body (partial):**
```json
{
  "display_name": "Jane D.",
  "phone": "+1..."
}
```

**Response `200`:** updated user object

---

## `GET /users/me/addresses`

List saved shipping addresses.

---

## `POST /users/me/addresses`

**Body:**
```json
{
  "line1": "123 Main St",
  "city": "New Orleans",
  "state": "LA",
  "postal_code": "70112",
  "country": "US",
  "is_default": true
}
```

Shipping `postal_code` used for checkout tax calculation.

---

## `GET /users/:id/public`

Public seller/buyer card (safe fields only).

```json
{
  "id": "uuid",
  "display_name": "AudioShop LA",
  "member_since": "2025-06-01",
  "seller_rating_avg": 4.8,
  "seller_review_count": 142
}
```

No email, no internal flags.

---

## Account State Flags (Internal on `me`)

| Field | Meaning |
|-------|---------|
| `frozen` | Cannot transact |
| `banned` | Access denied |
| `email_verified` | Verification status |

Frozen/banned users receive `403` on mutating commerce endpoints.

---

## Seller Onboarding Fields

On `PATCH /users/me/seller` or embedded in seller flow:

- `policies_accepted_at`
- `stripe_connect_account_id`

---

## Related

- [auth.md](auth.md)
- [stores.md](stores.md)
