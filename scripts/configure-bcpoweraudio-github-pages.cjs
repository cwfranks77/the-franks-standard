/**
 * After every B&C deploy: keep GitHub Pages custom domain and CNAME file identical.
 * Mismatch blocks the HTTPS certificate (this caused the security warnings).
 */
const https = require('node:https')
const fs = require('node:fs')
const path = require('node:path')

const REPO = 'cwfranks77/bcpoweraudio'
const DOMAIN = 'www.bcpoweraudio.com'
const TOKEN = process.env.BC_DEPLOY_PAT || process.env.GH_TOKEN || process.env.GITHUB_TOKEN

if (!TOKEN) {
  console.error('configure-bcpoweraudio-github-pages: missing BC_DEPLOY_PAT')
  process.exit(1)
}

const cnamePath = path.join(__dirname, '..', '.output', 'public', 'CNAME')
const cnameFromBuild = fs.existsSync(cnamePath)
  ? fs.readFileSync(cnamePath, 'utf8').trim()
  : DOMAIN
if (cnameFromBuild !== DOMAIN) {
  console.error(`configure-bcpoweraudio-github-pages: CNAME file is "${cnameFromBuild}" but must be "${DOMAIN}"`)
  process.exit(1)
}

function gh (method, apiPath, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${REPO}${apiPath}`,
      method,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'bcpoweraudio-pages-config',
        ...(payload
          ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
          : {}),
      },
    }, (res) => {
      let data = ''
      res.on('data', (c) => { data += c })
      res.on('end', () => {
        const parsed = data ? JSON.parse(data) : {}
        if (res.statusCode >= 400) {
          const err = new Error(parsed.message || `GitHub API ${res.statusCode}`)
          err.status = res.statusCode
          reject(err)
        } else {
          resolve(parsed)
        }
      })
    })
    req.on('error', reject)
    if (payload) req.write(payload)
    req.end()
  })
}

function sleep (ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main () {
  const pagesBody = {
    build_type: 'legacy',
    cname: DOMAIN,
    source: { branch: 'gh-pages', path: '/' },
  }

  console.log(`configure-bcpoweraudio-github-pages: align custom domain → ${DOMAIN}`)
  await gh('PUT', '/pages', pagesBody)

  for (let attempt = 1; attempt <= 20; attempt++) {
    const status = await gh('GET', '/pages')
    const cert = status.https_certificate
    console.log(`configure-bcpoweraudio-github-pages: cert state=${cert?.state || 'unknown'} enforced=${status.https_enforced}`)

    if (cert?.state === 'approved' || cert?.state === 'valid') {
      try {
        await gh('PUT', '/pages', { ...pagesBody, https_enforced: true })
        console.log('configure-bcpoweraudio-github-pages: Enforce HTTPS ON')
        return
      } catch (err) {
        console.log(`configure-bcpoweraudio-github-pages: enforce wait — ${err.message}`)
      }
    }

    if (attempt === 20) {
      console.log('configure-bcpoweraudio-github-pages: cert still issuing — GitHub finishes in up to 24h')
      return
    }
    await sleep(15000)
  }
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
