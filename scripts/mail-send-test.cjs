#!/usr/bin/env node
/**
 * Send a test email via SMTP from one mailbox to one or more recipients.
 * Usage: node scripts/mail-send-test.cjs <cred.env> <to1,to2,...>
 */
const fs = require('fs')
const path = require('path')
const tls = require('tls')
const net = require('net')

const credFile = process.argv[2]
const toList = (process.argv[3] || '').split(',').map((s) => s.trim()).filter(Boolean)
if (!credFile || toList.length === 0) {
  console.error('Usage: node scripts/mail-send-test.cjs <cred.env> to@a.com,to@b.com')
  process.exit(1)
}

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
        resolve(buf.split('\r\n')[0])
      }
    })
  })
}

async function expect (sock, code) {
  const line = await readLine(sock)
  if (!line.startsWith(code)) throw new Error(`Expected ${code}, got: ${line}`)
  return line
}

async function main () {
  const env = parseEnv(fs.readFileSync(credFile, 'utf8'))
  const from = env.EMAIL_USER
  const pass = env.EMAIL_PASS
  const host = 'mail.privateemail.com'
  const port = 587
  const stamp = new Date().toISOString()
  const subject = `Franks delivery test ${stamp}`
  const body =
    `Automated delivery test from ${from}\r\n` +
    `Time: ${stamp}\r\n` +
    `If you see this in INBOX, SMTP delivery to Namecheap works.\r\n`

  const socket = net.connect(port, host)
  await new Promise((r, j) => {
    socket.once('connect', r)
    socket.once('error', j)
  })
  await expect(socket, '220')
  socket.write('EHLO thefranksstandard.com\r\n')
  await expect(socket, '250')
  socket.write('STARTTLS\r\n')
  await expect(socket, '220')
  const secure = tls.connect({ socket, servername: host })
  await new Promise((r, j) => {
    secure.once('secureConnect', r)
    secure.once('error', j)
  })
  secure.write('EHLO thefranksstandard.com\r\n')
  await expect(secure, '250')
  secure.write('AUTH LOGIN\r\n')
  await expect(secure, '334')
  secure.write(`${Buffer.from(from).toString('base64')}\r\n`)
  await expect(secure, '334')
  secure.write(`${Buffer.from(pass).toString('base64')}\r\n`)
  await expect(secure, '235')

  for (const to of toList) {
    secure.write(`MAIL FROM:<${from}>\r\n`)
    await expect(secure, '250')
    secure.write(`RCPT TO:<${to}>\r\n`)
    await expect(secure, '250')
    secure.write('DATA\r\n')
    await expect(secure, '354')
    const msg =
      `From: ${from}\r\n` +
      `To: ${to}\r\n` +
      `Subject: ${subject}\r\n` +
      `Date: ${new Date().toUTCString()}\r\n` +
      `Content-Type: text/plain; charset=utf-8\r\n` +
      `\r\n` +
      body +
      `\r\n.\r\n`
    secure.write(msg)
    await expect(secure, '250')
    console.log(`SENT OK: ${from} -> ${to}`)
  }
  secure.write('QUIT\r\n')
  secure.end()
}

main().catch((e) => {
  console.error('SEND FAIL:', e.message)
  process.exit(1)
})
