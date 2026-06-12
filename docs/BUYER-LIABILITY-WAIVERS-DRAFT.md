# Buyer agreements & checkout acknowledgments — draft for owner review

**Status:** DRAFT — NOT LIVE — NOT LEGAL ADVICE  
**Entity:** The Franks Standard LLC (Louisiana marketplace facilitator)  
**Policy version (proposed):** `2026-06-12`  
**Companion:** `docs/SELLER-LIABILITY-WAIVERS-DRAFT.md` (Forms A & B)  
**Prepared for:** Attorney review before implementation

---

## Recommended signing model (decision for counsel)

Based on marketplace facilitator practice, your existing seller policy flow, and enforceability of electronic assent:

| Party | What to sign | How often | Why |
|-------|----------------|-----------|-----|
| **Seller** | Form A (collectible/COA) or Form B (general merchandise) **+** existing seller policy bundle | **Per listing at publish** (liability release) + **account once** until policy version changes (Terms bundle) | Each listing makes different representations (item, COA, **serialized COA**). One blanket signature for all future listings is weaker for authenticity claims. |
| **Buyer** | Form C (Buyer Agreement) | **Once per account** (first checkout or registration) until policy version changes | Same pattern as your `seller_policy_acceptances` — one master agreement covers all purchases. |
| **Buyer** | Form D (Checkout Order Acknowledgment) | **Every checkout** (short checkbox, not full contract re-read) | Strong per-order audit trail: buyer saw facilitator disclaimer, escrow terms, and seller-backed COA language **for this purchase** without killing conversion. |

**Not recommended:** Full Form C re-signed on every purchase (too much friction; courts treat repeat buyers as bound by account Terms if version unchanged).  
**Not recommended:** Only account-level with no checkout step (weaker proof buyer assented at the moment of payment).

**Free implementation:** Built-in typed name + checkboxes + Supabase storage (no DocuSign fees).

---

## Form C — Buyer Marketplace Facilitator Agreement

**THE FRANKS STANDARD LLC — MARKETPLACE FACILITATOR**  
**BUYER MARKETPLACE FACILITATOR AGREEMENT**  
Version 2026-06-12

### 1. Parties

This Buyer Marketplace Facilitator Agreement (“**Agreement**”) is between **The Franks Standard LLC**, a Louisiana limited liability company (“**Platform**,” “**we**,” “**us**”), acting solely as a **marketplace facilitator**, and the undersigned buyer (“**Buyer**,” “**you**”).

### 2. Platform role — not the seller

**The Franks Standard LLC does not** sell, own, possess, ship, authenticate, grade, warrant, or guarantee third-party items listed on the marketplace facilitator website (thefranksstandard.com).

Each purchase is a transaction **between you and the independent seller**. The Platform provides listing discovery, checkout facilitation, escrow coordination where applicable, and policy enforcement — **not** a warranty that any item is genuine, as described, or lawful to own in your jurisdiction.

### 3. Certificates of authenticity and serialized COA

For collectible listings, sellers may provide an uploaded third-party COA or a **serialized COA** issued through **The Franks Standard LLC** (unique serial `FS-YYYY-NNNNNN` with Seller Written Guarantee digitally attached in the registry).

Buyer understands:

- A **serialized COA** is a **seller-backed** record-keeping tool on the Platform template — **not** a guarantee, certification, or warranty by **The Franks Standard LLC** that the item is authentic;
- Buyer may verify a serial at `/verify/coa/[serial]` before purchase;
- If an item is later disputed or proven inauthentic, **the seller** — not **The Franks Standard LLC** — is primarily responsible, subject to Marketplace Policies and law.

### 4. Buyer responsibility

Buyer agrees to:

- Read the listing, photos, description, and any COA proof before purchase;
- Pay only through Platform Stripe checkout (not off-platform payment the seller requests);
- Confirm receipt honestly when escrow release conditions apply;
- Pursue authenticity, condition, and “not as described” disputes **with the seller** first through Platform tools.

### 5. No Platform liability — buyer and seller

To the fullest extent permitted by Louisiana law and applicable federal law, Buyer **releases, waives, and discharges** **The Franks Standard LLC**, the Platform, and its members, managers, employees, and agents from claims arising from:

- Authenticity, genuineness, or provenance of any item purchased;
- Any uploaded COA or **serialized COA** displayed on a listing;
- Seller misrepresentation, fraud, or counterfeiting;
- Item condition or fitness for a particular purpose when the seller is at fault.

This Agreement **does not** waive non-waivable consumer rights Buyer may have **against the seller** or mandatory rights against a marketplace facilitator under applicable law.

Buyer agrees **not to name The Franks Standard LLC** as a party in litigation against a seller for item authenticity or description disputes except where law requires.

### 6. Escrow, refunds, and disputes

Escrow hold-and-release, refund standards, chargebacks, and forced refunds are governed by the **Marketplace Policies** and **Terms of Service** of **The Franks Standard LLC**. Platform enforcement (refunds, account action) is policy application — **not** an admission the Platform guaranteed authenticity at sale.

