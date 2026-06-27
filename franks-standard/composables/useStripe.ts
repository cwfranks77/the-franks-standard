import { loadStripe, type Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null
let stripePromiseKey = ''

/** Load Stripe.js once on the client (Elements / Payment Element checkout). */
export function useStripe () {
  const config = useRuntimeConfig()
  const publishableKey = String(config.public.stripePublishableKey || '').trim()

  function getStripe (): Promise<Stripe | null> {
    if (!import.meta.client) return Promise.resolve(null)
    if (!publishableKey) return Promise.resolve(null)
    if (!stripePromise || stripePromiseKey !== publishableKey) {
      stripePromiseKey = publishableKey
      stripePromise = loadStripe(publishableKey)
    }
    return stripePromise
  }

  return { getStripe, publishableKey }
}

/** Client-only Stripe.js promise (for embedded Elements if you add them later). */
export function getStripePromise () {
  return useStripe().getStripe()
}
