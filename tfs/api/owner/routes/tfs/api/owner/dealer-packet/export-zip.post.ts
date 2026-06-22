import { handleDealerPacketExportZip } from '#tfs-owner-api/lib/dealerPacket'

export default defineEventHandler((event) => handleDealerPacketExportZip(event))
