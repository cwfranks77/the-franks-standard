import { appendFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const LOG_FILE = resolve(process.cwd(), 'tfs/logs/owner-file-actions.log')

export function logOwnerFileAction (owner: string, action: string, relativePath: string): void {
  const ts = new Date().toISOString()
  const line = `[${ts}] [${owner}] ACTION: ${action} PATH: ${relativePath}\n`
  try {
    mkdirSync(dirname(LOG_FILE), { recursive: true })
    appendFileSync(LOG_FILE, line, 'utf8')
  } catch {
    // Logging must not break file operations
  }
}
