// scripts/ownerRoutes.ts
// Express route wiring — matches ownerTools sketch (live site uses matching Nitro routes).

import type { Express } from 'express'
import {
  requireOwner,
  ownerLookupUser,
  ownerLookupListing,
  ownerLookupTransaction,
  ownerForceRefund,
  ownerResolveDispute,
  ownerVerifySeller,
  ownerUnverifySeller,
  ownerVerifyBuyer,
  ownerUnverifyBuyer,
  ownerBanUser,
  ownerUnbanUser,
} from './ownerTools'

export {
  ownerLookupUser,
  ownerLookupListing,
  ownerLookupTransaction,
  ownerForceRefund,
  ownerResolveDispute,
  ownerVerifySeller,
  ownerUnverifySeller,
  ownerVerifyBuyer,
  ownerUnverifyBuyer,
  ownerBanUser,
  ownerUnbanUser,
}

export function registerOwnerRoutes (app: Express) {
  app.get('/api/owner/user/:userId', requireOwner, ownerLookupUser)
  app.get('/api/owner/listing/:listingId', requireOwner, ownerLookupListing)
  app.get('/api/owner/transaction/:transactionId', requireOwner, ownerLookupTransaction)

  app.post('/api/owner/refund/:transactionId', requireOwner, ownerForceRefund)
  app.post('/api/owner/dispute/:disputeId', requireOwner, ownerResolveDispute)

  app.post('/api/owner/seller/verify/:userId', requireOwner, ownerVerifySeller)
  app.post('/api/owner/seller/unverify/:userId', requireOwner, ownerUnverifySeller)

  app.post('/api/owner/buyer/verify/:userId', requireOwner, ownerVerifyBuyer)
  app.post('/api/owner/buyer/unverify/:userId', requireOwner, ownerUnverifyBuyer)

  app.post('/api/owner/ban/:userId', requireOwner, ownerBanUser)
  app.post('/api/owner/unban/:userId', requireOwner, ownerUnbanUser)
}
