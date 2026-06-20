# API — Messages

Buyer–seller messaging with risk monitoring.

---

## `GET /messages/threads`

**Auth:** required

List conversation threads for current user.

```json
{
  "data": [
    {
      "id": "uuid",
      "listing_id": "uuid",
      "order_id": null,
      "counterparty": { "id": "uuid", "display_name": "..." },
      "last_message_at": "...",
      "unread_count": 2
    }
  ]
}
```

---

## `GET /messages/threads/:threadId`

Paginated messages in thread.

```json
{
  "data": [
    {
      "id": "uuid",
      "sender_id": "uuid",
      "body": "Is the serial plate visible in photo 3?",
      "attachments": [],
      "created_at": "..."
    }
  ]
}
```

---

## `POST /messages/threads`

Start thread (usually from listing).

**Body:**
```json
{
  "listing_id": "uuid",
  "body": "Hello, is this still available?"
}
```

**Response `201`:** thread + first message

---

## `POST /messages/threads/:threadId/messages`

**Body:**
```json
{
  "body": "Yes, ships tomorrow.",
  "attachments": []
}
```

---

## Risk Monitoring

Messages scanned asynchronously for:

- Off-platform payment keywords
- Phishing URLs
- Harassment patterns

Flagged threads may surface in `owner/logs/violations` or fraud pipeline.

**API behavior:** message may return `201` but trigger backend review; severe cases may block send with `403 policy_violation`.

---

## Blocking

Users cannot message if either party banned/frozen or blocked relationship exists.

---

## Related

- [reports.md](reports.md)
- [fraud.md](fraud.md)
