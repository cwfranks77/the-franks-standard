# Niche focus & limited collections

Differentiate from generic eBay browse: curated niches, limited-edition spotlights, and campaign URLs that emphasize **exclusivity + secure transactions** (COA/guarantee + Stripe escrow).

## Public URLs

| Page | URL |
|------|-----|
| Collections hub | https://thefranksstandard.com/collections |
| Niche lander | https://thefranksstandard.com/collections/graded-sports-cards (etc.) |
| Limited browse | https://thefranksstandard.com/browse?limited=1 |
| Collection filter | https://thefranksstandard.com/browse?collection=floor-drop-psa-week |
| Learn article | https://thefranksstandard.com/learn/niche-collections-vs-ebay |
| Ops toolkit | https://thefranksstandard.com/ops/niche-collections (owner) |

## Data model

Migration `supabase/migrations/020_limited_collections.sql`:

- `listings.is_limited_edition` (boolean)
- `listings.collection_slug` (text — matches slugs in `utils/nicheCollections.js`)
- `listings.collection_label` (short badge text)

Without migration, listings still publish; limited badges fall back to title keywords (`limited edition`, `floor drop`, etc.).

## Seller flow

`/sell` → **Collections & limited edition**:

1. Checkbox: limited edition / exclusive drop  
2. Optional collection slug (niche or floor-drop)  
3. Optional badge label  

## Campaign copy

Use `promoCampaignCopy(niche)` from `utils/nicheCollections.js` or Ops → Niche collections → **Copy promo**.

Pair with outreach tracking (`/go/*`, `ref`, UTM) from `docs/OUTREACH-TRACKING.md`.

## Promotional angles (vs eBay)

- **Graded cards / coins / TCG** — proof required, not optional authenticity claims  
- **Limited drops** — scarcity with escrow, not off-platform payment  
- **Fees** — use live numbers from `utils/pricingPublic.js` in copy  

## SEO

After deploy, add `/collections` and key `/collections/*` slugs to `public/sitemap.xml` and Search Console.
