#!/usr/bin/env node
/**
 * Test Namecheap Private Email IMAP + SMTP for info@thefranksstandard.com
 *
 * Reads credentials from (first found):
 *   ../franks-standard-credentials/email.env
 *   ./email.env
 *
 *   npm run mail:test
 */
const fs = require('fs')
const path = require('path')
const tls = require('tls')
const net = require('net')

const CRED_PATHS = [
  path.join(__dirname, '..', '..', 'franks-standard-credentials', 'email.env'),
  path.join(__dirname, '..', 'email.env'),
]

function loadEnv () {
  for (const p of CRED_PATHS) {
    if (!fs.existsSync(p)) continue
    const raw = fs.readFileSync(p, 'utf8')
    const out = {}
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([A-Z_]+)=(.*)$/)
      if (m) out[m[1]] = m[2].trim()
    }
    if (out.EMAIL_USER) return { ...out, source: p }
  }
  return null
}

function readLines (socket, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    let buf = ''
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error('Timeout waiting for server response'))
    }, timeoutMs)
    function onData (chunk) {
      buf += chunk.toString()
      if (buf.includes('\r\n')) {
        cleanup()
        resolve(buf)
      }
    }
    function cleanup () {
      clearTimeout(timer)
      socket.off('data', onData)
    }
    socket.on('data', onData)
  })
}

async function expectCode (socket, codePrefix) {
  const text = await readLines(socket)
  if (!text.startsWith(codePrefix)) {
    throw new Error(`Expected ${codePrefix}, got: ${text.split('\r\n')[0]}`)
  }
  return text
}

async function smtpAuth ({ user, pass }) {
  const host = 'mail.privateemail.com'
  const port = 587
  const socket = net.connect(port, host)
  await new Promise((resolve, reject) => {
    socket.once('connect', resolve)
    socket.once('error', reject)
  })
  await expectCode(socket, '220')
  socket.write('EHLO thefranksstandard.com\r\n')
  await expectCode(socket, '250')
  socket.write('STARTTLS\r\n')
  await expectCode(socket, '220')
  const secure = tls.connect({ socket, servername: host })
  await new Promise((resolve, reject) => {
    secure.once('secureConnect', resolve)
    secure.once('error', reject)
  })
  secure.write('EHLO thefranksstandard.com\r\n')
  await expectCode(secure, '250')
  const userB64 = Buffer.from(user).toString('base64')
  const passB64 = Buffer.from(pass).toString('base64')
  secure.write('AUTH LOGIN\r\n')
  await expectCode(secure, '334')
  secure.write(`${userB64}\r\n`)
  await expectCode(secure, '334')
  secure.write(`${passB64}\r\n`)
  await expectCode(secure, '235')
  secure.write('QUIT\r\n')
  secure.end()
  return 'SMTP 587 STARTTLS auth OK'
}

async function imapLogin ({ user, pass }) {
  const host = 'mail.privateemail.com'
  const port = 993
  const socket = tls.connect(port, host, { servername: host })
  await new Promise((resolve, reject) => {
    socket.once('secureConnect', resolve)
    socket.once('error', reject)
  })
  await expectCode(socket, '* OK')
  socket.write(`A1 LOGIN "${user.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}" "${pass.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"\r\n`)
  const resp = await readLines(socket)
  if (!resp.includes('A1 OK')) {
    throw new Error(`IMAP login failed: ${resp.split('\r\n')[0]}`)
  }
  socket.write('A2 LOGOUT\r\n')
  socket.end()
  return 'IMAP 993 SSL login OK'
}

async function main () {
  const env = loadEnv()
  if (!env) {
    console.error('No email.env found. Create franks-standard-credentials/email.env with EMAIL_USER and EMAIL_PASS.')
    process.exit(1)
  }
  const user = env.EMAIL_USER
  const pass = env.EMAIL_PASS
  console.log('Using', env.source)
  console.log('User', user)
  if (!pass) {
    console.error('\nEMAIL_PASS is empty. After Namecheap reset, add your new password to email.env, then run npm run mail:test again.')
    process.exit(1)
  }

  let ok = true
  try {
    console.log('\nTesting IMAP (incoming)...')
    console.log(await imapLogin({ user, pass }))
  } catch (e) {
    ok = false
    console.error('IMAP FAIL:', e.message)
  }

  try {
    console.log('\nTesting SMTP (outgoing)...')
    console.log(await smtpAuth({ user, pass }))
  } catch (e) {
    ok = false
    console.error('SMTP FAIL:', e.message)
  }

  if (ok) {
    console.log('\nMailbox credentials are valid. If Android still prompts, remove the account on the phone and re-add with the settings on /ops/mail-setup')
    process.exit(0)
  }
  console.log('\nFix password in Namecheap Private Email, update email.env, run again.')
  process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
