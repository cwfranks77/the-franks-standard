import { handleDealerPacketExportPdf } from '#tfs-owner-api/lib/dealerPacket'

export default defineEventHandler((event) => handleDealerPacketExportPdf(event))
