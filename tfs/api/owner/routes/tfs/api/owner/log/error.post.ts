import { handleLogError } from '#tfs-owner-api/lib/handlers'

export default defineEventHandler((event) => handleLogError(event))
