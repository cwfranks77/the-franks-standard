# Disputes

Platform dispute resolution architecture and policy implementation.

---

## Purpose

Provide a structured path when buyer and seller disagree on delivery, condition, or authenticity—without off-platform negotiation or unlogged refunds.

---

## Actors

- **Buyer** — opens dispute with reason and evidence
- **Seller** — responds within configured window
- **Platform** — escalation review (owner/manual)
- **Stripe** — refund execution when approved

---

## State Machine

| State | Description |
|-------|-------------|
| `opened` | Buyer filed; clock starts for seller |
| `seller_response` | Seller submitted evidence/offer |
| `escalated` | Platform review required |
| `resolved` | Outcome recorded; refunds if any |
| `closed` | Terminal; may follow appeal policy if enabled |

Exact enum names may vary in schema—treat as conceptual.

---

## Reasons (Common)

- `not_received` — INR, lost package
- `not_as_described` — condition, wrong SKU, missing parts
- `authenticity` — counterfeit or material misrepresentation
- `other` — policy-triage to specific bucket

---

## Evidence Model

Attachments stored with dispute record:

- Images (item, packaging, labels)
- Message thread excerpts (on-platform)
- Tracking events
- COA serial references

---

## Timing

- Seller response SLA enforced in application layer
- Auto-escalation if seller silent
- Buyer prompted to ship returns with tracking when return-to-refund applies

---

## Outcomes

| Outcome | Effect |
|---------|--------|
| `buyer_refund_full` | Stripe refund to buyer; seller debit |
| `buyer_refund_partial` | Partial amount per ruling |
| `seller_wins` | No refund; case closed |
| `return_required` | Buyer ships; refund on receipt confirm |

AI support **cannot** override owner rulings on escalated cases.

---

## Payout Interaction

Open disputes may **hold** seller payout for affected order line until resolution.

---

## Owner Review

- `GET owner/status/disputes`
- `GET owner/logs/disputes`
- `backend/owner/manual_dispute_review.js`

Used for edge cases, repeat offenders, and high-value authenticity fights.

---

## Relation to Fraud

Authenticity disputes may spawn linked **fraud cases** if evidence suggests intentional counterfeit sales—not only a one-off mistake.

---

## API Surface

See `docs/api/disputes.md` for REST shapes.

---

## User-Facing Guides

- `content/buyer_onboarding/how_disputes_work_for_buyers.md`
- `content/seller_onboarding/how_disputes_work.md`
