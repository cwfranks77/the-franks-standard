# Marketplace Connect escrow (separate charges & transfers)

## Flow

1. **Checkout** — Buyer pays; full charge lands on the **platform** Stripe account (no destination charge).
2. **Payment succeeded** (`checkout.session.completed` → `markOrderPaid`) — Platform transfers **vendor escrow** (dropship: wholesale + shipping; direct: seller payout) to the seller’s **Connect** balance.
3. **Manual payouts** — Seller Connect accounts use `payouts.schedule.interval = manual` so funds stay in the Connect ledger until release.
4. **Release to bank** — When the carrier marks the package **delivered** (Shippo/EasyPost `delivered` status):
   - Vendor escrow → Connect **payout** to bank
   - Dropship **margin** → platform **transfer** to seller Connect (same moment)
5. **Fallback** — Supplier “delivered” webhook or rare buyer confirm if tracking API never fired.

## Requirements

- Run migrations `024_marketplace_connect_escrow.sql` and `025_shipping_tracker_escrow.sql` in Supabase SQL.
- Deploy edge functions: `create-checkout-session`, `stripe-webhook`, `confirm-order-receipt`, `stripe-connect-onboard`, `stripe-connect-sync`, `inventory-source-webhook`, **`shipping-tracker-webhook`**.
- Set `TRACKING_WEBHOOK_SECRET` (and/or `SHIPPO_WEBHOOK_SECRET`, `EASYPOST_WEBHOOK_SECRET`). Optional: `STRIPE_INSTANT_VENDOR_PAYOUT=true`.
- Sellers must complete **Stripe Connect** before dropship checkout (`stripe_connect_required`).
- Listings: set `dropship_wholesale_cost` and optional `dropship_shipping_cost`.

## Deploy (does not change Stripe Dashboard by itself)

