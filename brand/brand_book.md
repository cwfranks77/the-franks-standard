# The Franks Standard — Brand Book

Internal and partner-facing reference for voice, promise, and positioning. UI implementation lives in product; this document governs language and decisions.

---

## Mission

To operate a trustworthy, owner-run multi-vendor marketplace where buyers and sellers trade **authentic gear** with transparent rules, built-in fraud protection, and compliant payments—including Louisiana marketplace tax handled correctly on every checkout.

---

## Vision

A marketplace where "authentic" is verifiable, not aspirational: COA chain-of-custody, clear seller accountability, and human escalation when automation isn't enough—serving collectors, builders, and specialty buyers without the chaos of unmoderated classifieds.

---

## Values

| Value | In practice |
|-------|-------------|
| **Authenticity** | Listings, COA, and seller behavior must hold up to scrutiny. |
| **Protection** | Buyers pay on-platform; sellers get structured payouts and dispute process. |
| **Clarity** | Fees, tax, and policies stated plainly—no hidden lanes. |
| **Accountability** | Violations have consequences; disputes have paths. |
| **Ownership** | Platform decisions ultimately rest with the owner, not outsourced policy bots. |
| **Isolation of brands** | The Franks Standard and B&C Performance Audio share infrastructure but never blur identities in product experience. |

---

## Brand Promise

**Every transaction on The Franks Standard is backed by platform checkout, fraud monitoring, and dispute resolution—with sales tax calculated from the customer's shipping destination ZIP code in line with Louisiana marketplace facilitator obligations.**

We will not ask buyers to trust sellers blindly. We will not ask honest sellers to compete with scammers on uneven ground.

---

## Voice & Tone

**Voice (consistent):** Direct, plain-spoken, confident without swagger. We explain rules like a knowledgeable shop owner, not a legal department or hype influencer.

**Tone (situational):**

| Context | Tone |
|---------|------|
| Welcome / onboarding | Warm, instructive, patient |
| Safety / fraud | Firm, calm, non-alarmist |
| Disputes | Neutral, evidence-focused |
| Policy violations | Clear consequences, no pile-on |
| Marketing (incl. B&C) | Energetic but factual—no guaranteed outcomes |

**Avoid:** Jargon stacks, fear-mongering, promising specific refund amounts in AI or ads, blending Franks and B&C visual or file-level identity.

---

## Messaging Examples

**Homepage / marketplace**
> Authentic gear from verified sellers. Search, compare, checkout on-platform—COA and fraud protection built in.

**Checkout / tax**
> Sales tax is based on where your order ships, calculated automatically at checkout.

**Fraud**
> Pay only through The Franks Standard. Report off-platform payment requests immediately.

**COA**
> Chain-of-custody certificates are hashed, logged, and linked to your order.

**B&C (marketing only)**
> B&C Performance Audio is our competition-audio lane—lower fees for qualified sellers, same TFS protection.

**Seller fees**
> Default platform fee is 10%; featured plans and B&C qualification may differ—see your seller dashboard.

---

## Why TFS Exists

Generic marketplaces optimize for volume. Forum and social sales optimize for speed. Neither reliably protects buyers of high-trust gear or gives honest sellers a fair playing field.

The Franks Standard exists because:

1. **Authentic gear deserves evidence** — photos, serials, COA uploads, and review history—not vague titles.
2. **Money needs a single rail** — Stripe checkout, documented fees, payout logs, and refund paths.
3. **Tax compliance is not optional** — Louisiana marketplace facilitator rules require tax on shipping destination; we build that into checkout rather than pushing liability to sellers and buyers.
4. **Fraud must escalate to humans** — automated signals help; owner review resolves edge cases and repeat offenders.
5. **One operator, clear responsibility** — buyers and sellers know who stands behind the platform.

B&C Performance Audio extends this mission into competition audio—a specialized catalog and fee posture—without creating a second, weaker rulebook.

---

## Brand Architecture (Summary)

```
The Franks Standard (marketplace shell, multi-vendor, Amazon/eBay-density UX)
├── Core categories: collectibles, audio, specialty authentic gear
├── Shared: checkout, tax, COA, fraud, disputes, owner tools
└── B&C Performance Audio (brand lane: competition audio, dark theme marketing, reduced fees for qualified sellers)
```

---

## Document Control

Update this book when fee structures, tax posture, or brand lane policies change. Marketing may quote B&C; product code must keep namespaces separate per architecture locks.
