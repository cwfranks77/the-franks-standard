import { handleNewFolder } from '#tfs-owner-api/lib/handlers'

export default defineEventHandler((event) => handleNewFolder(event))
