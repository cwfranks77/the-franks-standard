/**
 * Load owner platform_config.json (backend only).
 */

const fs = require('fs')
const path = require('path')

const CONFIG_PATH = path.join(__dirname, '../../owner/platform_config.json')

let cached = null
let cachedAt = 0
const CACHE_MS = 60_000

function loadPlatformConfig ({ force = false } = {}) {
  const now = Date.now()
  if (!force && cached && now - cachedAt < CACHE_MS) return cached

  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8')
    cached = JSON.parse(raw)
    cachedAt = now
    return cached
  } catch (e) {
    return {
      _error: e.message,
      fee_rates: { default_bps: 1000 },
      payout_delay_days: { trusted_seller: 2, new_seller: 7 },
      monitoring_intervals: { post_launch_monitor_minutes: 10 },
    }
  }
}

module.exports = { loadPlatformConfig, CONFIG_PATH }
