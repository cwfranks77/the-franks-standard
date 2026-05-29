# Forced buyer refunds (ops)

**Public policy:** [Marketplace Policies §6–8](/marketplace-policy) (incorporated into Terms and Seller Agreement).

When a seller refuses or fails to refund a buyer (counterfeit, not as described, upheld dispute), platform ops can issue a **full Stripe refund** from the backend without seller action.

## Prerequisites

1. Run migration `023_order_force_refunds.sql` in Supabase.
2. Deploy edge function `ops-force-refund`.
3. Set `OPS_ACCESS_KEY` in Supabase secrets (same key as authenticity toolkit).
4. Optional: enable Stripe webhook event `charge.refunded` so Dashboard refunds sync order status.

## Ops UI

- **URL:** `/ops/refunds` (requires ops-auth middleware / toolkit unlock)
- Look up order by UUID, dry run, then **Force full refund**
- Lists recent orders in refundable statuses

## API (`ops-force-refund`)

POST with JSON body:

| Field | Description |
|-------|-------------|
| `ops_key` | Ops access key |
| `action` | `force_refund` \| `list_refundable` \| `get_order` |
| `order_id` | Order UUID |
| `reason` | `counterfeit`, `not_as_described`, `dispute_upheld`, `seller_failed_refund`, `ops_other` |
| `ops_note` | Optional audit note |
| `authenticity_report_id` | Optional; marks report `resolved_refunded` |
| `dry_run` | `true` to validate without charging Stripe |

## Stripe behavior

- **Platform escrow** (`connect_checkout: false`): Refund is created on the charge; funds return to the buyer’s payment method. Seller payout transfers not yet sent remain on the platform balance.
- **Connect destination charge** (`connect_checkout: true`): Refund uses `reverse_transfer` and `refund_application_fee` so the connected account and platform fee are reversed when possible.
- **After seller payout** (`confirmed` + transfer): Stripe attempts transfer reversal; if the seller has already withdrawn funds, the platform may need to cover the shortfall from the protection reserve (operational policy).

## Order states

Refundable: `paid`, `shipped`, `delivered`, `disputed`, `confirmed`, `submitted_to_supplier`.

Not refundable: `pending`, `cancelled`, `refunded`.

## Audit

- `orders.stripe_refund_id`, `refunded_at`, `refund_reason`, `refund_amount`, `refund_initiated_by`
- `order_refund_events` — one row per ops refund

## Seller account freeze (seller at fault)

When `force_refund` uses a **seller-at-fault** reason (`counterfeit`, `not_as_described`, `dispute_upheld`, `seller_failed_refund`), the system automatically:

1. Sets `profiles.account_frozen_at` and `seller_debt_balance` (amount refunded).
2. Archives all published listings (`suspended`).
3. Flags seller’s held orders with `escrow_frozen_at` (buyer cannot release escrow to seller).
4. Blocks via API: checkout (buy/sell), bids, ship, COA issue, listing insert/update/delete (RLS).

`ops_other` refunds do **not** auto-freeze (ops discretion).

### Ops: debt recovery (`/ops/refunds`)

| Action | Purpose |
|--------|---------|
| `list_frozen_sellers` | Sellers with pending debt |
| `record_debt_payment` | Mark paid; unfreeze OR ban after payment |
| `ban_frozen_seller` | Permanent ban while debt still pending |

Migration: `024_seller_debt_account_freeze.sql`

## Related

- Authenticity enforcement: `/ops/authenticity`, `ops-integrity-action`
- Buyer-facing copy: counterfeit → full refund path in listing report modal
- Seller Agreement §4a — freeze and repayment terms
