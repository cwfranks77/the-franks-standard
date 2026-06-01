# Policy ↔ product alignment checklist

Use when changing enforcement code or public legal pages. **Canonical public doc:** `/marketplace-policy`.

| Product behavior | Policy section | Code / UI |
|------------------|----------------|-----------|
| Integrity scan → review | §3.2 | `authenticityScan`, `integrity_status` |
| Suspend listing | §3.4 | `ops-integrity-action` `suspend_listing` |
| Confirm counterfeit + ban | §3.4, §9 | `confirm_counterfeit`, `seller_banned_at` |
| COA floor office + verify | §3.1a | `issue-coa-certificate`, `/verify/coa` |
| Escrow hold | §4 | `markOrderPaid`, checkout |
| Refund reason matrix | §5 | Ops dispute judgment |
| Forced refund seller at fault | §6 | `ops-force-refund` |
| Account freeze | §8 | `freezeSellerForPlatformDebt`, RLS, edge guards |
| Escrow frozen on orders | §8 | `escrow_frozen_at`, `confirm-order-receipt` |
| Debt payment / ban after pay | §8.1 | `record_debt_payment` |
| Chargebacks | §10 | Seller Agreement §6 |
| Off-platform deals | §11 | Seller Agreement §7 |
| Protection reserve (discretionary) | §7 | `/protection`, `TRUST-ESCROW-CHARGEBACKS.md` |
| Seller digital policy signature | §3 | `accept-seller-policies`, `/sell`, RLS `seller_policies_accepted` |

**Marketing must not promise** anything beyond §7 (no unlimited guarantee, no personal founder liability).

**Date sync:** `utils/marketplacePolicyMeta.js` → `POLICY_LAST_UPDATED` on Terms, Seller Agreement, Marketplace Policy.
