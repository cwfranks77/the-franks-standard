# API — Fraud

Fraud reporting and case status (user-scoped + owner).

---

## `POST /fraud/reports`

**Auth:** required

Create authenticity or scam report.

**Body:**
```json
{
  "type": "authenticity",
  "listing_id": "uuid",
  "order_id": "uuid",
  "description": "COA serial does not verify; item looks re-labeled.",
  "attachment_ids": ["uuid"]
}
```

**Types:** `authenticity`, `off_platform_payment`, `counterfeit`, `other`

**Response `201`:**
```json
{
  "id": "uuid",
  "status": "received",
  "created_at": "..."
}
```

Also available via UI **Report authenticity** on listing/order.

---

## `GET /fraud/reports/me`

**Auth:** reporter

List own submitted reports (limited fields).

---

## `GET /fraud/cases/:caseId`

**Auth:** involved parties or owner

User-visible status only—no internal investigator notes.

```json
{
  "id": "uuid",
  "status": "under_review",
  "linked_order_id": "uuid",
  "updated_at": "..."
}
```

Statuses: `received`, `under_review`, `resolved`, `dismissed`

---

## Signals (Internal — Not Public REST)

Automated pipeline ingests:

- Message NLP flags
- Device/IP risk scores
- COA hash mismatches
- Duplicate serial attempts

Owner views via `GET /owner/status/fraud` and `GET /owner/logs/fraud`.

---

## Owner Actions

Link report to case, freeze account, remove listings—via owner actions and `manual_fraud_review.js`.

Law enforcement package generation is manual export—not an API consumers call.

---

## Related

- [reports.md](reports.md)
- `docs/fraud_systems.md`
- [disputes.md](disputes.md)