### 7. Electronic signature — covers all purchases

By typing your full legal name and confirming below, you agree this Agreement is signed electronically under the E-SIGN Act and Louisiana law. **This one Agreement applies to all purchases you make on thefranksstandard.com** until **The Franks Standard LLC** publishes a new policy version requiring re-acceptance.

**Required acknowledgment (checkbox):**  
“I have read and agree to the Buyer Marketplace Facilitator Agreement of **The Franks Standard LLC**. I understand the Platform is a marketplace facilitator only, that **sellers** — not The Franks Standard LLC — back items and COAs (including **serialized COA**), and that purchase disputes about authenticity or description are primarily between me and the seller.”

---

## Form D — Checkout Order Acknowledgment (per purchase)

**THE FRANKS STANDARD LLC — MARKETPLACE FACILITATOR**  
**CHECKOUT ORDER ACKNOWLEDGMENT**  
Version 2026-06-12

Shown immediately before “Pay” / redirect to Stripe. **Not** a replacement for Form C — a short reaffirmation stored with **this order**.

### Order summary block (dynamic)

- Listing title, seller display name, order subtotal  
- Whether listing includes uploaded COA and/or **serialized COA** serial (if any)

### Acknowledgment text (display)

By completing checkout for this order, you confirm:

1. **The Franks Standard LLC** is a marketplace facilitator only — **not** the seller of this item.  
2. Your contract for the item is with the **seller** named on this order.  
3. Any **serialized COA** or Seller Written Guarantee on this listing is **seller-backed**; **The Franks Standard LLC** does not warrant the item is authentic.  
4. You have reviewed the listing and agree to escrow, refund, and dispute rules in the **Marketplace Policies** of **The Franks Standard LLC**.  
5. You will not hold **The Franks Standard LLC** liable for seller fraud, misdescription, or inauthentic items beyond what mandatory law requires.

### Required control

Single checkbox (required to proceed):

☐ **I agree to the Checkout Order Acknowledgment for this purchase.**

Optional: second line if collectible with serialized COA:

☐ **I understand the serialized COA on this listing is issued by The Franks Standard LLC as a registry tool only and does not mean The Franks Standard LLC authenticated this item.**

---

## Technical alignment (proposed — not implemented)

### New tables

**`buyer_policy_acceptances`** (mirror `seller_policy_acceptances`)

| Column | Purpose |
|--------|---------|
| `buyer_id` | `profiles.id` |
| `policy_version` | e.g. `2026-06-12` |
| `signer_legal_name` | Typed signature |
| `documents_accepted` | jsonb: terms, marketplace_policy, buyer_agreement, privacy |
| `accepted_at` | Timestamp |

**`buyer_order_acknowledgments`**

| Column | Purpose |
|--------|---------|
| `order_id` | Links to `orders.id` |
| `buyer_id` | Who checked the box |
| `listing_id` | Snapshot context |
| `ack_version` | Form D version |
| `serialized_coa_serial` | nullable |
| `ack_text_sha256` | Hash of text shown |
| `signed_at` | Before Stripe redirect |

### User flow

1. **First “Buy now”** → modal: Form C + link to Terms / Marketplace Policies → store `buyer_policy_acceptances` → continue.  
2. **Every checkout** → inline Form D checkbox on listing page or pre-Stripe interstitial → store row → invoke `create-checkout-session`.  
3. **Policy version bump** → require Form C re-sign (same as sellers).

### Files to touch on approval (Franks only)

- `docs/BUYER-LIABILITY-WAIVERS-DRAFT.md` — finalize after counsel  
- `utils/buyerPolicyBundle.js` — version + document list  
- `utils/buyerCheckoutAcknowledgment.js` — Form D text + hash  
- `composables/useBuyerPolicyAcceptance.ts`  
- `components/BuyerPolicyAgreement.vue`  
- `components/CheckoutOrderAcknowledgment.vue`  
- `pages/listing/[id].vue` — gate before `startCheckout`  
- `supabase/migrations/0xx_buyer_policy_acceptances.sql`  
- `supabase/functions/create-checkout-session/index.ts` — reject if no ack for order draft  

**Will NOT touch:** `pages/bc-audio/**`, B&C checkout.

---

## Full picture — seller + buyer

```
SELLER PATH                          BUYER PATH
───────────                          ──────────
Account: seller policy bundle        Account: Form C (once / version)
       (existing)                           │
Per listing: Form A or Form B                │
       at publish                            │
                                             Per order: Form D at checkout
                                             │
                    ┌────────────────────────┘
                    ▼
              Order + optional serialized COA on listing
              Disputes: primarily seller ↔ buyer
              The Franks Standard LLC: facilitator + policy enforcement only
```

---

## Owner checklist before “implement”

- [ ] Attorney reviews Form C and Form D together with seller Forms A & B  
- [ ] Confirm **The Franks Standard LLC** and **serialized COA** wording site-wide  
- [ ] Approve first-checkout vs registration gate for Form C  
- [ ] Approve Form D placement (listing page vs modal vs Stripe metadata only)  
- [ ] Say **“implement”** in chat
