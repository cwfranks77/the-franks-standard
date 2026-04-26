/**
 * Optional deploy ping to Telegram (phone app).
 * Env: TELEGRAM_BOT_TOKEN, TELEGRAM_NOTIFY_CHAT_ID (or TELEGRAM_CHANNEL_ID)
 * Usage: node scripts/notify-telegram.cjs "Your message"
 */
const axios = require('axios')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

async function main () {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_NOTIFY_CHAT_ID || process.env.TELEGRAM_CHANNEL_ID
  const text = process.argv.slice(2).join(' ').trim() || 'The Franks Standard: notification.'
  if (!token || !chatId) {
    console.log('[notify-telegram] Skip: missing TELEGRAM_BOT_TOKEN or TELEGRAM_NOTIFY_CHAT_ID.')
    process.exit(0)
  }
  const url = `https://api.telegram.org/bot${token}/sendMessage`
  await axios.post(url, { chat_id: chatId, text: text.slice(0, 4096) })
  console.log('[notify-telegram] Sent.')
}

main().catch((e) => {
  console.error('[notify-telegram]', e.response?.data || e.message)
  process.exit(1)
})
