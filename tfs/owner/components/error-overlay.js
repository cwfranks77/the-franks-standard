import { tfsOwnerFetch } from '../owner-shared.js'

let lastError = { message: '', context: '' }

function ensureOverlay () {
  if (document.getElementById('tfs-err-overlay')) return

  fetch('/tfs/owner/components/error-overlay.html')
    .then((r) => r.text())
    .then((html) => {
      const wrap = document.createElement('div')
      wrap.innerHTML = html.trim()
      document.body.appendChild(wrap.firstElementChild)
      wireOverlay()
    })
    .catch(() => {
      const el = document.createElement('div')
      el.id = 'tfs-err-overlay'
      el.hidden = true
      document.body.appendChild(el)
    })
}

function wireOverlay () {
  const overlay = document.getElementById('tfs-err-overlay')
  const body = document.getElementById('tfs-err-body')
  const close = () => { overlay.hidden = true }

  document.getElementById('tfs-err-backdrop')?.addEventListener('click', close)
  document.getElementById('tfs-err-close')?.addEventListener('click', close)

  document.getElementById('tfs-err-copy')?.addEventListener('click', async () => {
    const text = `${lastError.context}: ${lastError.message}`
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      window.prompt('Copy error text:', text)
    }
  })

  document.getElementById('tfs-err-report')?.addEventListener('click', async () => {
    try {
      await tfsOwnerFetch('/tfs/api/owner/log/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: lastError.message, context: lastError.context }),
      })
      body.textContent = 'Error logged to owner-errors.log. You can also email info@thefranksstandard.com.'
    } catch {
      body.textContent = 'Could not reach log API. Email info@thefranksstandard.com with the copied error.'
    }
  })
}

async function logErrorRemote (message, context) {
  try {
    await tfsOwnerFetch('/tfs/api/owner/log/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context }),
    })
  } catch {
    // ignore — overlay still shown
  }
}

window.tfsShowError = function tfsShowError (message, context = 'owner-tool') {
  lastError = { message: String(message || 'Unknown error'), context: String(context) }
  ensureOverlay()
  logErrorRemote(lastError.message, lastError.context)

  const overlay = document.getElementById('tfs-err-overlay')
  const body = document.getElementById('tfs-err-body')
  if (overlay && body) {
    body.textContent = lastError.message
    overlay.hidden = false
    wireOverlay()
  }
}

ensureOverlay()

// Catch unhandled promise rejections on owner tools
window.addEventListener('unhandledrejection', (ev) => {
  const msg = ev.reason?.message || String(ev.reason || 'Unhandled error')
  if (window.tfsShowError) window.tfsShowError(msg, 'unhandledrejection')
})
