# Authenticity integrity & counterfeit enforcement

## What existed before

- **COA Enforcement Monitor** (`useCoaMonitor`) — only checks that published listings have COA upload or signed guarantee, not whether the item is fake.
- **Policy copy** — zero tolerance in terms, how-it-works, AI support (email for fraud).
- **No** automated counterfeit heuristics, **no** in-app report button, **no** owner action queue.

## What is wired now

### 1. Automated risk scan (`utils/authenticityScan.js`)

Runs on **publish** (blocks severe flags) and in **Ops panel** / **Ops → Authenticity**.

Signals include:

- Replica / fake / “inspired by” language  
- Graded coin/slab claims without COA file  
- Coin plated/copy language  
- Sneaker UA/replica language  
- Watch clone language  
- Unsigned guarantee  

Updates `listings.integrity_status`, `integrity_flags`, `integrity_score`.

### 2. Buyer reports

- **Listing page** → “Report authenticity concern”  
- Edge: `submit-authenticity-report`  
- Table: `authenticity_reports`  
- Sets listing to `review`; emails owner if SendGrid configured  

### 3. Owner enforcement (`/ops/authenticity`)

Edge: `ops-integrity-action` (requires ops key)

After confirming counterfeit or when the seller will not refund: use **`/ops/refunds`** and `ops-force-refund` — see `docs/FORCED-REFUNDS.md` and public **`/marketplace-policy`** (§3–§9).

| Action | Effect |
|--------|--------|
| `scan_all` | Re-scan every published listing |
| `list_queue` | Flagged listings + open reports |
| `suspend_listing` | Archive + `suspended` |
| `hold_seller_for_review` | **14-day integrity hold** — pause buy/sell/list; archive listings; seller emails evidence |
| `lift_integrity_hold` | Clear hold after review (seller may resume) |
| `ban_seller_after_hold` | Permanent ban after hold window / failed appeal |
| `confirm_counterfeit` | Archive + `counterfeit_confirmed`; default **hold** (not ban); pass `ban_immediately: true` for proven fraud |
| `clear_listing` | Clear flags / `clear` |
| `dismiss_report` | Close report as dismissed |
| `ban_seller` | Ban + archive seller’s live listings |

Checkout blocks listings in `review`, `suspended`, or `counterfeit_confirmed`, sellers with `seller_banned_at`, debt freeze, or active **integrity hold** (`026_integrity_hold.sql`).

### 5. Integrity hold (benefit of the doubt)

For COA mismatch, not-as-described, wrong item, or first-time disputes: ops uses **Hold seller (14d)** instead of instant ban. Seller activity is paused; they contact `info@thefranksstandard.com` with proof. **Confirm + ban now** remains for obvious/repeat fraud.

### 4. Franks issued COA (year-scoped serial + floor office)

**Metaphor:** Each listing is a numbered office on the floor. The COA serial **is** that office number (`FS-2026-0001842`). Only the item shown in that listing’s photos/description at issue time is certified — not a different coin in another slot.

- Format: `FS-YYYY-NNNNNN` (e.g. `FS-2026-0001842`)  
- `listings.floor_slot_code` = same as `coa_serial_number` when issued  
- `coa_certificates.image_fingerprint` = frozen photos + title + description at issue  
- If seller swaps photos after issue → verify shows **not paired**, checkout blocked on listing page  
- **Sell** → “Franks Standard issued COA” (requires photos + description ≥ 20 chars)  
- Edge: `issue-coa-certificate`  
- Public verify: `/verify/coa/[serial]` via `verify-coa-serial`  
- Migrations: `021_authenticity_integrity_coa.sql`, `022_coa_floor_slot_binding.sql`  
- UI: `CoaFloorBond` on listing, `utils/coaListingBond.js`  

**Hard copy (print):** Paper COA will show office #, photo thumbnail, serial, and Franks seal — generated only from the certificate row (design TBD).  

## Deploy checklist

1. Run `021_authenticity_integrity_coa.sql` in Supabase SQL editor  
2. Deploy edge functions:  
   - `submit-authenticity-report`  
   - `ops-integrity-action`  
   - `issue-coa-certificate`  
   - `verify-coa-serial`  
3. Set Supabase secret `OPS_ACCESS_KEY` (or hash) for ops actions  
4. Redeploy `create-checkout-session` (integrity + ban checks)  
5. Redeploy site (GitHub Pages)  

## Public education

- **Coin study guide (printable):** `/learn/tools/coin-study-guide` — struck vs cast, Morgan diagnostics, 10-point checklist.
- **Intro article:** `/learn/coin-counterfeit-detection-guide`
- **Source files (public):** `docs/COIN-STUDY-GUIDE-AUTHENTICATION.txt`, `utils/coinStudyGuide.js`
- **Internal only (not on site):** `docs/GRADING-AND-AUTHENTICATION-MANUAL.txt` — seller grading workflow, not published

## Limits (honest)

Heuristics catch **obvious** misrepresentation language, not expert numismatic/slab authentication. High-value items still benefit from video inspect and manual ops review. Reports + scan + ban workflow is the enforcement layer; PSA/NGC cert verification against registries is a future enhancement.
