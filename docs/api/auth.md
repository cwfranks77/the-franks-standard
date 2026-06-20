# API — Authentication

Session and identity endpoints for buyers, sellers, and owner.

---

## Mechanism

- **Supabase Auth** issues JWT access tokens and refresh tokens
- Nuxt server routes validate session via Supabase server client
- Role claims distinguish `buyer`, `seller`, `owner` (owner may be separate table flag)

---

## Endpoints (Conceptual)

### `POST /auth/signup`

Create account.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "********",
  "display_name": "Jane Buyer"
}
```

**Response `201`:**
```json
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "session": { "access_token": "...", "expires_at": 1234567890 }
}
```

---

### `POST /auth/login`

**Body:** `email`, `password`  
**Response `200`:** session object + user profile summary

---

### `POST /auth/logout`

Invalidate current session server-side where supported.  
**Response `204`**

---

### `POST /auth/password-reset-request`

Sends reset email via Supabase.  
**Response `202`** (always generic message to prevent email enumeration in production)

---

### `GET /auth/session`

**Auth required:** optional (returns null if anonymous)

**Response `200`:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "roles": ["buyer", "seller"]
  },
  "expires_at": 1234567890
}
```

---

## Owner Authentication

Owner routes under `/owner/*` require:

- User with `owner` role, **or**
- Valid **owner API key** header: `X-Owner-Api-Key: <key>`

API keys managed at `GET/POST /owner/api-keys`.

---

## Security Notes

- Passwords never logged
- Rate limit login and signup per IP
- `force-logout` owner action revokes sessions for targeted user
- JWT must not be stored in localStorage if cookie-based SSR session is used—follow Nuxt Supabase module patterns

---

## Errors

| Code | Meaning |
|------|---------|
| `invalid_credentials` | Login failed |
| `email_taken` | Signup duplicate |
| `weak_password` | Policy rejection |
| `session_expired` | Refresh required |

---

## Related

- [users.md](users.md)
- [owner_endpoints.md](owner_endpoints.md)
- `docs/security.md`
