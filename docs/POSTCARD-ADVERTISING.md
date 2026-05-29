# Postcard advertising sample

**Open the sample:** https://thefranksstandard.com/mail/postcard-design.html  
(Also from Ops panel → **Postcard sample (print/mail)**)

## What it sells (your focus)

| Pillar | On the card |
|--------|-------------|
| **Security** | COA, verify serial, escrow, written enforcement |
| **Low price** | 4–5% fees vs ~13% stacked |
| **Seller perks** | FOUNDERS10, HONOR26, AI store, eBay import, video inspect |
| **Volume rewards** | **Seller Excellence** — top sellers every 6 months; #1 gets **0% platform fees for 30 days** |

Public program page: `/top-sellers`

## What you do vs what to delegate

| You | Me / automation |
|-----|------------------|
| Approve the design once | Keep copy in sync (`utils/postcardMessaging.js`, `postcard-copy.txt`) |
| Add Lob key when ready to mail | `npm run mail:lob-sample` / batch via ops |
| Pick prospect addresses | Ops → Mail physical sellers |
| — | Social posts 3×/week (already on Telegram etc.) |

## Print a physical sample

1. Open `/mail/postcard-design.html`
2. Browser **Print → Save as PDF** (6×4 in, margins none)
3. Order prints at Staples / local shop, or upload PDF to Lob

## Mail via Lob (when you want)

1. `.env` → `LOB_API_KEY`, `LOB_POSTCARD_FRONT_URL` (from uploaded front art)
2. Back text auto-loads from `assets/email-campaign/postcard-copy.txt`
3. `npm run mail:lob-sample -- --dry-run ...` then live send

Copy source files:

- `public/mail/postcard-copy.txt` (back, live site)
- `assets/email-campaign/postcard-copy.txt` (Lob script)
- `utils/postcardMessaging.js` (canonical for future edits)
