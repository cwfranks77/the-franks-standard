import { handleSystemValidate } from '#tfs-owner-api/lib/dealerPacket'

export default defineEventHandler((event) => handleSystemValidate(event))
