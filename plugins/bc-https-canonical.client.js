import { BC_POWER_AUDIO_HOSTS } from '~/utils/bcPrimarySite.js'

/** Prefer https://www.bcpoweraudio.com (GitHub Pages cert is issued for www). */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const host = window.location.hostname.toLowerCase()
  if (!BC_POWER_AUDIO_HOSTS.has(host)) return

  const path = `${window.location.pathname}${window.location.search}${window.location.hash}`
  const targetHost = 'www.bcpoweraudio.com'
  const needsWww = host === 'bcpoweraudio.com'
  const needsHttps = window.location.protocol === 'http:'

  if (needsWww || needsHttps) {
    window.location.replace(`https://${targetHost}${path}`)
  }
})
