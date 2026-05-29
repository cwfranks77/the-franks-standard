# Social media promotion playbook

Public hub: **https://thefranksstandard.com/social**  
Reddit & blogs: **https://thefranksstandard.com/social/community**  
Ops toolkit: **https://thefranksstandard.com/ops/social-promo**

## Security messaging (lead with this)

All social posts should mention at least 2 differentiators from `utils/securityDifferentiators.js`:

- COA office serial · verify · escrow · authenticity scan · forced refund · account freeze · seller policy signature · video inspect

Caption builder topic: **Security stack (full)** · Reddit platform in builder.

Full playbook: `docs/REDDIT-AND-BLOG-OUTREACH.md`

## Focus: 3 platforms + community

| Platform | Audience | Best formats |
|----------|----------|--------------|
| **Instagram** | Card breaks, shop staff, younger collectors | Reels, Stories (polls), carousels |
| **TikTok** | Gen Z/Millennial hobbyists, break clips | Shorts &lt;60s, green-screen explainers |
| **LinkedIn** | Shop owners, dealers, serious resellers | Text posts, PDF carousels, founder story |
| **Reddit / blogs** | Hobby subs, flippers, founders | Value-first text, AMA, Medium/Substack |

Do **not** add another paid channel until Instagram, TikTok, or Reddit shows signups in `profiles.signup_utm_source`.

## Content mix

1. **Educational** — fee calculator, import walkthrough, COA explainer  
2. **UGC** — repost sellers’ COA Reels (with permission)  
3. **Interactive** — Story polls, “real or fake?” carousels  
4. **Contests** — FOUNDERS10 while spots remain (verify on-platform)

## Hashtags

Use packs from `/social` or caption builder — blend:

- Brand: `#TheFranksStandard` `#COA` `#Collectibles`  
- Niche: `#SportsCards` `#CardBreak` `#Numismatics`  
- Avoid banned/spam tags; rotate 8–12 per post max on IG/TikTok  

## Trending formats

- **Reels / Shorts** — hook in 2 seconds, on-screen text, CTA in caption  
- **Stories** — poll sticker + link to `/learn/tools/fee-calculator`  
- **LinkedIn** — lead with $ margin math, link to `/compare`  

Scripts and templates live in `utils/socialPromotion.js`.

## Tracked links for social

| Use case | URL |
|----------|-----|
| General sell CTA | `https://thefranksstandard.com/sell?utm_source=instagram&utm_medium=social` |
| Postcard campaign | `https://thefranksstandard.com/go/postcard` |
| Creator affiliate | `https://thefranksstandard.com/r/{handle}` |
| Lead magnet | `https://thefranksstandard.com/learn/tools/fee-calculator` |

## Automation (owner)

```bash
npm run post:social          # Telegram, Facebook, X
npm run x:rebrand            # X profile API
```

Facebook/Instagram tokens: `docs/META-FACEBOOK-SETUP.md`  
Ad copy library: `assets/SOCIAL_MEDIA_ADS.md` · Ops `/ops/ads`

## Weekly cadence (launch)

- **Mon** — LinkedIn post (fees / shop economics)  
- **Tue–Wed** — Same vertical video → TikTok + IG Reel  
- **Thu** — IG Story poll + calculator link  
- **Fri** — UGC reshare or FOUNDERS10 update  

## Compliance

- No off-platform payment language in posts (Venmo, DM me on Insta to buy)  
- FTC: paid creator posts need `#ad` — see `/partners/creators`  
- Contest rules: “while spots last”, verify winners on-platform  

## Measure

```sql
select signup_utm_source, signup_utm_medium, count(*)
from profiles
where signup_utm_medium in ('social', 'influencer')
   or signup_utm_source in ('instagram', 'tiktok', 'linkedin', 'affiliate')
group by 1, 2
order by count desc;
```

Add `utm_source=instagram` (etc.) to bio links for cleaner breakdown.
