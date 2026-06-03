/**
 * ESM entry — delegates to stripe-audit.cjs (package.json has "type": "module").
 */
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const cjs = path.join(path.dirname(fileURLToPath(import.meta.url)), 'stripe-audit.cjs')
const result = spawnSync(process.execPath, [cjs], { stdio: 'inherit' })
process.exit(result.status ?? 1)
