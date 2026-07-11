#!/usr/bin/env node
/**
 * Download Petra prodlist.csv for weekly catalog refresh.
 *
 * Methods (first match wins):
 *   1. PETRA_PRODLIST_URL — direct HTTPS URL (optional PETRA_PRODLIST_BEARER)
 *   2. PETRA_FTP_HOST + PETRA_FTP_USER + PETRA_FTP_PASSWORD (+ PETRA_FTP_REMOTE_PATH)
 *   3. Existing file at %USERPROFILE%/Downloads/prodlist.csv (skip download)
 *
 * Output: prodlist.csv in repo root + copy to Downloads when possible.
 */
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')
const https = require('node:https')
const http = require('node:http')

const ROOT = path.join(__dirname, '..')
const OUT_REPO = path.join(ROOT, 'prodlist.csv')
const OUT_DOWNLOADS = path.join(process.env.USERPROFILE || process.env.HOME || '', 'Downloads', 'prodlist.csv')

function log (msg) {
  console.log(`fetch-petra-prodlist: ${msg}`)
}

function writeCsv (buffer) {
  fs.writeFileSync(OUT_REPO, buffer)
  try {
    fs.mkdirSync(path.dirname(OUT_DOWNLOADS), { recursive: true })
    fs.writeFileSync(OUT_DOWNLOADS, buffer)
  } catch { /* optional */ }
  log(`saved ${buffer.length} bytes → ${OUT_REPO}`)
}

function fetchUrl (url, headers = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http
    lib.get(url, { headers }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchUrl(res.headers.location, headers).then(resolve).catch(reject)
        return
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`))
        return
      }
      const chunks = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks)))
    }).on('error', reject)
  })
}

async function tryUrlDownload () {
  const url = String(process.env.PETRA_PRODLIST_URL || '').trim()
  if (!url) return false
  const headers = {}
  const bearer = String(process.env.PETRA_PRODLIST_BEARER || '').trim()
  if (bearer) headers.Authorization = `Bearer ${bearer}`
  log(`downloading from URL…`)
  const buf = await fetchUrl(url, headers)
  if (buf.length < 500) throw new Error('Download too small — not a valid prodlist.csv')
  writeCsv(buf)
  return true
}

function tryFtpDownload () {
  const host = String(process.env.PETRA_FTP_HOST || 'ftp.petraindustriesllc.com').trim()
  const user = String(process.env.PETRA_FTP_USER || '').trim()
  const pass = String(process.env.PETRA_FTP_PASSWORD || '').trim()
  const remote = String(process.env.PETRA_FTP_REMOTE_PATH || 'prodlist.csv').trim()
  if (!user || !pass) return false

  log(`downloading via FTP ${host}/${remote}…`)
  const target = OUT_REPO.replace(/\\/g, '/')
  const url = `ftp://${host}/${remote}`
  try {
    execFileSync('curl', ['-sS', '-f', '--user', `${user}:${pass}`, '-o', target, url], {
      stdio: 'pipe',
      timeout: 120000,
    })
  } catch (err) {
    throw new Error(`FTP download failed: ${err.message}`)
  }
  const buf = fs.readFileSync(OUT_REPO)
  if (buf.length < 500) throw new Error('FTP file too small')
  try { fs.copyFileSync(OUT_REPO, OUT_DOWNLOADS) } catch { /* ok */ }
  log(`saved ${buf.length} bytes via FTP`)
  return true
}

function useExisting () {
  const candidates = [OUT_DOWNLOADS, OUT_REPO]
  for (const p of candidates) {
    if (fs.existsSync(p) && fs.statSync(p).size > 500) {
      if (p !== OUT_REPO) fs.copyFileSync(p, OUT_REPO)
      log(`using existing ${p}`)
      return true
    }
  }
  return false
}

async function main () {
  if (await tryUrlDownload()) return
  if (tryFtpDownload()) return
  if (useExisting()) return

  console.error('fetch-petra-prodlist: no download method worked.')
  console.error('Set PETRA_FTP_USER + PETRA_FTP_PASSWORD in GitHub secrets, or place prodlist.csv in Downloads.')
  process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
