/** Pre-index stores (every 10 minutes). */

const { indexStores } = require('../search/index_stores.js')

module.exports = async function indexStoresJob (admin) {
  return indexStores(admin, { limit: 200 })
}
