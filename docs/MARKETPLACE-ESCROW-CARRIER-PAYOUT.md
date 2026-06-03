# Marketplace Escrow & Carrier-Scan Payout Architecture

Stripe Connect **Separate Charges and Transfers** + **manual** Connect payouts + **Shippo/EasyPost** carrier-scan release.

---

## STEP 1: THE CHARGE AND AUTOMATED SPLIT

1. Buyer completes checkout → full amount charges on the **platform** Stripe account (`create-checkout-session`, no destination charges).
2. On `checkout.session.completed` (`markOrderPaid` → `processMarketplacePaidOrder`):
   - **Vendor escrow** = wholesale (`supplier_cost`) + shipping (`supplier_shipping_cost` / dropship shipping).
   - **Platform fee** = remainder (margin) held on platform until buyer confirms (existing margin transfer).
3. `stripe.transfers.create` moves **only** vendor escrow to the seller’s **Connected** account (`transferVendorEscrowOnPaid` in `_shared/marketplaceConnectEscrow.ts`).

---

## STEP 2: ENFORCE THE SECURE ESCROW HOLD

1. On Connect onboarding/sync (`stripe-connect-onboard`, `stripe-connect-sync`) and before transfer (`ensureManualConnectPayouts`):
   - `settings.payouts.schedule.interval = 'manual'`
2. Vendor sees balance in Connect dashboard but **cannot** withdraw to bank until release.

---

## STEP 3: INTEGRATE SHIPPING WEBHOOK DETECTION

**Endpoint:** `POST /functions/v1/shipping-tracker-webhook`  
**Function:** `supabase/functions/shipping-tracker-webhook/index.ts`  
**Logic:** `_shared/shippingTracker.ts`

1. Register webhook URL in **Shippo** and/or **EasyPost** for tracker updates.
2. Match orders by `orders.tracking_number` (set when supplier ships or you create a tracker).
3. **In transit** — updates order to `shipped` only (no payout).
4. **Delivered** — releases vendor escrow (bank payout) **and** dropship margin in one step (`releaseAllSellerFundsOnCarrierDelivery`).

Delivered statuses include: `delivered`, `delivery`, `delivered_to_customer`, `completed`, etc.

**Secrets (Supabase Edge secrets):**

| Secret | Purpose |
|--------|---------|
| `TRACKING_WEBHOOK_SECRET` | Shared header `x-webhook-secret` (either provider) |
| `SHIPPO_WEBHOOK_SECRET` | Optional Shippo-only |
| `EASYPOST_WEBHOOK_SECRET` | Optional EasyPost-only |

---

## STEP 4: EXECUTE THE AUTOMATED PAYOUT AT DELIVERY

On carrier **delivered** status (not in-transit):

1. `releaseAllSellerFundsOnCarrierDelivery` sets order `delivered`, releases escrow to bank.
2. Same handler transfers **dropship margin** to seller Connect.
3. Optional `STRIPE_INSTANT_VENDOR_PAYOUT=true` for instant bank payout on escrow slice.

**Fallbacks (idempotent):**

| Trigger | Reason |
|---------|--------|
| Supplier webhook `delivered` (no Shippo/EasyPost) | `supplier_delivered_fallback` |
| Buyer confirm (legacy / edge case) | `buyer_confirm` |

---

## Database (migrations)

| Migration | Adds |
|-----------|------|
| `024_marketplace_connect_escrow.sql` | `separate_charges`, `vendor_escrow_amount`, `stripe_vendor_transfer_id`, `stripe_vendor_payout_id`, … |
| `025_shipping_tracker_escrow.sql` | `tracking_provider`, `tracking_status`, `carrier_scan_at`, `vendor_payout_release_reason`, `order_tracking_events` |

---

## Deploy checklist

1. Run SQL: `024` + `025` on Supabase project `rochesyrxiyrxhzmkuwk`.
2. Deploy functions (CI includes `shipping-tracker-webhook --no-verify-jwt`).
3. Set secrets: tracking webhook secret(s), optional `STRIPE_INSTANT_VENDOR_PAYOUT`.
4. In Shippo/EasyPost: point webhooks to your function URL; send `x-webhook-secret`.
5. Ensure each shipped order has `tracking_number` populated before carrier events arrive.

---

## Files map

| File | Role |
|------|------|
| `create-checkout-session/index.ts` | Platform charge + escrow math |
| `_shared/marketplaceConnectEscrow.ts` | Transfer + manual schedule + payout release |
| `_shared/markOrderPaid.ts` | Post-payment escrow transfer |
| `shipping-tracker-webhook/index.ts` | Step 3–4 HTTP listener |
| `_shared/shippingTracker.ts` | Parse Shippo/EasyPost + carrier-scan payout |
| `confirm-order-receipt/index.ts` | Buyer fallback payout |
| `inventory-source-webhook/index.ts` | Tracking fields; delivered fallback only |
