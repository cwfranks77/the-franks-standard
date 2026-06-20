/**
 * File upload security — type, size, hash, executable rejection, optional ClamAV.
 */

const { createHash } = require('node:crypto')

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
])

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.pdf'])
const MAX_BYTES = 10 * 1024 * 1024

const EXECUTABLE_MAGIC = [
  [0x4D, 0x5A], // MZ
  [0x7F, 0x45, 0x4C, 0x46], // ELF
  [0x50, 0x4B, 0x03, 0x04], // ZIP (block unless pdf path)
]

function extFromName (name) {
  const m = String(name || '').toLowerCase().match(/(\.[a-z0-9]+)$/)
  return m ? m[1] : ''
}

function hasExecutableMagic (buffer) {
  if (!buffer || buffer.length < 2) return false
  for (const sig of EXECUTABLE_MAGIC) {
    let match = true
    for (let i = 0; i < sig.length; i++) {
      if (buffer[i] !== sig[i]) { match = false; break }
    }
    if (match) {
      const ext = extFromName('')
      if (sig[0] === 0x50 && ext === '.pdf') continue
      return true
    }
  }
  return false
}

function hashBuffer (buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

async function scanWithClamav (buffer) {
  const host = process.env.CLAMAV_HOST || process.env.NUXT_CLAMAV_HOST
  if (!host) return { scanned: false, clean: true, engine: 'skipped' }

  try {
    const net = require('node:net')
    return await new Promise((resolve) => {
      const socket = net.createConnection(3310, host)
      const chunks = []
      socket.on('data', (d) => chunks.push(d))
      socket.on('error', () => resolve({ scanned: false, clean: true, engine: 'clamav_unavailable' }))
      socket.on('connect', () => {
        socket.write('zINSTREAM\0')
        const len = Buffer.alloc(4)
        len.writeUInt32BE(buffer.length, 0)
        socket.write(len)
        socket.write(buffer)
        socket.write(Buffer.alloc(4))
      })
      socket.on('end', () => {
        const res = Buffer.concat(chunks).toString()
        const clean = res.includes('OK') && !res.includes('FOUND')
        resolve({ scanned: true, clean, engine: 'clamav', raw: res.slice(0, 200) })
      })
      setTimeout(() => {
        socket.destroy()
        resolve({ scanned: false, clean: true, engine: 'clamav_timeout' })
      }, 8000)
    })
  } catch {
    return { scanned: false, clean: true, engine: 'clamav_error' }
  }
}

async function validateUpload ({
  buffer,
  mimeType,
  filename,
  sizeBytes,
}) {
  const size = sizeBytes ?? buffer?.length ?? 0
  const mime = String(mimeType || '').toLowerCase()
  const ext = extFromName(filename)

  if (size > MAX_BYTES) {
    return { ok: false, error: 'file_too_large', max_bytes: MAX_BYTES }
  }

  if (!ALLOWED_MIME.has(mime) && !ALLOWED_EXT.has(ext)) {
    return { ok: false, error: 'file_type_not_allowed', allowed: [...ALLOWED_EXT] }
  }

  if (!buffer?.length) {
    return { ok: false, error: 'empty_file' }
  }

  if (hasExecutableMagic(buffer)) {
    return { ok: false, error: 'executable_content_rejected' }
  }

  const hashSha256 = hashBuffer(buffer)
  const scan = await scanWithClamav(buffer)

  if (scan.scanned && !scan.clean) {
    return { ok: false, error: 'malware_detected', scan }
  }

  return {
    ok: true,
    hash_sha256: hashSha256,
    mime_type: mime,
    file_size_bytes: size,
    scan_status: scan.scanned ? 'clean' : 'skipped',
    scan_details: scan,
  }
}

async function logListingFile (admin, row) {
  if (!admin) return null
  const { data } = await admin.from('listing_files').insert(row).select('id').single()
  return data?.id ?? null
}

async function logCoaFile (admin, row) {
  if (!admin) return null
  const { data } = await admin.from('coa_files').insert({
    user_id: row.uploader_id,
    uploader_id: row.uploader_id,
    listing_id: row.listing_id ?? null,
    file_url: row.storage_path,
    storage_path: row.storage_path,
    hash: row.hash_sha256,
    mime_type: row.mime_type,
    file_size_bytes: row.file_size_bytes,
    device_fingerprint: row.device_fingerprint ?? null,
    ip_address: row.ip_address ?? null,
  }).select('id').single()
  return data?.id ?? null
}

function getFileScanStatus () {
  return {
    enabled: true,
    allowed_types: [...ALLOWED_EXT],
    max_mb: MAX_BYTES / (1024 * 1024),
    clamav_configured: Boolean(process.env.CLAMAV_HOST || process.env.NUXT_CLAMAV_HOST),
    hash_algorithm: 'sha256',
  }
}

module.exports = {
  validateUpload,
  logListingFile,
  logCoaFile,
  getFileScanStatus,
  ALLOWED_MIME,
  MAX_BYTES,
}
