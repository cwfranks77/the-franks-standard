const fs = require('fs')
const path = require('path')

function readText (p) {
  const buf = fs.readFileSync(p)
  if (buf.length >= 2 && buf[0] === 0xFF && buf[1] === 0xFE) {
    return buf.toString('utf16le').slice(1)
  }
  if (buf.length >= 2 && buf[1] === 0 && buf[0] < 128) {
    return buf.toString('utf16le')
  }
  return buf.toString('utf8')
}

const root = path.join(__dirname, '..', 'supabase', 'functions')
const shared = readText(path.join(root, '_shared', 'stripe.ts'))
let src = readText(path.join(root, 'create-checkout-session', 'index.ts'))
const helpers = shared
  .replace(/^import Stripe.*\n/m, '')
  .replace(/^import.*\n/m, '')
const out = src.replace(/import .* from '\.\.\/_shared\/stripe\.ts'\n/, helpers + '\n')
const dashPath = path.join(root, 'create-checkout-session', 'index.dashboard.ts')
fs.writeFileSync(dashPath, out, 'utf8')
console.log('charity', out.includes('isCharitySale'), 'wrote', dashPath)
