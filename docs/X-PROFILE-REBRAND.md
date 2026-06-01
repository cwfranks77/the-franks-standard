# Rebrand X from ZFuel → The Franks Standard

## Automated (API)

From repo root with X keys in `.env` (same app tied to your current X account):

```powershell
npm run x:rebrand
```

This sets:

- **Name:** The Franks Standard  
- **Bio:** proof-first marketplace, COA, escrow, fees, AI + dropship, eBay import  
- **Website:** https://thefranksstandard.com  
- **Profile photo:** `public/franks-pavilion.png` (downloaded from live site if missing)

Dry run: `node scripts/update-x-profile.cjs --dry-run`

## Manual (required for @username)

X does **not** always allow API username changes. In the X app or [x.com/settings/profile](https://x.com/settings/profile):

1. **Username** → change `@zfuel` to `@thefranksstandard` (or closest available).
2. Confirm **display name** = **The Franks Standard**.
3. Confirm **profile photo** = pavilion / Franks logo (not ZFuel).
4. **Banner** (optional): upload wide brand image from `assets/` or Canva using `public/franks-pavilion.png`.

## Post updated ads

After profile is fixed, post fresh copy:

```powershell
npm run post:social -- --x
# or all channels:
npm run post:social
```

Copy for Meta ads is in **Ops → Social Media Ads** (`/ops/ads`) — updated for new features.

## Brand guard

Scripts block posting copy that contains `zfuel`, `zentrafuel`, or `zentramesh`.
