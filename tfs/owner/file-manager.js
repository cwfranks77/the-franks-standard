import {
  tfsOwnerFetch,
  requireOwnerKey,
  formatBytes,
  clearOwnerKey,
  logClientAction,
} from './owner-shared.js'

const API = '/tfs/api/owner/files'
let currentPath = ''
let selectedPath = ''
let selectedPreviewable = false
let searchTimer = null

const els = {
  tree: document.getElementById('fm-tree'),
  tbody: document.getElementById('fm-tbody'),
  pathLabel: document.getElementById('fm-path'),
  search: document.getElementById('fm-search'),
  status: document.getElementById('fm-status'),
  drop: document.getElementById('fm-drop'),
  fileInput: document.getElementById('fm-file-input'),
  modal: document.getElementById('fm-modal'),
  modalBody: document.getElementById('fm-modal-body'),
  modalTitle: document.getElementById('fm-modal-title'),
}

function setStatus (msg, type = '') {
  els.status.textContent = msg
  els.status.className = 'fm-status' + (type ? ` ${type}` : '')
}

function openModal (title, content) {
  els.modalTitle.textContent = title
  els.modalBody.textContent = content
  els.modal.hidden = false
}

function closeModal () {
  els.modal.hidden = true
  els.modalBody.textContent = ''
}

async function apiList (path = '', q = '') {
  const params = new URLSearchParams({ path })
  if (q) params.set('q', q)
  logClientAction('list-request', path || '/')
  const res = await tfsOwnerFetch(`${API}/list?${params}`)
  if (!res.ok) throw new Error((await res.text()) || 'List failed')
  return res.json()
}

function renderTree (path) {
  const parts = path ? path.split('/') : []
  let html = '<button type="button" data-path="">📁 / (root)</button>'
  let acc = ''
  for (const part of parts) {
    acc = acc ? `${acc}/${part}` : part
    html += `<button type="button" data-path="${acc}">📁 ${part}</button>`
  }
  els.tree.innerHTML = html
  els.tree.querySelectorAll('button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.path === path)
    btn.addEventListener('click', () => navigate(btn.dataset.path || ''))
  })
}

function renderFiles (data) {
  els.pathLabel.textContent = data.path ? `/${data.path}` : '/'
  currentPath = data.path || ''
  renderTree(currentPath)

  const rows = []
  for (const folder of data.folders) {
    rows.push(`
      <tr data-path="${folder.path}" data-type="dir" data-preview="0">
        <td>📁 ${escapeHtml(folder.name)}</td>
        <td>—</td>
        <td>Folder</td>
      </tr>`)
  }
  for (const file of data.files) {
    rows.push(`
      <tr data-path="${file.path}" data-type="file" data-preview="${file.previewable ? '1' : '0'}">
        <td>📄 ${escapeHtml(file.name)}</td>
        <td>${formatBytes(file.size)}</td>
        <td>${new Date(file.modified).toLocaleString()}</td>
      </tr>`)
  }
  els.tbody.innerHTML = rows.join('') || '<tr><td colspan="3">Empty folder</td></tr>'

  els.tbody.querySelectorAll('tr[data-path]').forEach((tr) => {
    tr.addEventListener('click', () => selectRow(tr))
    tr.addEventListener('dblclick', () => {
      if (tr.dataset.type === 'dir') navigate(tr.dataset.path)
      else downloadFile(tr.dataset.path)
    })
  })
}

