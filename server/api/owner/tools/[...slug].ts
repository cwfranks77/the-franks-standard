import { getMethod } from 'h3'
import { runOwnerTool, tools } from '../_toolRoute'

/**
 * Legacy alias routes under /api/owner/tools/* (same handlers as /api/owner/user|listing|...).
 */
export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') || '').replace(/^\/+|\/+$/g, '')
  const parts = slug.split('/').filter(Boolean)
  const method = getMethod(event)

  if (!parts.length) {
    return tools.getOwnerToolsStatus()
  }

  // users/:id
  if (parts[0] === 'users' && parts.length >= 2) {
    const userId = parts[1]
    if (parts[2] === 'ban' && method === 'POST') {
      return runOwnerTool(event, ({ sb, actorId }) => tools.banUser(sb, userId, { actorId }))
    }
    if (parts[2] === 'unban' && method === 'POST') {
      return runOwnerTool(event, ({ sb, actorId }) => tools.unbanUserTool(sb, userId, { actorId }))
    }
    if (method === 'GET' && parts.length === 2) {
      return runOwnerTool(event, ({ sb, actorId }) => tools.lookupUser(sb, userId, { actorId }))
    }
  }

  if (parts[0] === 'listings' && parts.length === 2 && method === 'GET') {
    return runOwnerTool(event, ({ sb, actorId }) => tools.lookupListing(sb, parts[1], { actorId }))
  }

  if (parts[0] === 'transactions' && parts.length >= 2) {
    const transactionId = parts[1]
    if (parts[2] === 'force-refund' && method === 'POST') {
      return runOwnerTool(event, ({ sb, actorId, stripe }) =>
        tools.forceRefund(sb, transactionId, { actorId, stripe }),
      )
    }
    if (method === 'GET' && parts.length === 2) {
      return runOwnerTool(event, ({ sb, actorId }) => tools.lookupTransaction(sb, transactionId, { actorId }))
    }
  }

  if (parts[0] === 'disputes' && parts.length === 3 && parts[2] === 'resolve' && method === 'POST') {
    const body = await readBody(event).catch(() => ({})) as { ruling?: string }
    return runOwnerTool(event, ({ sb, actorId }) => tools.resolveDispute(sb, parts[1], {
      actorId,
      ruling: body?.ruling ? String(body.ruling) : undefined,
    }))
  }

  if (parts[0] === 'sellers' && parts.length === 3 && method === 'POST') {
    const userId = parts[1]
    if (parts[2] === 'verify') return runOwnerTool(event, ({ sb, actorId }) => tools.verifySeller(sb, userId, { actorId }))
    if (parts[2] === 'unverify') return runOwnerTool(event, ({ sb, actorId }) => tools.unverifySeller(sb, userId, { actorId }))
  }

  if (parts[0] === 'buyers' && parts.length === 3 && method === 'POST') {
    const userId = parts[1]
    if (parts[2] === 'verify') return runOwnerTool(event, ({ sb, actorId }) => tools.verifyBuyer(sb, userId, { actorId }))
    if (parts[2] === 'unverify') return runOwnerTool(event, ({ sb, actorId }) => tools.unverifyBuyer(sb, userId, { actorId }))
  }

  throw createError({ statusCode: 404, statusMessage: 'Unknown owner tool route.' })
})
