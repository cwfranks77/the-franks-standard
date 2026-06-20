/**
 * Express route handlers for marketplace enforcement wiring.
 */

const { createListing } = require('./create_listing.js')
const { startCheckout } = require('./checkout.js')
const { getServiceSupabaseFromEnv } = require('./_env.js')

async function createListingHandler (req, res) {
  try {
    const admin = getServiceSupabaseFromEnv()
    const sellerId = req.user?.id ?? null
    const body = req.body && typeof req.body === 'object' ? req.body : {}
    const flags = Array.isArray(req.listingFlags) ? req.listingFlags : []

    const result = await createListing(admin, {
      sellerId,
      listing: body,
      flags,
      publish: Boolean(body.publish),
    })

    if (!result.ok) {
      return res.status(result.status || 400).json({ error: result.error })
    }

    return res.status(201).json(result)
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'create_listing_failed' })
  }
}

async function checkoutHandler (req, res, next) {
  try {
    const body = {
      ...(req.body && typeof req.body === 'object' ? req.body : {}),
      user_id: req.user?.id ?? req.body?.user_id,
    }

    const result = await startCheckout({
      supabaseUrl: process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NUXT_PUBLIC_SUPABASE_KEY || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
      authorization: req.headers.authorization || '',
      body,
      checkoutTotals: req.checkoutTotals ?? null,
      skipCompleteLog: true,
    })

    if (!result.ok) {
      return res.status(result.status || 500).json({
        error: result.error,
        message: result.message,
        ...(result.data ? { details: result.data } : {}),
      })
    }

    res.locals.checkoutResult = result
    return next()
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'checkout_failed' })
  }
}

module.exports = {
  createListingHandler,
  checkoutHandler,
}
