import { runOwnerTool, tools } from '../_toolRoute'

export default defineEventHandler(async (event) => {
  const userId = String(getRouterParam(event, 'userId') || '')
  return runOwnerTool(event, ({ sb, actorId }) => tools.unbanUserTool(sb, userId, { actorId }))
})
