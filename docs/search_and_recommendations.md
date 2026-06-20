# Search and Recommendations

Catalog discovery, indexing, and personalization on The Franks Standard.

---

## Search Goals

- Help buyers find **authentic gear** across multi-vendor inventory
- Support category, price, condition, COA, and seller-trust filters
- Surface B&C Performance Audio lane listings without merging brand UX
- Maintain acceptable latency at marketplace-scale listing counts

---

## Index Model

Each listing document typically includes:

| Field | Use |
|-------|-----|
| `listing_id`, `store_id` | Identity |
| `title`, `description` | Full-text |
| `category_path` | Browse / filter |
| `price_cents` | Range filter, sort |
| `condition` | Filter |
| `coa_required`, `coa_present` | Trust filter |
| `brand_lane` | `tfs` default; `bc_audio` when qualified |
| `seller_rating_avg` | Ranking signal |
| `created_at`, `updated_at` | Freshness sort |
| `ship_from_zip` | Proximity / shipping estimates (adjacent services) |

Index rebuild: owner action `reindex-search`.

---

## Query Pipeline

1. Parse user query (tokenization, typo tolerance optional)
2. Apply hard filters (category, price band)
3. Score: text relevance + business boosts (COA present, rating, recency)
4. Paginate results for grid UI
5. Log query for analytics (privacy-respecting aggregation)

---

## Filters (Buyer-Facing)

- Category / department
- Price min/max
- Condition
- COA / authenticated eligible
- Free or fast shipping flags when available
- Seller rating threshold

---

## Sort Modes

- **Relevance** (default on keyword search)
- **Price** ascending / descending
- **Newest**
- Optional: **Best selling** when sales velocity data exists

---

## Recommendations

Secondary surfaces (home, listing detail, post-cart):

| Signal | Weight idea |
|--------|-------------|
| Co-viewed listings | Related items |
| Same seller store | Cross-sell |
| Category affinity | Browse continuation |
| Past orders (logged-in) | Personalized rails |

Cold start: popular in category + COA-trusted listings.

Recommendations must not bypass authenticity filters for "high trust" badges.

---

## B&C Lane

- `brand_lane: bc_audio` filter or dedicated search scope
- Competition-audio attributes (e.g. impedance, RMS class) as structured facets when schema populated
- Same index cluster as TFS—logical partition, not duplicate DB

---

## Abuse Prevention

- Keyword spam penalized in ranking
- Delisted / fraud-frozen listings excluded from index
- Rate limit search API per IP/account

---

## API

Search endpoints documented under listings/catalog sections in `api_overview.md`. Owner reindex is write action only.

---

## Operations

- Monitor index lag after bulk imports
- Post-launch monitor may alert on search error rate
- Validate platform script checks index health at launch

---

## Related

- [architecture.md](architecture.md)
- `content/buyer_onboarding/how_to_search.md`
