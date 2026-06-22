import { tfsOwnerFetch, requireOwnerKey, clearOwnerKey } from '../owner-shared.js'

const API = '/tfs/api/owner/dealer-packet'
const els = {
  status: document.getElementById('dp-status'),
  summary: document.getElementById('dp-summary'),
  progress: document.getElementById('dp-progress'),
  bar: document.getElementById('dp-progress-bar'),
}

function setStatus (msg, type = '') {
  els.status.textContent = msg
  els.status.className = 'fm-status' + (type ? ` ${type}` : '')
}

function setProgress (pct) {
  els.progress.hidden = pct <= 0 || pct >= 100
  els.bar.style.width = `${Math.min(100, pct)}%`
}

async function postAction (path, label) {
  requireOwnerKey()
  setProgress(20)
  setStatus(`${label}…`)
  try {
    const res = await tfsOwnerFetch(`${API}/${path}`, { method: 'POST' })
    setProgress(70)
    if (!res.ok) throw new Error(await res.text() || `${label} failed`)
    const data = await res.json()
    setProgress(100)
    setTimeout(() => setProgress(0), 400)
    return data
  } catch (err) {
    setProgress(0)
    const msg = err.message || String(err)
    setStatus(msg, 'error')
    if (window.tfsShowError) window.tfsShowError(msg, 'dealer-packet')
    throw err
  }
}

document.getElementById('btn-build').addEventListener('click', async () => {
  try {
    const data = await postAction('build', 'Building packet')
    els.summary.innerHTML = `Last updated: <strong>${new Date(data.lastUpdated).toLocaleString()}</strong> · `
      + `${data.documentCount} cached documents indexed · `
      + `Files ready in <strong>tfs/system/dealer-packet/</strong>`
    setStatus('Packet built successfully.', 'success')
  } catch { /* handled */ }
})

document.getElementById('btn-pdf').addEventListener('click', async () => {
  try {
    await postAction('export-pdf', 'Exporting PDF')
    setStatus('Dealer_Packet.pdf ready.', 'success')
  } catch { /* handled */ }
})

document.getElementById('btn-zip').addEventListener('click', async () => {
  try {
    await postAction('export-zip', 'Creating ZIP')
    setStatus('Dealer_Packet.zip ready.', 'success')
  } catch { /* handled */ }
})

document.getElementById('btn-folder').addEventListener('click', async () => {
  requireOwnerKey()
  setStatus('Loading folder info…')
  try {
    const res = await tfsOwnerFetch(`${API}/folder`)
    const data = await res.json()
    setStatus(`Packet folder: ${data.folder} — ${data.hint}`, 'success')
    window.open('/tfs/owner/file-manager.html?path=tfs/system/dealer-packet', '_blank')
  } catch (err) {
    const msg = err.message || String(err)
    setStatus(msg, 'error')
    if (window.tfsShowError) window.tfsShowError(msg, 'dealer-packet')
  }
})

document.getElementById('btn-logout')?.addEventListener('click', () => {
  clearOwnerKey()
  window.location.href = '/tfs/owner/index.html'
})

requireOwnerKey()
