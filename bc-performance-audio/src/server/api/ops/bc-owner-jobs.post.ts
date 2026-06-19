import { requireBcOpsAuth } from '#bc-server-utils/bcOpsAuth'
import { closeDueBcAuctions } from '../../jobs/auctionCloser'
import { sweepBcDisputes } from '../../jobs/disputeSweeper'

/** Manual trigger for background owner jobs (or wire to a cron secret later). */
export default defineEventHandler(async (event) => {
  requireBcOpsAuth(event)
  const [auctions, disputes] = await Promise.all([
    closeDueBcAuctions(),
    sweepBcDisputes(),
  ])
  return { success: true, auctions, disputes }
})
