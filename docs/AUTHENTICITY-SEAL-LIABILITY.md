# Seller-backed COA, Seller Written Guarantee, and liability (internal)

**Not legal advice.** Have a licensed attorney review before marketing nationally. See `docs/ATTORNEY-REVIEW-PACKAGE.md`.

## Core rule

| Who backs the item? | **The seller** |
| Who guarantees genuineness to buyers? | **The seller** — via Seller Written Guarantee on Franks COA or third-party COA |
| What does the Platform guarantee? | **Nothing about authenticity** — template, serial registry, verification, enforcement only |
| What is a Franks COA? | Certificate template + **one serial** + registry record + **Seller Written Guarantee digitally attached** to one listing snapshot |

## Safe use of the word "guarantee"

| OK | Avoid |
|----|--------|
| "Seller Written Guarantee on the Franks COA" | "Franks guaranteed authentic" |
| "Your guarantee — our template and serial" | "We guarantee this item is real" |
| "Digitally attached to serial FS-YYYY-NNNNNN" | "Guaranteed by The Franks Standard" |

## Copy source of truth

- `utils/franksCoaModel.js` — how COA + Seller Written Guarantee works
- `utils/authenticitySeal.js` — seal + disclosures (re-exports fine print)
- `components/FranksCoaExplainer.vue` — sell / verify / COA picker UI
- `components/CoaSellerDisclosure.vue` — short/full fine print

## Retired for new listings

Standalone "sign guarantee without Franks serial" — no item binding. Legacy DB rows may still display.

## Attorney handoff

Policies dated **May 29, 2026** (`SELLER_POLICY_VERSION` **2026-05-29**). User will print for counsel; replace with stamped finals when received.
