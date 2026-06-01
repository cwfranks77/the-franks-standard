# Mail physical eBay sellers (500 postcard run)

## Postcard

- **Design (print / Lob upload):** https://thefranksstandard.com/mail/postcard-design.html
- **Back copy (Lob text):** `assets/email-campaign/postcard-copy.txt`

## Workflow

1. Owner unlock → **Mail physical sellers** (`/ops/mail-prospects`)
2. Save an eBay search (sports cards, coins, comics) → upload HTML
3. For each seller (prioritize **Store** badge): **Physical ↗** → **Maps ↗** → paste street address in the table
4. Check **Mail ready** only when the address is verified
5. **Copy mail CSV** → save as `mail-ready.csv`
6. Upload postcard front to Lob → `LOB_POSTCARD_FRONT_URL` in `.env`
7. Dry run: `npm run mail:lob-batch -- --csv ./mail-ready.csv --dry-run`
8. Live: `npm run mail:lob-batch -- --csv ./mail-ready.csv` (fund Lob wallet first)

## Cost ballpark (500)

| Item | Est. |
|------|------|
| Print 500 postcards (if not using Lob print) | $70–130 |
| Lob 500 × ~$0.58–0.87 (print + postage) | $290–435 |

## Maps-first alternative

On `/ops/mail-prospects`, use preset Maps searches (card shop, coin, comic, pawn). For each business, Google `"Shop Name" site:ebay.com` before mailing.
