/*
===========================================================
CURSOR: DO NOT SCREW UP — STRICT FILE ISOLATION MODE
You are ONLY allowed to modify THIS file.
Do NOT modify, refactor, rename, or touch ANY other file.
Do NOT create additional files.
Do NOT remove or alter this header.
===========================================================
*/

import Stripe from 'stripe'

export default defineEventHandler(async () => {
  try {
    const secret = process.env.STRIPE_SECRET_KEY

    if (!secret) {
      return {
        ok: false,
        message: 'Stripe secret key NOT found in environment'
      }
    }

    const stripe = new Stripe(secret, {
      apiVersion: '2023-10-16'
    })

    // Harmless test call to verify Stripe connectivity
    const balance = await stripe.balance.retrieve()

    return {
      ok: true,
      message: 'Stripe is wired in and responding correctly',
      stripeConnected: true,
      testResult: {
        hasBalanceObject: typeof balance === 'object',
        objectType: balance.object
      }
    }
  } catch (err: any) {
    return {
      ok: false,
      message: 'Stripe connection failed',
      error: err.message || String(err)
    }
  }
})
