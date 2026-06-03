# Google Workspace — info@thefranksstandard.com

Move **mail** to Google Workspace. The **website** stays on GitHub Pages; only DNS mail records change at Namecheap.

## What changes

| Piece | Before | After |
|-------|--------|--------|
| Inbox **info@** | Namecheap Private Email (`mx*.privateemail.com`) | Google Workspace (Gmail) |
| Website | GitHub Pages (A records) | **No change** |
| Domain registrar | Namecheap | **No change** (unless you transfer later) |
| Google Ads login | cwfranks77@gmail.com | Can add **info@** as Admin after Workspace is live |

## DNS snapshot (saved locally)

Full current + target records:  
`C:\Users\ninja\OneDrive\Documents\franks-standard-credentials\DNS-RECORDS-SNAPSHOT.md`

## Blocker check

You need **Namecheap DNS access** (Domain List → thefranksstandard.com → **Advanced DNS**).  
Namecheap login is **cwfranks77@gmail.com**, not info@ — see `franks-standard-credentials/NAMECHEAP-LOGIN-RECOVERY.md`.

If the account is **locked** from the billing dispute, unlock it or fix DNS via Namecheap support first — Workspace setup cannot finish without adding records.

---

## Step 1 — Start Google Workspace

1. Open [Google Workspace signup](https://workspace.google.com/business/signup/welcome).
2. Business name: **The Franks Standard LLC** (or **The Franks Standard**).
3. Domain: **thefranksstandard.com** (use a domain you already own).
4. First user / primary email: **info@thefranksstandard.com**.
5. Choose **Business Starter** (~$7/user/month) unless you need more storage/meetings.
6. Complete billing (Google account — can be cwfranks77@gmail.com as admin).

Google will show **one TXT record** for domain verification — copy it exactly.

---

## Step 2 — DNS at Namecheap (keep website records)

Go to: [Namecheap Advanced DNS — thefranksstandard.com](https://ap.www.namecheap.com/myaccount/login.aspx?ReturnUrl=%2Fdomains%2Fdomaincontrolpanel%2Fthefranksstandard.com%2Fadvancedns)

### Do not remove (GitHub Pages)

Keep existing **A** / **CNAME** host records for `@` and `www` pointing to GitHub (`185.199.108.153` etc. or `charlesfranks77.github.io` CNAME).

### Add — domain verification (from Google Admin)

| Type | Host | Value |
|------|------|--------|
| TXT | `@` | `google-site-verification=XXXXXXXX` (paste from Google) |

### Replace — MX (remove Private Email MX first)

Delete old MX rows:

- `mx1.privateemail.com`
- `mx2.privateemail.com`

Add Google MX (standard Workspace):

| Type | Host | Value | Priority |
|------|------|--------|----------|
| MX | `@` | `ASPMX.L.GOOGLE.COM` | 1 |
| MX | `@` | `ALT1.ASPMX.L.GOOGLE.COM` | 5 |
| MX | `@` | `ALT2.ASPMX.L.GOOGLE.COM` | 5 |
| MX | `@` | `ALT3.ASPMX.L.GOOGLE.COM` | 10 |
| MX | `@` | `ALT4.ASPMX.L.GOOGLE.COM` | 10 |

TTL: Automatic or 30 min.

### Replace — SPF (TXT on `@`)

Delete:

- `v=spf1 include:spf.privateemail.com ~all`

Add:

| Type | Host | Value |
|------|------|--------|
| TXT | `@` | `v=spf1 include:_spf.google.com ~all` |

### Add — DKIM (from Google Admin)

Admin console → **Apps → Google Workspace → Gmail → Authenticate email** → generate DKIM.

Google gives a **CNAME** (e.g. `google._domainkey` → `google.domainkey....`). Add in Namecheap Advanced DNS.

### Optional — DMARC

| Type | Host | Value |
|------|------|--------|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:info@thefranksstandard.com` |

---

## Step 3 — Verify in Google Admin

1. [admin.google.com](https://admin.google.com) → **Account → Domains → Manage domains**.
2. Click **Verify** after TXT propagates (often 15–60 minutes; up to 48h).
3. Activate **Gmail** for the domain when prompted.

Test: sign in at [mail.google.com](https://mail.google.com) as **info@thefranksstandard.com**.

---

## Step 4 — Migrate old mail (optional)

1. In Gmail (info@): **Settings → Accounts → Import mail** from `mail.privateemail.com` (IMAP) while Private Email still works, **or**
2. Export from [privateemail.com](https://privateemail.com) webmail before canceling Namecheap mail.

---

## Step 5 — Update your stack

### Phone / laptop mail

Remove the old **Private Email** account on Android/PC. Add **info@** as Google account or Gmail app (Google sign-in, not IMAP to privateemail).

### Repo / ops (`franks-standard-credentials`)

- `email.env` was for Namecheap IMAP/SMTP — after Workspace, use Gmail or app passwords only where needed.
- `npm run mail:test` (Private Email) will fail — expected.
- **SendGrid**: re-verify `info@thefranksstandard.com` in SendGrid sender authentication (domain DNS may need SendGrid CNAME **in addition** to Google — both can coexist on different hosts).

### Supabase auth emails

If using custom SMTP: [Google SMTP](https://support.google.com/a/answer/176600) with an **App password** on info@ (2FA required) or keep SendGrid for transactional mail.

### Google Ads

See `docs/GOOGLE-ADS-SETUP.md` — invite **info@** as Admin or switch login once info@ works.

---

## Step 6 — Cancel Namecheap Private Email (after cutover)

When info@ receives and sends in Gmail for 48+ hours:

1. Namecheap → domain → **Private Email** → cancel subscription (saves ~$1–2/mo per mailbox).
2. Confirm MX in DNS still point only to Google.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Verification stuck | Wait; check TXT with `nslookup -type=TXT thefranksstandard.com` |
| Mail still goes to Private Email | Old MX cached — confirm MX only Google; flush DNS |
| Can't edit Namecheap DNS | Account lock — support / Risk Management first |
| SendGrid bounces | Update SPF/DKIM; verify sender in SendGrid dashboard |
| Site down | You removed A/CNAME — restore GitHub records only |

---

## Quick links

- [Workspace signup](https://workspace.google.com/business/signup/welcome)
- [Google Admin](https://admin.google.com)
- [Namecheap Advanced DNS](https://ap.www.namecheap.com/myaccount/login.aspx?ReturnUrl=%2Fdomains%2Fdomaincontrolpanel%2Fthefranksstandard.com%2Fadvancedns)
- [Namecheap Private Email panel](https://ap.www.namecheap.com/myaccount/login.aspx?ReturnUrl=%2Fdomains%2Fdomaincontrolpanel%2Fthefranksstandard.com%2Fprivateemail) (cancel after migration)
