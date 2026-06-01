# Authentication & COA toolkit — script vs site

Charles’s **Authentication & COA Toolkit v1** (Node-style script) mapped to what The Franks Standard already runs.

## Skip — already stronger on the site

| Script section | What we already have |
|----------------|-------------------|
| **§2 `generateCOA`** | `issue-coa-certificate` edge function: `FS-YYYY-NNNNNN` serial, DB row, `image_fingerprint`, verify URL, revocation on counterfeit |
| **§8 `canPublishListing`** | Sell flow: COA upload / signed guarantee / Franks issued COA; `evaluateCoaListingBond` + checkout blocks bad integrity |
| **§9 `needsManualReview`** | `integrity_status` + `/ops/authenticity` queue + buyer reports |
| **§7 `updateSellerTrust` (0–100 score)** | Seller **ban**, **account freeze**, **debt** — harder enforcement than a soft trust number |

## Added — your script improves the product here

| Script section | Site implementation |
|----------------|---------------------|
| **§3 `validateMeasurements`** | `utils/coinIntegrity.js` — used when `listing.coin_measurements` is present (optional; no sell UI yet) |
| **§4 `scoreSubmission`** | `scoreCoinMeasurements()` — Morgan 26.73 g / 38.1 mm / magnet rules |
| **§5 `highRiskCheck`** | `highRiskCoinCheck()` — 1885-CC, 1889-CC, 1893-S + price &lt; $300, mint mismatch, cheap “UNC” |
| **§6 `evaluateRisk`** | Wired into `scanListingIntegrity()` via `coinIntegrityFlags()` for **Coins & Currency** |

Files:

- `utils/coinIntegrity.js` — browser / sell preview
- `supabase/functions/_shared/coinIntegrity.ts` — edge ops scan
- `utils/authenticityScan.js` + `_shared/authenticityScan.ts` — call coin helpers on publish & ops rescan

## Not on public site (by design)

- **Grading manual** — `docs/GRADING-AND-AUTHENTICATION-MANUAL.txt` (internal / your Documents folder only)
- **Coin study guide** — public at `/learn/tools/coin-study-guide`

## Optional next (only if you want them)

1. **Sell form** — optional weight / diameter / thickness / magnet fields for coins → store `coin_measurements` JSON on `listings`
2. **Stricter block** — auto-**block** publish (not just review) when key-date price &lt; $100
3. **Seller trust score** — only if you still want a 0–100 number alongside bans (usually redundant)

## Reference script location

Keep your master copy in:

`C:\Users\ninja\OneDrive\Documents\Coin Grading Study Guide\` or paste into `docs/` if you want it in git without exposing it on the website.
