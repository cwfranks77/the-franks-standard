#!/usr/bin/env node
/** One-off: verify Unsplash showcase URLs return 200 (avoid burst 404s). */
const https = require('https')

const CANDIDATES = {
  cards: [
    '1715279239396-51e741734462',
    '1749909902676-911cf0c30fc0',
    '1551306683-9e7cf1661af1',
    '155551306667-f32e7af055f2',
  ],
  coins: [
    '1621414550520-6a5bdfd2f778',
    '1610375353800-c6ae7e8c3d60',
    '1613483349444-517e294a0c4f',
    '1590283609335-0e4b0a8b8b8b',
    '1639762681485-074b7f938ba0',
  ],
  watches: [
    '1523275335684-37898b6baf30',
    '1524592261724-efebdfc12d76',
    '1522311297919-494321159fac',
  ],
  sneakers: ['1542291026-7eec264c27ff', '1606107557195-0a29cbf1fae2'],
  guitars: [
    '1516924962500-2b4b54b6feb6',
    '1511372494520-9d126a329166',
    '1510915361894-7eb943a9623d',
  ],
  art: [
    '1578301978018-4d0a2b657ca7',
    '1579783902375-49c39a46a1b5',
    '1541961017774-22349e4a1262',
  ],
  camera: [
    '1516035069371-29a1b244cc32',
    '1510125535011-86d1a685f914',
    '1516035069371-29a1b244cc32',
  ],
  vintage: [
    '1550745165-9bc0b252726f',
    '1593305849622-26c27ee41639',
    '1550745165-9bc0b252726f',
  ],
  estate: [
    '1582719478250-c89cae4dc85b',
    '1560448204-eabf0f6d0c22',
    '1586023493165-75a0c7d3562e',
  ],
  comics: [
    '1612036781343-3365e05e6e42',
    '1612036781343-3365e05e6e42',
    '1593508519319-0e4b0a8b8b8b',
  ],
}

function head (photoId) {
  const url = `https://images.unsplash.com/photo-${photoId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`
  return new Promise((resolve) => {
    const req = https.request(
      url,
      { method: 'HEAD', headers: { 'User-Agent': 'TFS-showcase-verify/1.0' } },
      (res) => resolve(res.statusCode),
    )
    req.on('error', () => resolve(0))
    req.end()
  })
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

;(async () => {
  const picked = {}
  for (const [cat, ids] of Object.entries(CANDIDATES)) {
    for (const id of ids) {
      const code = await head(id)
      await sleep(400)
      if (code === 200) {
        picked[cat] = id
        break
      }
    }
    if (!picked[cat]) console.log('MISS', cat)
  }
  console.log(JSON.stringify(picked, null, 2))
})()
