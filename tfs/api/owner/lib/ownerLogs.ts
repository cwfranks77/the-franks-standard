import { appendFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const LOGS_DIR = resolve(process.cwd(), 'tfs/logs')

export const ALLOWED_OWNER_LOGS = new Set([
  'owner-file-actions.log',
  'dealer-packet.log',
  'owner-errors.log',
  'owner-access.log',
  'system-validation.log',
])

function appendLog (filename: string, line: string): void {
  const file = resolve(LOGS_DIR, filename)
  try {
    mkdirSync(dirname(file), { recursive: true })
    appendFileSync(file, line, 'utf8')
  } catch {
    // Logging must not break operations
  }
}

export function logOwnerFileAction (owner: string, action: string, relativePath: string): void {
  const ts = new Date().toISOString()
  appendLog('owner-file-actions.log', `[${ts}] [${owner}] ACTION: ${action} PATH: ${relativePath}\n`)
}

export function logOwnerAccess (owner: string, action: string, detail: string): void {
  const ts = new Date().toISOString()
  appendLog('owner-access.log', `[${ts}] [${owner}] ACCESS: ${action} DETAIL: ${detail}\n`)
}

export function logOwnerError (owner: string, message: string, context = ''): void {
  const ts = new Date().toISOString()
  const ctx = context ? ` CONTEXT: ${context}` : ''
  appendLog('owner-errors.log', `[${ts}] [${owner}] ERROR: ${message}${ctx}\n`)
}

export function logDealerPacket (owner: string, action: string, detail: string): void {
  const ts = new Date().toISOString()
  appendLog('dealer-packet.log', `[${ts}] [${owner}] PACKET: ${action} DETAIL: ${detail}\n`)
}

export function logSystemValidation (message: string): void {
  const ts = new Date().toISOString()
  appendLog('system-validation.log', `[${ts}] ${message}\n`)
}

export function getLogsDir (): string {
  return LOGS_DIR
}
