# Outreach tracking (postcards, mail, QR)

Measure which campaigns and recipients drive seller signups.

## Three layers

| Layer | What it does |
|--------|----------------|
| **Short URL** `/go/{campaign}` | Logs touch in session; redirects to the right landing with UTM + `ref`. |
| **Promo code** | `FOUNDERS10` (3 mo Pro), `STORE90` (partner tracking — team activates benefits). |
| **`ref` on URL** | Batch or per-shop id stored on the user profile at signup. |

## Campaign URLs (production)

| Campaign | QR / print URL | Lands on |
|----------|----------------|----------|
| Postcard (500 batch) | `https://thefranksstandard.com/go/postcard?ref=pcard500` | Founders10 join |
| Store partner | `https://thefranksstandard.com/go/store90?ref=store90` | Store partner page |
| Import focus | `https://thefranksstandard.com/go/import?ref=import` | `/sell/import` |

Change `ref` per batch: `ref=pcard500`, `ref=la-shops-2026`, etc.

### Per-seller refs (mail CSV)

In **Owner → Mail physical sellers**, set **Batch ref** (e.g. `pcard500`). Exported mail CSV includes:

- `campaign_ref` — e.g. `pcard500-cardshop_la`
- `tracking_url` — unique `/go/postcard?ref=...` per eBay username
- `qr_image_url` — QR image for that URL (Lob merge / research)

## UTM convention

```
?utm_source=postcard&utm_medium=direct_mail&utm_campaign=seller-outreach&ref=pcard500
```

Google Ads (later): `utm_source=google&utm_medium=cpc&utm_campaign=sellers`

## Measuring responses

### 1. Supabase — signups by ref

After migration `018_outreach_attribution.sql`:

```sql
select signup_ref, signup_campaign, signup_promo, count(*) as signups
from profiles
where signup_ref is not null
group by 1, 2, 3
order by signups desc;
```

### 2. Promo redemptions

```sql
select pc.code, pc.uses_count, pc.max_uses
from promo_codes pc
where pc.code in ('FOUNDERS10', 'STORE90');
```

### 3. Google Analytics (when `NUXT_PUBLIC_GADS_ID` is set)

Events: `outreach_touch` with `ref` and `campaign` dimensions.

## Postcard print

- Front QR: `/go/postcard?ref=postcard&promo=FOUNDERS10` (see `public/mail/postcard-design.html`)
- For a **single batch QR** on all 500 cards, use one `ref` (e.g. `pcard500`) in the design URL before print.
- For **per-shop** tracking, use variable QR from CSV `qr_image_url` (advanced Lob merge).

## Deploy checklist

1. Run migration `018_outreach_attribution.sql` on Supabase.
2. Deploy site + `redeem-promo-code` edge function (STORE90 outreach handling).
3. Rebuild and hard-refresh production PWA cache.
