import { validateOwner } from '@/server/utils/validateOwner'
import { logEvent } from '@/server/utils/logger'
import activity from '@/server/data/activity.json'

export default defineEventHandler(async (event) => {
  validateOwner(event)
  const body = await readBody(event)

  activity.taxes++
  logEvent('TAX_EVENT_LOGGED', body)

  return { ok: true }
})
