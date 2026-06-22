import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, extname, resolve } from 'node:path'
import type { H3Event } from 'h3'
import { requireTfsOwnerAuth } from './auth'
import { logOwnerFileAction, logOwnerAccess, logOwnerError, ALLOWED_OWNER_LOGS, getLogsDir } from './log'
import { assertDestructiveAllowed } from './rateLimit'
import { getTfsRoot, resolveSafeRelativePath, toLogPath } from './paths'
import { validateUploadFile } from './uploadValidation'

const TEXT_PREVIEW_EXT = new Set([
  '.txt', '.md', '.json', '.js', '.ts', '.css', '.html', '.vue', '.sql', '.log', '.csv', '.xml', '.yml', '.yaml', '.env.example',
])

function guardPath (relativePath: string) {
  const resolved = resolveSafeRelativePath(relativePath)
  if (!resolved.ok) {
    throw createError({ statusCode: 400, statusMessage: resolved.error })
  }
  return resolved
}

export function handleList (event: H3Event) {
  const owner = requireTfsOwnerAuth(event)
  const query = getQuery(event)
  const dir = String(query.path || '')
  const search = String(query.q || '').trim().toLowerCase()
  const { absolute, relative } = guardPath(dir)

  if (!existsSync(absolute)) {
    throw createError({ statusCode: 404, statusMessage: 'Folder not found' })
  }
  const st = statSync(absolute)
  if (!st.isDirectory()) {
    throw createError({ statusCode: 400, statusMessage: 'Not a directory' })
  }

  const entries = readdirSync(absolute, { withFileTypes: true })
  const folders: Array<{ name: string, path: string }> = []
  const files: Array<{ name: string, path: string, size: number, modified: string, previewable: boolean }> = []

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const childRel = relative ? `${relative}/${entry.name}` : entry.name
    const childAbs = resolveSafeRelativePath(childRel)
    if (!childAbs.ok) continue

    if (entry.isDirectory()) {
      if (!search || entry.name.toLowerCase().includes(search)) {
        folders.push({ name: entry.name, path: childRel })
      }
    } else if (entry.isFile()) {
      if (search && !entry.name.toLowerCase().includes(search)) continue
      const fst = statSync(childAbs.absolute)
      const ext = extname(entry.name).toLowerCase()
      files.push({
        name: entry.name,
        path: childRel,
        size: fst.size,
        modified: fst.mtime.toISOString(),
        previewable: TEXT_PREVIEW_EXT.has(ext) && fst.size <= 512 * 1024,
      })
    }
  }

  folders.sort((a, b) => a.name.localeCompare(b.name))
  files.sort((a, b) => a.name.localeCompare(b.name))

  logOwnerFileAction(owner, 'list', toLogPath(relative))

  return {
    ok: true,
    root: getTfsRoot(),
    path: relative,
    folders,
    files,
  }
}

export async function handleUpload (event: H3Event) {
  const owner = requireTfsOwnerAuth(event)
  const query = getQuery(event)
  const dir = String(query.path || '')
  const { absolute, relative } = guardPath(dir)

  if (!existsSync(absolute)) {
    throw createError({ statusCode: 404, statusMessage: 'Folder not found' })
  }
  if (!statSync(absolute).isDirectory()) {
    throw createError({ statusCode: 400, statusMessage: 'Not a directory' })
  }

  const parts = await readMultipartFormData(event)
  if (!parts?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No upload payload' })
  }

  const saved: string[] = []
  for (const part of parts) {
    if (part.name !== 'file' || !part.filename || !part.data) continue
    const safeName = basename(part.filename).replace(/[^\w.\-()+ ]/g, '_')
    if (!safeName || safeName === '.' || safeName === '..') continue

    const check = validateUploadFile(safeName, part.data.length)
    if (!check.ok) {
      throw createError({ statusCode: 400, statusMessage: check.error })
    }

    const targetRel = relative ? `${relative}/${safeName}` : safeName
    const target = guardPath(targetRel)
    writeFileSync(target.absolute, part.data)
    logOwnerFileAction(owner, 'upload', toLogPath(target.relative))
    saved.push(target.relative)
  }

  if (!saved.length) {
    throw createError({ statusCode: 400, statusMessage: 'No valid files in upload' })
  }

  return { ok: true, uploaded: saved }
}

