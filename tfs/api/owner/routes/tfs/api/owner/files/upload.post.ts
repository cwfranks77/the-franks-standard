import { handleUpload } from '#tfs-owner-api/lib/handlers'

export default defineEventHandler((event) => handleUpload(event))
