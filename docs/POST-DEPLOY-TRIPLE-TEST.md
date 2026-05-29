# Post-deploy triple test (policy + payments + enforcement)

Run **three full passes** after every production push. Do not skip passes because one pass was clean.

**Last policy alignment:** May 20, 2026 — `/marketplace-policy` is the canonical enforcement document.

---

## Pass 1 — Static site & legal pages (incognito)

| # | URL | Verify |
|---|-----|--------|
| 1 | `/` | Loads; no JS errors |
| 2 | `/terms` | Links to Marketplace Policies; §5 refunds/freeze |
| 3 | `/marketplace-policy` | Full policy: freeze list, refund table, hierarchy |
| 4 | `/seller-agreement` | §5 freeze; incorporates marketplace-policy |
| 5 | `/protection` | Links to marketplace-policy; no “unlimited guarantee” |
| 6 | `/how-it-works` | FAQ links policies; fake wording matches policy |
| 7 | `/privacy` | Loads |
| 8 | `/prohibited-items` | Loads |
| 9 | Footer (any page) | Marketplace Policies + Protection links present |
| 10 | `/sell` (new seller account) | Policy gate blocks form until legal name + sign |
| 11 | `/sell/import` | Same gate before CSV import |

Record pass 1: PASS / FAIL — notes: ___________

---

## Pass 2 — Ops panel smoke (owner, signed in)

Open `/ops/panel` → run built-in smoke tests (all green or documented SKIP).

| # | Check | Verify |
|---|-------|--------|
| 1 | Charity module | PASS |
| 2 | Supabase listings | PASS |
| 3 | Homepage + Sell HTML | PASS |
| 4 | `/ops/refunds` | Frozen sellers section loads |
| 5 | `/ops/authenticity` | Queue loads |
| 6 | `/marketplace-policy` | HTTP 200 from production URL |
| 7 | `/ops/site-qa` | **Run all route checks** — 0 failures (warn OK on sample dynamic URLs) |

Manual policy alignment (read-only):

- [ ] Forced refund reasons in ops match policy §6 (`counterfeit`, `not_as_described`, `dispute_upheld`, `seller_failed_refund`)
- [ ] `ops_other` does not auto-freeze (per policy)
- [ ] Freeze blocks match policy §8 (buy/sell/list/edit/ship/COA/escrow)

Record pass 2: PASS / FAIL — notes: ___________

---

## Pass 3 — Payment & enforcement paths (staging or low-$ live)

Use test listing + test buyer account when possible.

| # | Flow | Expected |
|---|------|----------|
| 1 | Buy now checkout | Session opens; seller/buyer not frozen |
| 2 | Cancel checkout | Order stays pending/cancelled |
| 3 | Paid order (test $) | `escrow_status=held` |
| 4 | Force refund (ops) seller-at-fault | Buyer refunded; seller frozen; listings archived |
| 5 | Frozen seller — sell page | Freeze banner; publish blocked |
| 6 | Frozen seller — checkout as buyer | `account_frozen` error |
| 7 | Frozen seller — confirm escrow | `escrow_frozen` blocked |
| 8 | Record debt payment (ops) | Unfreeze OR ban per button |
| 9 | `/verify/coa/[serial]` | Loads for issued COA |

Record pass 3: PASS / FAIL — notes: ___________

---

## Sign-off

| Pass | Date | Tester | Result |
|------|------|--------|--------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

**Triple test complete only when all three passes are PASS** (or FAIL items documented and fixed).

---

## After you deploy tonight

1. `npm run generate` (or CI deploy)
2. Push `master` → wait GitHub Pages + Supabase functions workflow
3. Run SQL migrations `023`, `024` if not applied
4. Deploy `ops-force-refund` and related functions
5. Run migration `025_seller_policy_acceptance.sql` if not applied
6. Deploy `accept-seller-policies` edge function
7. Execute this checklist three times — separate browser sessions for pass 1 vs 2

Charles: rest first. Policy text is on-site; attorney review still recommended before ad claims.
