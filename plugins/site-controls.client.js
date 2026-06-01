const STORAGE_KEY = 'tfs_site_controls_v1'

const DEFAULTS = {
  theme: 'standard',
  density: 'comfortable',
  textSize: 'normal',
  reduceMotion: false,
  hideFounderBar: false,
  hideActivityTicker: false,
  hideAppPromo: false,
  hideLiveNow: false,
  hideProofStrip: false,
}

function readControls () {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  } catch {
    return { ...DEFAULTS }
  }
}

function upsertStyle () {
  if (document.getElementById('tfs-site-controls-style')) return
  const style = document.createElement('style')
  style.id = 'tfs-site-controls-style'
  style.textContent = `
html.tfs-theme-high-contrast { --gold: #f5b301; --gold-light: #ffd166; --stone-100: #ffffff; --stone-900: #050505; }
html.tfs-theme-black-gold body { background: #050505; }
html.tfs-large-text { font-size: 18px; }
html.tfs-compact-ui .section,
html.tfs-compact-ui .hero-epic,
html.tfs-compact-ui .live-now-section,
html.tfs-compact-ui .floor-hub { padding-top: 24px !important; padding-bottom: 24px !important; }
html.tfs-compact-ui .card { padding: 14px !important; }
html.tfs-reduce-motion *, html.tfs-reduce-motion *::before, html.tfs-reduce-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  scroll-behavior: auto !important;
  transition-duration: 0.01ms !important;
}
html.tfs-hide-founder-bar .founder-bar,
html.tfs-hide-activity-ticker .activity-ticker,
html.tfs-hide-app-promo .app-section,
html.tfs-hide-live-now .live-now-section,
html.tfs-hide-proof-strip .proof-strip { display: none !important; }
`
  document.head.appendChild(style)
}

function applyControls () {
  upsertStyle()
  const controls = readControls()
  const root = document.documentElement
  root.classList.toggle('tfs-theme-high-contrast', controls.theme === 'high-contrast')
  root.classList.toggle('tfs-theme-black-gold', controls.theme === 'black-gold')
  root.classList.toggle('tfs-compact-ui', controls.density === 'compact')
  root.classList.toggle('tfs-large-text', controls.textSize === 'large')
  root.classList.toggle('tfs-reduce-motion', !!controls.reduceMotion)
  root.classList.toggle('tfs-hide-founder-bar', !!controls.hideFounderBar)
  root.classList.toggle('tfs-hide-activity-ticker', !!controls.hideActivityTicker)
  root.classList.toggle('tfs-hide-app-promo', !!controls.hideAppPromo)
  root.classList.toggle('tfs-hide-live-now', !!controls.hideLiveNow)
  root.classList.toggle('tfs-hide-proof-strip', !!controls.hideProofStrip)
}

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return
  applyControls()
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) applyControls()
  })
  window.addEventListener('tfs-site-controls-updated', applyControls)
})