export function handleDownload (event: H3Event) {
  const owner = requireTfsOwnerAuth(event)
  const query = getQuery(event)
  const filePath = String(query.path || '')
  const { absolute, relative } = guardPath(filePath)

  if (!existsSync(absolute) || !statSync(absolute).isFile()) {
    throw createError({ statusCode: 404, statusMessage: 'File not found' })
  }

  logOwnerFileAction(owner, 'download', toLogPath(relative))

  const preview = String(query.preview || '') === '1'
  if (preview) {
    const ext = extname(absolute).toLowerCase()
    if (!TEXT_PREVIEW_EXT.has(ext)) {
      throw createError({ statusCode: 400, statusMessage: 'Preview not available for this file type' })
    }
    setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
    return readFileSync(absolute, 'utf8')
  }

  setHeader(event, 'Content-Disposition', `attachment; filename="${basename(absolute)}"`)
  return sendStream(event, createReadStream(absolute))
}

export async function handleRename (event: H3Event) {
  const owner = requireTfsOwnerAuth(event)
  assertDestructiveAllowed(event, 'rename')
  const body = await readBody(event).catch(() => ({})) as { path?: string, newName?: string }
  const from = guardPath(String(body.path || ''))
  const newName = basename(String(body.newName || '').trim())
  if (!newName || newName.includes('..') || newName.includes('/') || newName.includes('\\')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid new name' })
  }

  if (!existsSync(from.absolute)) {
    throw createError({ statusCode: 404, statusMessage: 'Path not found' })
  }

  const parentRel = dirname(from.relative).replace(/\\/g, '/')
  const toRel = parentRel && parentRel !== '.' ? `${parentRel}/${newName}` : newName
  const to = guardPath(toRel)

  if (existsSync(to.absolute)) {
    throw createError({ statusCode: 409, statusMessage: 'Target already exists' })
  }

  mkdirSync(dirname(to.absolute), { recursive: true })
  renameSync(from.absolute, to.absolute)
  logOwnerFileAction(owner, 'rename', `${toLogPath(from.relative)} -> ${toLogPath(to.relative)}`)

  return { ok: true, path: to.relative }
}

export async function handleDelete (event: H3Event) {
  const owner = requireTfsOwnerAuth(event)
  assertDestructiveAllowed(event, 'delete')
  const body = await readBody(event).catch(() => ({})) as { path?: string }
  const target = guardPath(String(body.path || ''))

  if (!existsSync(target.absolute)) {
    throw createError({ statusCode: 404, statusMessage: 'Path not found' })
  }

  const st = statSync(target.absolute)
  if (st.isDirectory()) {
    rmSync(target.absolute, { recursive: true, force: true })
  } else {
    rmSync(target.absolute, { force: true })
  }

  logOwnerFileAction(owner, 'delete', toLogPath(target.relative))
  return { ok: true, deleted: target.relative }
}

export async function handleNewFolder (event: H3Event) {
  const owner = requireTfsOwnerAuth(event)
  const body = await readBody(event).catch(() => ({})) as { path?: string, name?: string }
  const parent = guardPath(String(body.path || ''))
  const name = String(body.name || '').trim().replace(/[/\\]/g, '')
  if (!name || name.includes('..')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid folder name' })
  }

  if (!existsSync(parent.absolute) || !statSync(parent.absolute).isDirectory()) {
    throw createError({ statusCode: 404, statusMessage: 'Parent folder not found' })
  }

  const childRel = parent.relative ? `${parent.relative}/${name}` : name
  const child = guardPath(childRel)
  if (existsSync(child.absolute)) {
    throw createError({ statusCode: 409, statusMessage: 'Folder already exists' })
  }

  mkdirSync(child.absolute, { recursive: false })
  logOwnerFileAction(owner, 'new-folder', toLogPath(child.relative))
  return { ok: true, path: child.relative }
}

export function handleReadLog (event: H3Event) {
  const owner = requireTfsOwnerAuth(event)
  const query = getQuery(event)
  const rawName = basename(String(query.file || query.name || '').trim())
  if (!rawName || !ALLOWED_OWNER_LOGS.has(rawName)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or disallowed log file' })
  }

  const logPath = resolve(getLogsDir(), rawName)
  if (!logPath.startsWith(getLogsDir())) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid log path' })
  }

  const contents = existsSync(logPath) ? readFileSync(logPath, 'utf8') : ''
  logOwnerAccess(owner, 'read-log', rawName)

  return {
    ok: true,
    file: rawName,
    contents,
    size: contents.length,
    modified: existsSync(logPath) ? statSync(logPath).mtime.toISOString() : null,
  }
}

export async function handleLogError (event: H3Event) {
  const owner = requireTfsOwnerAuth(event)
  const body = await readBody(event).catch(() => ({})) as { message?: string, context?: string }
  const message = String(body.message || 'Unknown error').slice(0, 2000)
  const context = String(body.context || '').slice(0, 500)
  logOwnerError(owner, message, context)
  return { ok: true }
}
