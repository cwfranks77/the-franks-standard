#!/usr/bin/env node
/**
 * List recent INBOX messages via IMAP for a mailbox cred file.
 * Usage: node scripts/mail-inbox-check.cjs [path-to-email.env]
 */
const fs = require('fs')
const path = require('path')
const tls = require('tls')

const credFile =
  process.argv[2] ||
  path.join(
    process.env.USERPROFILE,
    'OneDrive',
    'Documents',
    'franks-standard-credentials',
    'email.env',
  )

function parseEnv (raw) {
  const out = {}
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/)
    if (m) out[m[1]] = m[2].trim()
  }
  return out
}

function readLine (sock) {
  return new Promise((resolve, reject) => {
    let buf = ''
    const t = setTimeout(() => reject(new Error('timeout')), 20000)
    sock.on('data', (c) => {
      buf += c.toString()
      if (buf.includes('\r\n')) {
        clearTimeout(t)
        resolve(buf)
      }
    })
  })
}

async function cmd (sock, tag, line) {
  sock.write(`${tag} ${line}\r\n`)
  let buf = ''
  while (true) {
    const chunk = await readLine(sock)
    buf += chunk
    if (chunk.includes(`${tag} OK`) || chunk.includes(`${tag} NO`) || chunk.includes(`${tag} BAD`)) {
      break
    }
  }
  return buf
}

async function main () {
  const env = parseEnv(fs.readFileSync(credFile, 'utf8'))
  const user = env.EMAIL_USER
  const pass = env.EMAIL_PASS
  if (!user || !pass) {
    console.error('Missing EMAIL_USER or EMAIL_PASS in', credFile)
    process.exit(1)
  }

  const host = 'mail.privateemail.com'
  const sock = tls.connect(993, host, { servername: host })
  await new Promise((r, j) => {
    sock.once('secureConnect', r)
    sock.once('error', j)
  })
  await readLine(sock)
  const esc = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  await cmd(sock, 'A1', `LOGIN "${esc(user)}" "${esc(pass)}"`)
  await cmd(sock, 'A2', 'SELECT INBOX')
  const search = await cmd(sock, 'A3', 'SEARCH ALL')
  const ids = [...search.matchAll(/\* SEARCH ([\d\s]*)/g)]
    .map((m) => m[1].trim().split(/\s+/).filter(Boolean))
    .flat()
  const recent = ids.slice(-8)
  console.log(`\n${user} — INBOX message count (SEARCH ALL): ${ids.length}`)
  if (recent.length === 0) {
    console.log('  (no messages in INBOX)')
  } else {
    for (const id of recent) {
      const fetch = await cmd(sock, `F${id}`, `FETCH ${id} (BODY.PEEK[HEADER.FIELDS (FROM SUBJECT DATE)])`)
      const from = (fetch.match(/From: ([^\r\n]+)/i) || [])[1] || '?'
      const subj = (fetch.match(/Subject: ([^\r\n]+)/i) || [])[1] || '(no subject)'
      const date = (fetch.match(/Date: ([^\r\n]+)/i) || [])[1] || ''
      console.log(`  #${id} ${date.trim()} | ${from.trim()} | ${subj.trim()}`)
    }
  }
  await cmd(sock, 'A9', 'LOGOUT')
  sock.end()
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
