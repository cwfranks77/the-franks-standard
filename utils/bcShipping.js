/**
 * B&C Performance Audio — customer-facing shipping estimates (dropship / distributor).
 * Update here to keep product, checkout, and thank-you pages in sync.
 */
export const BC_SHIPPING = Object.freeze({
  /** One-line badge for product cards */
  shortLine: 'Est. delivery: 7–14 business days · usually sooner',
  headline: 'Estimated delivery',
  summary:
    'Allow 7–14 business days after checkout in case of postal delays — most orders arrive sooner.',
  usuallySooner: 'Most orders arrive sooner than the window above.',
  processingLabel: 'Order processing',
  processingDays: '1–3 business days after payment confirms',
  transitLabel: 'Transit',
  transitDays: '5–11 business days after ship (continental U.S.)',
  details: [
    '1–3 business days to confirm payment and release your order to our authorized distributor.',
    'We quote 7–14 business days total to allow for postal delays — most deliveries land sooner.',
    'Tracking is emailed when your package leaves the distributor.',
  ],
  checkoutNote:
    'You are charged at secure checkout. Fulfillment begins after payment is confirmed — not before.',
  successLead:
    'Your order is queued for distributor fulfillment. Allow 7–14 business days for delivery in case of postal delays — most orders arrive sooner.',
})
