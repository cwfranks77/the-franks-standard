# Trust, money-back guarantees, and chargebacks

**Not legal advice.** Have a payments attorney review before launch of a formal "Buyer Protection Guarantee" fund. This doc is the operating model Charles asked for: **buyer refunds without personal liability**, and **seller fairness**.

---

## The honest limit

You **cannot** stop ship-time bait-and-switch with software alone. You **can**:

1. Certify what is **on the listing** (COA floor office, fingerprint).  
2. Hold money in **escrow** until delivery confirmation.  
3. Run **disputes** with evidence (buyer + seller).  
4. Fund refunds from a **program reserve**, not your personal wallet.  
5. Pass **chargeback** liability to sellers per Stripe Connect rules + reserves.

---

## Money-back guarantee without it falling on you personally

### Principle

- The platform is a **company** (LLC), not Charles individually.  
- Refunds come from: **(A)** escrowed sale funds, **(B)** seller Stripe balance / reserve, **(C)** **Buyer & Seller Protection Reserve** funded by platform fees.  
- Marketing says "Franks Standard Protection" — not "Charles will pay you from his pocket."

### Recommended structure (phased)

| Phase | What |
|-------|------|
| **Now** | Escrow via Stripe — buyer confirms delivery; disputes before release. Refund = reverse transfer from held funds when seller at fault. |
| **Next** | **Protection Reserve** — e.g. 0.25–0.5% of GMV from platform fee swept monthly into a **separate bank account** or Stripe platform balance sub-ledger. Cap claims per order (e.g. max $500 auto, above = manual). |
| **Later** | Optional third-party **marketplace insurance** (expensive; only at scale). |

### Reserve funding (does not have to be "trust account" day one)

- **Not required** to be a legal "trust account" immediately — can start as **restricted operating account** "Franks Standard Protection Reserve LLC" (separate entity optional).  
- Document in Terms: reserve is **discretionary program**, not unlimited insurance.  
- Publish **reserve transparency** quarterly (roadmap item) — builds trust.

### When buyer is dishonest (seller protection)

- Seller uploads **tracking + delivery scan**.  
- Escrow not released until buyer confirms OR timeout policy (e.g. 7 days after delivery scan → auto-release with notice).  
- False "not as described" → seller evidence → deny refund; **buyer abuse** → buyer account flag/ban (policy + future tooling).  
- Chargeback on card: seller bears Stripe chargeback if funds already paid out — **rolling reserve** on seller payouts reduces exposure.

---

## Chargebacks when sellers don't honor refunds

### How Stripe Connect usually works

- Buyer pays via Stripe Checkout.  
- Funds flow per your Connect model (destination charge or separate charges).  
- **Chargeback** = card issuer pulls money back; Stripe debits the **connected account** (seller) first; platform may be debited if seller balance insufficient (depends on Connect settings and MoR).

### Platform playbook

1. **Prevention** — escrow delay, clear descriptor, email receipts, COA serial on order record.  
2. **Seller agreement** — seller accepts chargeback liability; platform may offset from future payouts.  
3. **Rolling reserve** — hold 10–25% of seller payout for 14–30 days (Stripe Connect custom / manual).  
4. **No payout** until seller connects valid Stripe account with verified identity.  
5. **Proven counterfeit** — ban seller, freeze pending payouts, refund buyer from escrow/reserve.  
6. **Seller won't voluntarily refund** — platform issues refund from reserve **then** debits seller balance / collections / ban.

### If seller is gone / balance empty

- Use **Protection Reserve** for buyer refund (marketing promise).  
- Write off loss; pursue seller if identifiable; report to Stripe Radar / fraud networks.  
- **Do not** promise unlimited guarantee until reserve math is modeled.

---

## Balanced messaging (avoid "all sellers are thieves")

**Say:** "Proof-first floor for authentic shops."  
**Don't say:** "Sellers are scammers until they prove otherwise."

**Buyers hear:** verify COA, escrow, report fakes.  
**Sellers hear:** your COA is your badge; escrow protects you from bad buyers; fair disputes both ways.

Public pages: `/protection` (summary), **`/marketplace-policy`** (binding enforcement — platform operating standards / bylaws equivalent)

---

## Action checklist

- [ ] LLC + business Stripe (not personal) for all platform fees  
- [ ] Seller Agreement clause: chargebacks, reserves, counterfeit, ship-match listing  
- [ ] Terms + `/marketplace-policy`: Protection Program limits, discretionary reserve, freeze & debt  
- [ ] Order record stores `listing_id`, `coa_serial`, `image_fingerprint` at checkout (future migration)  
- [ ] Open separate reserve bank account when GMV justifies  
- [ ] CPA + payments lawyer review before "money-back guarantee" ad claim
