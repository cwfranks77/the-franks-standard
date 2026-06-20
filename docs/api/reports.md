# API — Reports

General reporting endpoints (policy violations, authenticity, abuse).

---

## `POST /reports`

**Auth:** required

Unified report intake (may fan out to fraud or violations queue).

**Body:**
```json
{
  "target_type": "listing",
  "target_id": "uuid",
  "category": "authenticity",
  "description": "Seller reused COA from another listing.",
  "attachment_ids": []
}
```

**target_type:** `listing` | `user` | `message` | `order`  
**category:** `authenticity` | `off_platform_payment` | `harassment` | `prohibited_item` | `spam` | `other`

**Response `201`:**
```json
{
  "id": "uuid",
  "status": "open"
}
```

---

## `GET /reports/me`

**Auth:** reporter

History of submitted reports.

---

## Routing Logic (Backend)

| Category | Primary queue |
|----------|----------------|
| authenticity, counterfeit | Fraud |
| off_platform_payment | Fraud + violations |
| harassment | Violations / moderation |
| prohibited_item | Violations + listing review |

---

## Rate Limits

Max reports per user per day to prevent abuse—`429` when exceeded.

Duplicate reports on same target may merge into existing case.

---

## Owner

`GET /owner/logs/violations` — aggregated violation stream

---

## Related

- [fraud.md](fraud.md)
- [messages.md](messages.md)
