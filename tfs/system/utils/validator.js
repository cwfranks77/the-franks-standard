import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const REPO = process.cwd()

const REQUIRED_DIRS = [
  'tfs/owner',
  'tfs/owner/tools',
  'tfs/owner/components',
  'tfs/api/owner',
  'tfs/logs',
  'tfs/system/dealer-packet',
  'tfs/system/document-cache',
  'tfs/system/utils',
]

const REQUIRED_FILES = [
  'tfs/owner/index.html',
  'tfs/owner/file-manager.html',
  'tfs/owner/tools/log-viewer.html',
  'tfs/owner/tools/dealer-packet.html',
  'tfs/owner/components/error-overlay.js',
  'tfs/system/dealer-packet/builder.js',
  'tfs/system/utils/indexer.js',
  'tfs/system/utils/packet-export.js',
  'tfs/system/utils/validator.js',
]

function log (message) {
  const logFile = path.join(REPO, 'tfs/logs/system-validation.log')
  fs.mkdirSync(path.dirname(logFile), { recursive: true })
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${message}\n`, 'utf8')
}

async function checkApi (baseUrl) {
  const checks = [
    { name: 'files/list', url: `${baseUrl}/tfs/api/owner/files/list`, expect: 401 },
    { name: 'files/read-log', url: `${baseUrl}/tfs/api/owner/files/read-log`, expect: 401 },
  ]
  const results = []
  for (const c of checks) {
    try {
      const res = await fetch(c.url)
      const pass = res.status === c.expect
      results.push({ ...c, status: res.status, pass })
      log(`API ${c.name}: ${pass ? 'PASS' : 'FAIL'} (HTTP ${res.status})`)
    } catch (err) {
      results.push({ ...c, pass: false, error: String(err.message || err) })
      log(`API ${c.name}: FAIL (${err.message || err})`)
    }
  }
  return results
}

function checkWritableLogs () {
  const logDir = path.join(REPO, 'tfs/logs')
  fs.mkdirSync(logDir, { recursive: true })
  const testFile = path.join(logDir, '.write-test')
  try {
    fs.writeFileSync(testFile, 'ok', 'utf8')
    fs.unlinkSync(testFile)
    log('Logs writable: PASS')
    return true
  } catch (err) {
    log(`Logs writable: FAIL (${err.message})`)
    return false
  }
}

async function checkPacketBuilder () {
  try {
    const mod = await import(pathToFileURL(path.join(REPO, 'tfs/system/dealer-packet/builder.js')).href)
    const result = await mod.buildDealerPacket({ owner: 'validator' })
    const pass = Boolean(result?.ok && fs.existsSync(result.files?.pdf))
    log(`Packet builder: ${pass ? 'PASS' : 'FAIL'}`)
    return pass
  } catch (err) {
    log(`Packet builder: FAIL (${err.message})`)
    return false
  }
}

/**
 * Run full TFS owner system validation.
 * @param {{ apiBase?: string }} [opts]
 */
export async function runValidation (opts = {}) {
  const apiBase = opts.apiBase || process.env.TFS_VALIDATOR_API_BASE || ''
  log('--- Validation run start ---')

  let allPass = true
  for (const rel of REQUIRED_DIRS) {
    const abs = path.join(REPO, rel)
    const pass = fs.existsSync(abs)
    if (!pass) allPass = false
    log(`DIR ${rel}: ${pass ? 'PASS' : 'MISSING'}`)
  }

  for (const rel of REQUIRED_FILES) {
    const abs = path.join(REPO, rel)
    const pass = fs.existsSync(abs)
    if (!pass) allPass = false
    log(`FILE ${rel}: ${pass ? 'PASS' : 'MISSING'}`)
  }

  if (!checkWritableLogs()) allPass = false

  if (apiBase) {
    const apiResults = await checkApi(apiBase)
    if (apiResults.some((r) => !r.pass)) allPass = false
  } else {
    log('API routes: SKIPPED (set TFS_VALIDATOR_API_BASE or pass apiBase)')
  }

  if (!(await checkPacketBuilder())) allPass = false

  log(`--- Validation complete: ${allPass ? 'ALL PASS' : 'ISSUES FOUND'} ---`)
  return { ok: allPass }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runValidation({ apiBase: process.env.TFS_VALIDATOR_API_BASE }).then((r) => {
    process.exit(r.ok ? 0 : 1)
  })
}

export default { runValidation }
