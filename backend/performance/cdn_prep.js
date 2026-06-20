/**
 * CDN preparation — static asset hashing and cache headers (backend only).
 */

const { createHash } = require('node:crypto')
const { readFileSync, existsSync } = require('node:fs')
const { join } = require('node:path')

function hashFile (absolutePath) {
  if (!existsSync(absolutePath)) return null
  const buf = readFileSync(absolutePath)
  return createHash('sha256').update(buf).digest('hex')
}

function versionedAssetPath (relativePath, contentHash) {
  const hash = (contentHash || '').slice(0, 12)
  if (!hash) return relativePath
  const dot = relativePath.lastIndexOf('.')
  if (dot < 0) return `${relativePath}.${hash}`
  return `${relativePath.slice(0, dot)}.${hash}${relativePath.slice(dot)}`
}

function cdnCacheHeaders (maxAgeSeconds = 86400) {
  return {
    'Cache-Control': `public, max-age=${maxAgeSeconds}, immutable`,
    'CDN-Cache-Control': `max-age=${maxAgeSeconds}`,
    'Surrogate-Control': `max-age=${maxAgeSeconds}`,
  }
}

function buildAssetManifest (rootDir, relativePaths = []) {
  const manifest = {}
  for (const rel of relativePaths) {
    const abs = join(rootDir, rel)
    const hash = hashFile(abs)
    if (hash) {
      manifest[rel] = {
        hash,
        versioned_path: versionedAssetPath(rel, hash),
        cdn_headers: cdnCacheHeaders(),
      }
    }
  }
  return manifest
}

module.exports = {
  hashFile,
  versionedAssetPath,
  cdnCacheHeaders,
  buildAssetManifest,
}
