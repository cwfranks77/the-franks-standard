# Seller-backed authenticity, COA template, and liability (internal)

**Not legal advice.** Have a licensed attorney review before marketing nationally.

## Core rule

| Who backs the item? | **The seller** |
| Who guarantees genuineness? | **Nobody at the Platform** — templates + enforcement only |
| What is a Franks COA? | **Platform template + serial registry** tied to listing photos at issue time |
| What is the seal? | Seller proof on file + screening passed — **not** Platform certification |

## Copy to use everywhere

- "The **seller** backs this item"
- "Franks Standard **COA template**" (not "Franks certified genuine")
- "**Seller Authenticity Guarantee**" (Franks Standard template)
- Fine print: `COA_FINE_PRINT_FULL` / `COA_FINE_PRINT_SHORT` in `utils/authenticitySeal.js`
- Component: `components/CoaSellerDisclosure.vue`

## What the Platform still does (without vouching)

- Escrow, dispute policy, forced refunds, bans, COA/listing pairing checks
- **Listing integrity screening** — not authentication

## Does analysis increase liability?

Yes if marketed as Platform authentication. No if framed as seller representation + screening + policy enforcement.

## Assets

- Seal SVG: `public/franks-authenticity-seal.svg` — "SELLER BACKS THIS ITEM"
- `components/FranksAuthenticitySeal.vue`
- `utils/authenticitySeal.js`
- `/protection#authenticity-seal`, Terms §4, Marketplace Policy §4.1a
