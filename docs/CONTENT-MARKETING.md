# Content marketing playbook

Public hub: **https://thefranksstandard.com/learn**

## What ships in the repo

| Asset | Location | Purpose |
|--------|----------|---------|
| Article catalog | `utils/contentHub.js` | How-tos, best-of, trust guides |
| Learn hub | `pages/learn/index.vue` | SEO landing for all content |
| Video library | `pages/learn/videos.vue` | YouTube embeds when `youtubeId` is set |
| Free tools | `pages/learn/tools/*` | Calculators + printable checklist |
| Seller playbook | `/learn/seller-playbook` | Ebook-style long guide (HTML, print-friendly) |

## Blog / articles (add more)

1. Open `utils/contentHub.js` → `LEARN_ARTICLES`.
2. Copy an existing article object; set unique `slug`, `blocks`, `related`.
3. Deploy; request indexing in Google Search Console for `/learn/your-slug`.

**Topic ideas for next posts**

- “How to price graded sports cards in 2026”
- “PSA vs BGS: what buyers expect on a proof-first marketplace”
- “Best inventory tools for card shops (CSV, eBay, Franks import)”

## Video production queue

Film short (2–5 min) vertical-friendly cuts, then upload to YouTube. Add the video ID in `LEARN_VIDEOS`:

```js
{ id: 'ebay-import-walkthrough', youtubeId: 'dQw4j...', ... }
```

**Suggested scripts (already titled in `/learn/videos`)**

1. Platform tour — browse → listing → escrow
2. eBay CSV import end-to-end
3. COA vs signed guarantee
4. Video inspect demo
5. Fee comparison spreadsheet
6. Why Venmo/email is blocked in listings

**Distribution**

- YouTube (primary)
- Facebook Page / Instagram Reels (link in bio → `/go/postcard` or `/learn`)
- Pin fee calculator: `/learn/tools/fee-calculator`

Set `CONTENT_SOCIAL.youtubeChannel` in `contentHub.js` when the channel exists.

## Free tools as lead magnets

Share these URLs in posts and ads (no login):

- `/learn/tools/fee-calculator` — “See what you keep on a $500 card”
- `/learn/tools/listing-cost` — “10 free listings, then what?”
- `/learn/tools/authenticity-checklist` — printable staff SOP

## E-book

The **Seller Playbook** is `/learn/seller-playbook` — print from browser (PDF) or link in outreach email:

`https://thefranksstandard.com/learn/seller-playbook?utm_source=email&utm_campaign=playbook`

## Measurement

- Google Search Console: impressions/clicks on `/learn/*`
- `profiles.signup_ref=learn` when using `/go/postcard?ref=learn` or UTM on register links
- YouTube Studio: watch time per tutorial

## Weekly rhythm (30–60 min)

1. Publish or update one article block in `contentHub.js`
2. Post one short clip + link to a learn page
3. Request indexing for the new URL in Search Console