function escapeHtml (s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function selectRow (tr) {
  els.tbody.querySelectorAll('tr').forEach((r) => r.classList.remove('selected'))
  tr.classList.add('selected')
  selectedPath = tr.dataset.path || ''
  selectedPreviewable = tr.dataset.preview === '1'
}

async function navigate (path) {
  try {
    setStatus('Loading…')
    const data = await apiList(path, els.search.value.trim())
    renderFiles(data)
    selectedPath = ''
    selectedPreviewable = false
    setStatus('Ready', 'ok')
  } catch (err) {
    setStatus(err.message || 'List failed', 'error')
  }
}

async function previewFile (path) {
  const p = path || selectedPath
  if (!p) return alert('Select a text file to preview.')
  logClientAction('preview-request', p)
  try {
    const res = await tfsOwnerFetch(`${API}/download?path=${encodeURIComponent(p)}&preview=1`)
    if (!res.ok) throw new Error(await res.text())
    openModal(p.split('/').pop(), await res.text())
  } catch (err) {
    setStatus(err.message || 'Preview failed', 'error')
  }
}

async function downloadFile (path) {
  const p = path || selectedPath
  if (!p) return alert('Select a file first.')
  logClientAction('download-request', p)
  const res = await tfsOwnerFetch(`${API}/download?path=${encodeURIComponent(p)}`)
  if (!res.ok) throw new Error(await res.text())
  const blob = await res.blob()
  const name = p.split('/').pop()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
  setStatus(`Downloaded ${name}`, 'ok')
}

async function uploadFiles (fileList) {
  if (!fileList?.length) return
  const form = new FormData()
  for (const file of fileList) form.append('file', file)
  logClientAction('upload-request', currentPath || '/')
  setStatus(`Uploading ${fileList.length} file(s)…`)
  const res = await tfsOwnerFetch(`${API}/upload?path=${encodeURIComponent(currentPath)}`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) throw new Error(await res.text())
  await navigate(currentPath)
  setStatus('Upload complete', 'ok')
}

async function newFolder () {
  const name = prompt('New folder name:')
  if (!name) return
  logClientAction('new-folder-request', `${currentPath}/${name}`)
  const res = await tfsOwnerFetch(`${API}/new-folder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: currentPath, name }),
  })
  if (!res.ok) throw new Error(await res.text())
  await navigate(currentPath)
  setStatus('Folder created', 'ok')
}

async function renameSelected () {
  if (!selectedPath) return alert('Select a file or folder first.')
  const newName = prompt('New name:', selectedPath.split('/').pop())
  if (!newName) return
  logClientAction('rename-request', selectedPath)
  const res = await tfsOwnerFetch(`${API}/rename`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: selectedPath, newName }),
  })
  if (!res.ok) throw new Error(await res.text())
  await navigate(currentPath)
  setStatus('Renamed', 'ok')
}

async function deleteSelected () {
  if (!selectedPath) return alert('Select a file or folder first.')
  if (!confirm(`Delete ${selectedPath}? This cannot be undone.`)) return
  logClientAction('delete-request', selectedPath)
  const res = await tfsOwnerFetch(`${API}/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: selectedPath }),
  })
  if (!res.ok) throw new Error(await res.text())
  selectedPath = ''
  await navigate(currentPath)
  setStatus('Deleted', 'ok')
}

function wireToolbar () {
  document.getElementById('btn-up').addEventListener('click', () => {
    if (!currentPath) return
    const parts = currentPath.split('/')
    parts.pop()
    navigate(parts.join('/'))
  })
  document.getElementById('btn-upload').addEventListener('click', () => els.fileInput.click())
  document.getElementById('btn-download').addEventListener('click', () => downloadFile().catch((e) => setStatus(e.message, 'error')))
  document.getElementById('btn-rename').addEventListener('click', () => renameSelected().catch((e) => setStatus(e.message, 'error')))
  document.getElementById('btn-delete').addEventListener('click', () => deleteSelected().catch((e) => setStatus(e.message, 'error')))
  document.getElementById('btn-mkdir').addEventListener('click', () => newFolder().catch((e) => setStatus(e.message, 'error')))
  document.getElementById('btn-preview').addEventListener('click', () => {
    if (!selectedPreviewable) return alert('Select a previewable text file.')
    previewFile().catch((e) => setStatus(e.message, 'error'))
  })
  document.getElementById('btn-refresh').addEventListener('click', () => navigate(currentPath))
  document.getElementById('btn-logout').addEventListener('click', () => {
    clearOwnerKey()
    window.location.href = '/tfs/owner/index.html'
  })

  document.getElementById('fm-modal-close').addEventListener('click', closeModal)
  document.getElementById('fm-modal-backdrop').addEventListener('click', closeModal)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !els.modal.hidden) closeModal()
  })

  els.fileInput.addEventListener('change', () => {
    uploadFiles(els.fileInput.files).catch((e) => setStatus(e.message, 'error'))
    els.fileInput.value = ''
  })

  els.search.addEventListener('input', () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => navigate(currentPath), 300)
  })

  els.drop.addEventListener('dragover', (e) => {
    e.preventDefault()
    els.drop.classList.add('dragover')
  })
  els.drop.addEventListener('dragleave', () => els.drop.classList.remove('dragover'))
  els.drop.addEventListener('drop', (e) => {
    e.preventDefault()
    els.drop.classList.remove('dragover')
    uploadFiles(e.dataTransfer.files).catch((err) => setStatus(err.message, 'error'))
  })
}

if (!requireOwnerKey()) {
  // redirect handled in shared
} else {
  wireToolbar()
  const startPath = new URLSearchParams(window.location.search).get('path') || ''
  navigate(startPath).catch((e) => {
    setStatus(e.message, 'error')
    if (window.tfsShowError) window.tfsShowError(e.message, 'file-manager')
  })
}
