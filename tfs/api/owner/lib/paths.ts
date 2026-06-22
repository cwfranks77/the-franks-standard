import { resolve, sep } from 'node:path'

const BLOCKED_SEGMENTS = new Set([
  'node_modules',
  '.git',
  '.env',
  '.nuxt',
  '.output',
])

/** Project root — TFS working directory boundary for the file manager. */
export function getTfsRoot (): string {
  return resolve(process.cwd())
}

function isInsideRoot (root: string, target: string): boolean {
  const normalizedRoot = root.endsWith(sep) ? root : root + sep
  return target === root || target.startsWith(normalizedRoot)
}

/**
 * Resolve a relative path under TFS root. Rejects traversal and blocked folders.
 */
export function resolveSafeRelativePath (relativePath: string): { ok: true, absolute: string, relative: string } | { ok: false, error: string } {
  const root = getTfsRoot()
  const rel = String(relativePath || '').replace(/\\/g, '/').replace(/^\/+/, '')
  if (rel.includes('\0') || rel.split('/').some((seg) => seg === '..')) {
    return { ok: false, error: 'Invalid path' }
  }

  const segments = rel.split('/').filter(Boolean)
  for (const seg of segments) {
    if (BLOCKED_SEGMENTS.has(seg)) {
      return { ok: false, error: 'Access denied for this folder' }
    }
  }

  const absolute = resolve(root, rel || '.')
  if (!isInsideRoot(root, absolute)) {
    return { ok: false, error: 'Path outside TFS root' }
  }

  return { ok: true, absolute, relative: rel || '' }
}

export function toLogPath (relative: string): string {
  return '/' + String(relative || '').replace(/\\/g, '/').replace(/^\/+/, '')
}
