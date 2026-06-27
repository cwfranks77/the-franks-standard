/** SHA-256 hex digest for COA upload authentication. */
export async function sha256HexFromFile (file) {
  if (!file || typeof file.arrayBuffer !== 'function') return ''
  const buf = await file.arrayBuffer()
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
