# Full site QA checklist

Use after every deploy. Automated + manual.

## 1. Automated (in browser, owner)

1. Unlock owner mode → **Ops panel** → **Full site QA (all routes)** (`/ops/site-qa`)
2. Click **Run all route checks** — target **0 fail** (warn OK for dynamic sample URLs)
3. **Ops panel** → **Checkout QA** → run built-in smoke tests

CLI (before push):

```bash
node scripts/check-site-routes.cjs
npm run generate
```

## 2. Navigation & chrome

| Area | Test |
|------|------|
| Header logo | Home |
| Explore mega menu | Every link in 4 sections |
| Mobile quick tiles | Browse, Sell, Call, Sign in, Join |
| Trust chips | How it works, Import, Store builder, Video, FOUNDERS10 |
| Footer 4 columns | Every link opens |
| Owner FAB | Sell (when unlocked) |

## 3. Buyer flows

| Step | Page |
|------|------|
| Browse / filter | `/browse`, `/categories`, `/collections` |
| Listing | Photos, COA bond, buy now / bid |
| Checkout cancel | Returns to listing |
| COA verify | `/verify/coa/[serial]` |
| Report fake | Modal submits |

## 4. Seller flows (requires policy signature)

| Step | Page |
|------|------|
| Policy gate | `/sell` — sign all policies first |
| Direct listing | Publish draft or full |
| Dropship | `/sell/dropship-setup` wizard |
| Import | `/sell/import` CSV |
| Dashboard | Listings, orders, connect Stripe |

## 5. Legal / trust (must load)

- `/marketplace-policy`
- `/protection`
- `/terms`, `/seller-agreement`, `/privacy`, `/prohibited-items`

## 6. Ops toolkit

All pages in `utils/siteRoutes.js` with `group: 'ops'`.

## 7. Triple pass

See `POST-DEPLOY-TRIPLE-TEST.md` — run pass 1–3 on different days or browsers before major ads.

Route registry: `utils/siteRoutes.js` (update when adding pages).
