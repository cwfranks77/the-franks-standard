import { handleDownload } from '#tfs-owner-api/lib/handlers'

export default defineEventHandler((event) => handleDownload(event))
