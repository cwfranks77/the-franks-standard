/**
 * Express handlers for owner tools routes.
 */

const { getServiceSupabaseFromEnv } = require('../marketplace/_env.js')
const {
  lookupUser,
  lookupListing,
  lookupTransaction,
  forceRefund,
  resolveDispute,
  verifySeller,
  unverifySeller,
  verifyBuyer,
  unverifyBuyer,
  banUser,
  unbanUserTool,
} = require('./owner_tools.js')

function actorId (req) {
  return req?.user?.id || 'ops'
}

function send (res, result) {
  if (!result.ok) {
    return res.status(result.status || 400).json({ error: result.error })
  }
  return res.json(result)
}

async function ownerLookupUser (req, res) {
  const admin = getServiceSupabaseFromEnv()
  return send(res, await lookupUser(admin, req.params.userId, { actorId: actorId(req) }))
}

async function ownerLookupListing (req, res) {
  const admin = getServiceSupabaseFromEnv()
  return send(res, await lookupListing(admin, req.params.listingId, { actorId: actorId(req) }))
}

async function ownerLookupTransaction (req, res) {
  const admin = getServiceSupabaseFromEnv()
  return send(res, await lookupTransaction(admin, req.params.transactionId, { actorId: actorId(req) }))
}

async function ownerForceRefund (req, res) {
  const admin = getServiceSupabaseFromEnv()
  return send(res, await forceRefund(admin, req.params.transactionId, { actorId: actorId(req) }))
}

async function ownerResolveDispute (req, res) {
  const admin = getServiceSupabaseFromEnv()
  return send(res, await resolveDispute(admin, req.params.disputeId, { actorId: actorId(req) }))
}

async function ownerVerifySeller (req, res) {
  const admin = getServiceSupabaseFromEnv()
  return send(res, await verifySeller(admin, req.params.userId, { actorId: actorId(req) }))
}

async function ownerUnverifySeller (req, res) {
  const admin = getServiceSupabaseFromEnv()
  return send(res, await unverifySeller(admin, req.params.userId, { actorId: actorId(req) }))
}

async function ownerVerifyBuyer (req, res) {
  const admin = getServiceSupabaseFromEnv()
  return send(res, await verifyBuyer(admin, req.params.userId, { actorId: actorId(req) }))
}

async function ownerUnverifyBuyer (req, res) {
  const admin = getServiceSupabaseFromEnv()
  return send(res, await unverifyBuyer(admin, req.params.userId, { actorId: actorId(req) }))
}

async function ownerBanUser (req, res) {
  const admin = getServiceSupabaseFromEnv()
  return send(res, await banUser(admin, req.params.userId, { actorId: actorId(req) }))
}

async function ownerUnbanUser (req, res) {
  const admin = getServiceSupabaseFromEnv()
  return send(res, await unbanUserTool(admin, req.params.userId, { actorId: actorId(req) }))
}

module.exports = {
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
