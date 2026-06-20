import { runOwnerTool, tools } from '../_toolRoute'

export default defineEventHandler(async (event) => {
  const transactionId = String(getRouterParam(event, 'transactionId') || '')
  return runOwnerTool(event, ({ sb, actorId, stripe }) =>
    tools.forceRefund(sb, transactionId, { actorId, stripe }),
  )
})
