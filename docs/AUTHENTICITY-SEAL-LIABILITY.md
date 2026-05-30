# Authenticity seal, screening, and liability (internal)

**Not legal advice.** Have a licensed attorney review before marketing the seal nationally.

## Product positioning (recommended)

| Claim | Use? |
|-------|------|
| "Listing met Franks Standard proof requirements" | Yes — seal |
| "We stand behind our **process** (escrow, screening, enforcement)" | Yes |
| "Franks Standard **certified** genuine" | Avoid — sounds like expert authentication |
| "AI **authenticated** this item" | Avoid — increases reliance / liability |
| "Listing **integrity screening**" | Yes — for automated checks |

## Does analysis increase liability?

**Often yes**, if buyers reasonably believe the platform *independently verified* genuineness.

**Lower risk framing:**

1. Seller supplies COA or signs in-platform guarantee (seller representation).
2. Platform runs **integrity screening** (replica language, missing proof, photo/COA pairing for Franks issued COAs).
3. Seal = both steps passed **at listing time**.
4. If later proven fake: **Marketplace Policy** remedies (refund, ban, debt) — not "we promised it was real forever."

Do **not** market screening as PSA/PCGS-level authentication unless you hire experts and carry insurance.

## Assets

- Seal SVG: `public/franks-authenticity-seal.svg`
- Component: `components/FranksAuthenticitySeal.vue`
- Copy source: `utils/authenticitySeal.js`
- Public explanation: `/protection#authenticity-seal`
- Terms: section 4

## Optional future (higher cost / liability)

- Human ops review queue for high-value items (document as "administrative review of seller documents," not authentication).
- Third-party API (Entrupy, etc.) — separate labeled program with separate ToS.
- Insurance / bonded seller program — commercial decision.

## What we already have in code

- `authenticityScan` / `integrity_status` — heuristic flags, not certification.
- `issue-coa-certificate` — ties serial to listing photos (pairing).
- Forced refunds / bans — enforcement path when counterfeit confirmed.

Keep all user-facing text aligned with **screening + seller proof**, not **platform certification**.
