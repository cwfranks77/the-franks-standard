# Payments and Payouts

Financial flows for checkout, tax, fees, reserves, and seller settlements.

---

## Checkout (Buyer)

1. Cart validated server-side (price, inventory, listing active)
2. **Shipping address ZIP** captured for tax
3. Sales tax computed per Louisiana marketplace facilitator rules (shipping destination)
4. Stripe PaymentIntent or Checkout Session created
5. On success webhook: order persisted, COA linked, notifications sent

**Rule:** Never calculate sales tax from billing address only.

---

## Payment Rail

- All consumer payments through **Stripe**
- No alternative "manual mark paid" for standard buyer checkout
- Webhooks idempotent with order idempotency keys

---

## Fee Structure

| Component | Typical handling |
|-----------|----------------|
| Platform fee | Default 10%; deducted at settlement |
| Featured/starter plans | Alternate rate from seller plan record |
| B&C qualified | Reduced platform fee flag on store |
| Stripe processing | Per Stripe Connect agreement |

Display fee rate to seller in dashboard from authoritative DB field.

---

## Tax

- **Buyer sales tax:** computed at checkout from **shipping ZIP**
- Facilitator remittance workflow per operator configuration
- Sellers do not manually add LA tax on top outside engine output

---

## Settlement Split

On successful payment:

```
Gross
  − Sales tax (escrow/remit bucket)
  − Platform fee
  − Stripe fees (per Connect)
  = Seller net (Connect transfer schedule)
```

**Owner business income tax reserve (25%):** backend financial module allocates operator reserve per business rules—instant wholesale transfers to distributor fulfillment nodes may run in parallel where configured.

---

## Payouts (Seller)

- **Stripe Connect** onboarding required
- Payout schedule subject to Stripe risk tiers
- Holds: open disputes, fraud review, owner financial freeze

Logs: `GET owner/logs/payouts`

---

## Refunds

- Initiated from dispute resolution or authorized seller flow
- Processed through Stripe to original payment method when possible
- Platform fee reversal per policy table
- Partial refunds supported with audit line items

---

## Chargebacks

Stripe chargeback webhooks update order/dispute state; owner financial status reflects exposure.

---

## Reporting

- Seller dashboard: gross, fees, net, payout history
- Owner: `GET owner/status/financial`
- Audit export includes financial events

---

## Prohibited

- Off-platform payment recording as paid order
- Seller-stored card data
- Buyer wire to seller with platform order left unpaid

---

## Related

- [architecture.md](architecture.md)
- [disputes.md](disputes.md)
- `docs/api/listings.md` (checkout adjacency)
