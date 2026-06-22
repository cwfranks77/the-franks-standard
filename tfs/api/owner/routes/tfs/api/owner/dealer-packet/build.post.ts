import { handleDealerPacketBuild } from '#tfs-owner-api/lib/dealerPacket'

export default defineEventHandler((event) => handleDealerPacketBuild(event))
