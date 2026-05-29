# Reddit & blog outreach

Public hub: **https://thefranksstandard.com/social/community**  
Social hub: **https://thefranksstandard.com/social**

## Golden rules (Reddit)

1. **Value first** — teach (COA, escrow, fee math) before you pitch.
2. **No link-drops in titles** — many subs remove promotional titles; put `thefranksstandard.com` in comments when asked.
3. **10:1 ratio** — ten helpful comments for every post that mentions your site.
4. **Read sidebar rules** — r/sportscards, r/Coins, r/Flipping, r/EbaySeller each differ.
5. **Use UTMs** — `?utm_source=reddit&utm_medium=community&utm_campaign=<sub>` for signup tracking.

Copy-paste posts live in `utils/securityDifferentiators.js` → `buildRedditValuePost()`.

## What to lead with (security differentiators)

| Feature | One-liner for posts |
|---------|---------------------|
| Floor office COA | Serial FS-YYYY-NNNNNN = one listing office |
| Verify | Buyers scan at `/verify/coa` before paying |
| Escrow | Stripe hold until delivery confirmed |
| Authenticity scan | Blocks “no guarantee” / Venmo in listings |
| Forced refund | Seller-at-fault → ops can refund per policy |
| Account freeze | Refuse refund → freeze + platform debt until repaid |
| Policy signature | Sellers sign full bundle before first listing |
| Video inspect | Live room before high-$ escrow |

Binding text: `/marketplace-policy` · Marketing: `/protection`

## Subreddit targets

See `REDDIT_COMMUNITY_TARGETS` in `utils/securityDifferentiators.js`.

**Week 1–2:** Comment only — answer “is this real?” threads with checklist links (fee calculator, authenticity checklist).

**Week 3:** One educational text post per sub (use “Educational” variant in caption builder).

**Week 4+:** AMA or founder story if mods approve.

## Blogging sites

| Site | Use for |
|------|---------|
| **Medium** | Long COA / enforcement articles |
| **Substack** | Weekly seller newsletter |
| **Indie Hackers** | Milestone posts (escrow, freeze policy shipped) |
| **Product Hunt** | Launch “Proof before publish” |
| **Hacker News** | Show HN when stable — expect hard questions |
| **Blowout Forums** | Hobby credibility — help threads first |
| **LinkedIn Articles** | B2B shop owners |

Outlines: `buildBlogArticleOutline()` in same util file.

## Weekly cadence

| Day | Action |
|-----|--------|
| Mon | LinkedIn post (security or fees) |
| Tue–Wed | Reel/TikTok — one security hook |
| Thu | 5 Reddit helpful comments |
| Fri | Draft 1 blog section OR Indie Hackers update |
| Sat | Review `profiles.signup_utm_source` for reddit |

## Paid Reddit ads

Ops marketing panel includes Reddit Ads starter copy. Organic community beats ads for trust — run ads only after organic posts get engagement.

## Compliance

- Do not promise “unlimited money-back” in posts — point to `/marketplace-policy` refund table.
- FTC: paid influencer posts need `#ad`.
- No off-platform payment CTAs in posts.

## SQL — track Reddit signups

```sql
select signup_utm_source, signup_utm_campaign, count(*)
from profiles
where signup_utm_source = 'reddit'
   or signup_utm_medium = 'community'
group by 1, 2
order by count desc;
```

## Files to update when features ship

- `utils/securityDifferentiators.js`
- `pages/social/index.vue`
- `pages/social/community.vue`
- `assets/SOCIAL_MEDIA_ADS.md`
