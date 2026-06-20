/**
 * Global API response optimization — JSON-only, cache headers, compression, normalized errors.
 */

const { createHash } = require('node:crypto')
const { gzipSync: gzip, brotliCompressSync: brotli } = require('node:zlib')

const API_VERSION = process.env.TFS_API_VERSION || '1.0.0'

function normalizeError (statusCode, message, code = 'error') {
  return {
    ok: false,
    error: {
      code,
      message: String(message || 'An error occurred'),
      status: statusCode,
    },
  }
}

function etagForBody (body) {
  const raw = typeof body === 'string' ? body : JSON.stringify(body)
  return `"${createHash('sha256').update(raw).digest('hex').slice(0, 16)}"`
}

function setJsonHeaders (res, { cacheSeconds = 0, etag = null, cdnMaxAge = null } = {}) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-API-Version', API_VERSION)
  res.setHeader('Vary', 'Accept-Encoding')

  if (cdnMaxAge != null) {
    res.setHeader('Cache-Control', `public, max-age=${cdnMaxAge}, s-maxage=${cdnMaxAge}`)
    res.setHeader('CDN-Cache-Control', `max-age=${cdnMaxAge}`)
  } else if (cacheSeconds > 0) {
    res.setHeader('Cache-Control', `private, max-age=${cacheSeconds}`)
  } else {
    res.setHeader('Cache-Control', 'no-store')
  }

  if (etag) res.setHeader('ETag', etag)
}

function compressBody (body, acceptEncoding = '') {
  const raw = typeof body === 'string' ? body : JSON.stringify(body)
  const ae = String(acceptEncoding).toLowerCase()

  if (ae.includes('br')) {
    const compressed = brotli(raw)
    return { body: compressed, encoding: 'br', raw }
  }

  if (ae.includes('gzip')) {
    const compressed = gzip(raw)
    return { body: compressed, encoding: 'gzip', raw }
  }

  return { body: raw, encoding: null, raw }
}

/**
 * Apply optimization to an H3 event response (call from Nitro plugin or middleware).
 */
function applyResponseOptimization (event, body) {
  const res = event.node?.res
  if (!res || !event.path?.startsWith('/api/')) return body

  const accept = event.node?.req?.headers?.['accept-encoding'] || ''
  const isJson = body !== null && typeof body === 'object'
  if (!isJson && typeof body !== 'string') return body

  const payload = isJson ? body : body
  const etag = etagForBody(payload)
  const cacheHint = event.context?.cacheSeconds ?? 0
  const cdnMaxAge = event.context?.cdnMaxAge ?? null

  setJsonHeaders(res, { cacheSeconds: cacheHint, etag, cdnMaxAge })

  const { body: out, encoding } = compressBody(payload, accept)
  if (encoding) {
    res.setHeader('Content-Encoding', encoding)
  }

  return out
}

function prepareHandlerContext (event, { cacheSeconds = 0, cdnMaxAge = null } = {}) {
  event.context = event.context || {}
  event.context.cacheSeconds = cacheSeconds
  event.context.cdnMaxAge = cdnMaxAge
}

module.exports = {
  normalizeError,
  applyResponseOptimization,
  prepareHandlerContext,
  setJsonHeaders,
  compressBody,
  etagForBody,
  API_VERSION,
}
