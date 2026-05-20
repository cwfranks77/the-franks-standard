/** Stripe Payment Link URLs — single source for /pay, pricing, listings, and support. */
export interface PaymentLinkItem {
  key: string
  badge: string
  title: string
  body: string
  url: string
  envName: string
  amountHint?: string
}

export function usePaymentLinks () {
  const config = useRuntimeConfig()
  const c = config.public

  const listingFee = String(c.payListingFeeUrl || '').trim()
  const proSeller = String(c.payProSellerUrl || '').trim()
  const orderDeposit = String(c.payOrderDepositUrl || '').trim()
  const disputeFee = String(c.payDisputeFeeUrl || '').trim()

  const links = computed<PaymentLinkItem[]>(() => [
    {
      key: 'list',
      badge: 'Sellers',
      title: 'Listing or renewal fee',
      body: 'Pay per listing or renewal when you exceed free tier limits.',
      url: listingFee,
      envName: 'NUXT_PUBLIC_PAY_LISTING_FEE_URL',
      amountHint: 'Per listing',
    },
    {
      key: 'pro',
      badge: 'Sellers',
      title: 'Pro seller plan ($9.99/mo)',
      body: 'Upgrade to Pro for unlimited listings, featured placement, and AI Store Builder.',
      url: proSeller,
      envName: 'NUXT_PUBLIC_PAY_PRO_SELLER_URL',
      amountHint: 'Pro subscription',
    },
    {
      key: 'order',
      badge: 'Buyers',
      title: 'Order payment / deposit',
      body: 'Secure checkout for item payment or buyer deposit. Funds follow escrow rules.',
      url: orderDeposit,
      envName: 'NUXT_PUBLIC_PAY_ORDER_DEPOSIT_URL',
      amountHint: 'Per order',
    },
    {
      key: 'dispute',
      badge: 'Either party',
      title: 'Dispute or mediation fee',
      body: 'Optional fee for escalated review or mediation on a transaction.',
      url: disputeFee,
      envName: 'NUXT_PUBLIC_PAY_DISPUTE_FEE_URL',
      amountHint: 'Per dispute',
    },
  ])

  const allConfigured = computed(() => links.value.every((l) => !!l.url))
  const configuredCount = computed(() => links.value.filter((l) => !!l.url).length)

  function urlFor (key: PaymentLinkItem['key']): string {
    return links.value.find((l) => l.key === key)?.url || ''
  }

  return {
    links,
    allConfigured,
    configuredCount,
    urlFor,
    listingFeeUrl: listingFee,
    proSellerUrl: proSeller,
    orderDepositUrl: orderDeposit,
    disputeFeeUrl: disputeFee,
  }
}