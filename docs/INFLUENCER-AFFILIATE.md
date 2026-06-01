# Influencer & affiliate program

## Public pages

| Page | URL |
|------|-----|
| Partnerships overview | https://thefranksstandard.com/partners |
| Creator application info | https://thefranksstandard.com/partners/creators |
| Ops link generator | https://thefranksstandard.com/ops/influencers (owner) |

## Tracking

Each creator gets a **short link**:

```
https://thefranksstandard.com/r/{handle}
```

Example: `https://thefranksstandard.com/r/card-break-joe`

This sets:

- `ref=aff-{handle}`
- `aff={handle}`
- `utm_source=affiliate`, `utm_medium=influencer`, `utm_campaign={tier}`
- Optional promo `CREATOR` on register

Signups store `signup_affiliate_handle` and `signup_affiliate_tier` on `profiles` (migration `019_affiliate_influencers.sql`).

### Measure performance

```sql
select signup_affiliate_handle, signup_affiliate_tier, count(*) as signups
from profiles
where signup_affiliate_handle is not null
group by 1, 2
order by signups desc;
```

## Tiers (launch deals)

| Tier | Followers | Typical deal |
|------|-----------|--------------|
| Nano | 1K–10K | 1 month Pro per 3 referred sellers who list |
| Micro | 10K–100K | Flat post fee + per-signup bonus (email agreement) |
| Macro | 100K+ | Custom co-marketing / sponsorship |

Payouts are **manual** during launch — verify listings before paying.

## FTC compliance

Creators must include clear paid partnership language. Template on `/partners/creators` and in Ops media kit copy.

## Co-marketing ideas

- Feature creator store on `/learn` or social
- “Best breaks” roundup article with tracked links
- Joint live stream using `/video` inspect + escrow demo
- Bundle: creator audience gets `FOUNDERS10` if spots remain

## Adding partners

1. **Ops UI** — `/ops/influencers` → save to local roster + copy link  
2. **Code seed** — `utils/affiliateProgram.js` → `AFFILIATE_PARTNERS_SEED`  
3. **Supabase** — `affiliate_partners` table (status `active`) for long-term CRM  

## Promo codes

| Code | Purpose |
|------|---------|
| `CREATOR` | Affiliate tracking (outreach program — no auto Pro; team confirms perks) |
| `FOUNDERS10` | 3 months Pro — first 10 sellers (scarce) |

## Outreach to nano/micro creators

1. Search YouTube/TikTok: “sports card break”, “coin shop”, “TCG store tour”  
2. DM or email with media kit + **personal** `/r/handle` link  
3. Offer nano tier first; upgrade to micro after 3+ converting signups  
4. Never pay for undisclosed ads or fake accounts  
