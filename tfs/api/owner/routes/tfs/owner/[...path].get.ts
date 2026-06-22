import { readFileSync, existsSync } from 'node:fs'
import { resolve, extname } from 'node:path'

const OWNER_DIR = resolve(process.cwd(), 'tfs/owner')

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
}

/** Serve TFS owner dashboard + file manager static assets. */
export default defineEventHandler((event) => {
  const raw = getRouterParam(event, 'path') || 'index.html'
  const safe = raw.replace(/\\/g, '/').replace(/^\/+/, '')
  if (safe.includes('..') || safe.includes('\0')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid path' })
  }

  const filePath = resolve(OWNER_DIR, safe)
  if (!filePath.startsWith(OWNER_DIR) || !existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const ext = extname(filePath).toLowerCase()
  const body = readFileSync(filePath)
  setHeader(event, 'Content-Type', MIME[ext] || 'application/octet-stream')
  setHeader(event, 'Cache-Control', 'no-store')
  return body
})
