# Attorney review package — The Franks Standard

**Prepared for outside counsel review (not legal advice).**  
**Draft date:** May 29, 2026

## Documents to print and review

Print these URLs from production or from a local build after `npm run build`:

| Document | Path |
|----------|------|
| Terms of Service | `/terms` |
| Marketplace Policies & Enforcement | `/marketplace-policy` |
| Seller Agreement | `/seller-agreement` |
| Prohibited Items | `/prohibited-items` |
| Privacy Policy | `/privacy` |
| Protection overview (plain language — not binding alone) | `/protection` |

**Seller digital acceptance bundle** (must be signed before selling):

- Version: see `utils/sellerPolicyBundle.js` → `SELLER_POLICY_VERSION`
- UI: Sell / Import / Dropship — `components/SellerPolicyAgreement.vue`

## COA / “guarantee” framing counsel should check

We use the phrase **Seller Written Guarantee** only to mean:

1. The **seller’s** authenticity attestation text on the **Franks Standard COA** template.
2. That attestation is **digitally attached** in our registry to **one serial** (`FS-YYYY-NNNNNN`), **one listing**, and the **photos + description at issue time**.
3. **The Franks Standard LLC** provides template, registry, verification, and policy enforcement — **not** a Platform guarantee or warranty that any item is genuine.

**Retired for new listings:** standalone “sign guarantee instead of COA” flow (no serial, no item binding).

**Still allowed for new listings:**

- Upload third-party COA (PSA, PCGS, etc.), or
- Franks Standard COA with Seller Written Guarantee on the certificate.

Source-of-truth product copy: `utils/franksCoaModel.js`, `utils/authenticitySeal.js`.

## After attorney review

1. Attorney prints edited copies with seal/approval.
2. Send PDFs or marked Word docs to the development team.
3. We replace in-repo policy text and bump `POLICY_LAST_UPDATED` + `SELLER_POLICY_VERSION` in:
   - `utils/marketplacePolicyMeta.js`
   - `utils/sellerPolicyBundle.js`
4. Sellers with older acceptance versions will be prompted to re-sign on next list/import.

## Internal reference

- `docs/AUTHENTICITY-SEAL-LIABILITY.md` — marketing vs liability guardrails
- `docs/POLICY-ALIGNMENT-CHECKLIST.md` — sync checklist (if present)
