import { extname } from 'node:path'

const BLOCKED_EXT = new Set([
  '.exe', '.bat', '.cmd', '.com', '.scr', '.msi', '.dll', '.sh', '.ps1', '.vbs', '.jar', '.app', '.deb', '.rpm',
])

const MAX_BYTES = 50 * 1024 * 1024

export function validateUploadFile (filename: string, byteLength: number): { ok: true } | { ok: false, error: string } {
  const ext = extname(filename).toLowerCase()
  if (BLOCKED_EXT.has(ext)) {
    return { ok: false, error: `Upload blocked: file type ${ext} is not allowed` }
  }
  if (byteLength > MAX_BYTES) {
    return { ok: false, error: 'Upload blocked: file exceeds 50MB limit' }
  }
  if (byteLength <= 0) {
    return { ok: false, error: 'Upload blocked: empty file' }
  }
  return { ok: true }
}
