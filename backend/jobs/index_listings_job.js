/** Pre-index listings (every 5 minutes). */

const { indexListings } = require('../search/index_listings.js')
const { indexReviews } = require('../search/index_reviews.js')
const { indexCoa } = require('../search/index_coa.js')
const { computeTrendingScores } = require('../recommendations/trending.js')

module.exports = async function indexListingsJob (admin) {
  const listings = await indexListings(admin, { limit: 500 })
  const reviews = await indexReviews(admin, { limit: 200 })
  const coa = await indexCoa(admin, { limit: 100 })
  const trending = await computeTrendingScores(admin, { limit: 30 })
  return { listings, reviews, coa, trending }
}
