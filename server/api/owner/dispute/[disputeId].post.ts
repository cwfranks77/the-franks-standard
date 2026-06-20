import { runOwnerTool, tools } from '../_toolRoute'

export default defineEventHandler(async (event) => {
  const disputeId = String(getRouterParam(event, 'disputeId') || '')
  const body = await readBody(event).catch(() => ({})) as { ruling?: string }
  return runOwnerTool(event, ({ sb, actorId }) => tools.resolveDispute(sb, disputeId, {
    actorId,
    ruling: body?.ruling ? String(body.ruling) : undefined,
  }))
})
