import { validateOwner } from '@/server/utils/validateOwner'
import activity from '@/server/data/activity.json'

export default defineEventHandler((event) => {
  validateOwner(event)
  return activity
})
