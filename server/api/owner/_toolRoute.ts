import { requireOwnerAuth } from '../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../utils/serviceSupabase'
import { createRequire } from 'node:module'
import type { H3Event } from 'h3'

const require = createRequire(import.meta.url)
const tools = require('../../../backend/owner/owner_tools.js')

export type ToolResult = { ok: boolean, error?: string, status?: number, [key: string]: unknown }

export function ownerToolRespond (result: ToolResult) {
  if (!result.ok) {
    throw createError({
      statusCode: result.status || 400,
      statusMessage: result.error || 'owner_tool_failed',
    })
  }
  return result
}

export function getOptionalStripe () {
  try {
    const Stripe = require('stripe')
    const key = process.env.STRIPE_SECRET_KEY || process.env.NUXT_STRIPE_SECRET_KEY
    if (!key) return null
    return new Stripe(String(key))
  } catch {
    return null
  }
}

export async function runOwnerTool (
  event: H3Event,
  fn: (ctx: {
    sb: NonNullable<ReturnType<typeof getServiceSupabase>>
    actorId: string
    stripe: ReturnType<typeof getOptionalStripe>
  }) => Promise<ToolResult>,
) {
  requireOwnerAuth(event)
  const sb = getServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })

  const actorId = getHeader(event, 'x-user-id') || 'ops'
  const stripe = getOptionalStripe()
  return ownerToolRespond(await fn({ sb, actorId, stripe }))
}

export { tools }
