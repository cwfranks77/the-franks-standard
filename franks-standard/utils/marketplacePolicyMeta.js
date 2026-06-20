/** Shared legal/policy metadata — keep dates and hierarchy in sync across public pages. */

export const POLICY_LAST_UPDATED = 'May 29, 2026'

export const POLICY_HIERARCHY = [
  { label: 'Terms of Service', path: '/terms', role: 'Master agreement for all users' },
  { label: 'Privacy Policy', path: '/privacy', role: 'How we handle personal data' },
  { label: 'Marketplace Policies & Enforcement', path: '/marketplace-policy', role: 'Operating standards, refunds, freezes, authenticity (platform bylaws)' },
  { label: 'Seller Agreement', path: '/seller-agreement', role: 'Additional rules if you sell' },
  { label: 'Prohibited Items', path: '/prohibited-items', role: 'What may not be listed' },
  { label: 'Buyer & seller protection (summary)', path: '/protection', role: 'Plain-language overview — not a substitute for the policies above' },
]
