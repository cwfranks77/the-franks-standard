import { tfsOwnerFetch, requireOwnerKey, clearOwnerKey } from '../owner-shared.js'

const API = '/tfs/api/owner/files/read-log'
let rawText = ''
let refreshTimer = null

const els = {
  file: document.getElementById('lv-file'),
  search: document.getElementById('lv-search'),
  date: document.getElementById('lv-date'),
  auto: document.getElementById('lv-auto'),
  refresh: document.getElementById('lv-refresh'),
  window: document.getElementById('lv-window'),
  meta: document.getElementById('lv-meta'),
  status: document.getElementById('lv-status'),
}

function setStatus (msg, type = '') {
  els.status.textContent = msg
  els.status.className = 'fm-status' + (type ? ` ${type}` : '')
}

function parseLineDate (line) {
  const m = line.match(/^\[(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : null
}

function renderFiltered () {
  const q = els.search.value.trim().toLowerCase()
  const dateFilter = els.date.value
  const lines = rawText.split('\n').filter(Boolean)

  const filtered = lines.filter((line) => {
    if (dateFilter) {
      const d = parseLineDate(line)
      if (d && d < dateFilter) return false
    }
    if (q && !line.toLowerCase().includes(q)) return false
    return true
  })

  if (!filtered.length) {
    els.window.innerHTML = '<span class="lv-empty">No matching log lines.</span>'
    return
  }

  els.window.innerHTML = filtered.map((line) => {
    const hit = q && line.toLowerCase().includes(q)
    const esc = line.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    return hit ? `<span class="lv-line--match">${esc}</span>` : esc
  }).join('\n')
}

async function loadLog () {
  requireOwnerKey()
  const file = els.file.value
  setStatus('Loading…')
  try {
    const res = await tfsOwnerFetch(`${API}?file=${encodeURIComponent(file)}`)
    if (!res.ok) throw new Error(await res.text() || 'Failed to load log')
    const data = await res.json()
    rawText = data.contents || ''
    const mod = data.modified ? new Date(data.modified).toLocaleString() : 'new file'
    els.meta.textContent = `${file} · ${data.size} bytes · last modified ${mod} · ${rawText.split('\n').filter(Boolean).length} lines`
    renderFiltered()
    setStatus('Loaded', 'success')
  } catch (err) {
    const msg = err.message || String(err)
    setStatus(msg, 'error')
    if (window.tfsShowError) window.tfsShowError(msg, 'log-viewer')
  }
}

function setupAutoRefresh () {
  clearInterval(refreshTimer)
  if (els.auto.checked) {
    refreshTimer = setInterval(loadLog, 10000)
  }
}

els.file.addEventListener('change', loadLog)
els.search.addEventListener('input', renderFiltered)
els.date.addEventListener('change', renderFiltered)
els.refresh.addEventListener('click', loadLog)
els.auto.addEventListener('change', setupAutoRefresh)

document.getElementById('btn-logout')?.addEventListener('click', () => {
  clearOwnerKey()
  window.location.href = '/tfs/owner/index.html'
})

loadLog()
setupAutoRefresh()
