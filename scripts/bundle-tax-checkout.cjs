const fs = require('fs')
const path = require('path')

function readText (p) {
  const buf = fs.readFileSync(p)
  if (buf.length >= 2 && buf[1] === 0) return buf.toString('utf16le')
  return buf.toString('utf8')
}

const root = path.join(__dirname, '..', 'supabase', 'functions')
const sharedStripe = readText(path.join(root, '_shared', 'stripe.ts')).replace(/^import Stripe.*\n/m, '')
const sharedTax = readText(path.join(root, '_shared', 'stripeTax.ts')).replace(/^\/\*[\s\S]*?\*\/\r?\n/, '')

let checkout = readText(path.join(root, 'create-checkout-session', 'index.ts'))
checkout = checkout.replace(/import .* from '\.\.\/_shared\/stripe\.ts'\r?\n/, sharedStripe + '\n')
checkout = checkout.replace(/import .* from '\.\.\/_shared\/stripeTax\.ts'\r?\n/, sharedTax + '\n')
const out1 = path.join(root, 'create-checkout-session', 'index.dashboard.ts')
fs.writeFileSync(out1, checkout, 'utf8')
console.log('checkout', out1, checkout.includes('automatic_tax'))

let platform = readText(path.join(root, 'create-platform-checkout-session', 'index.ts'))
platform = platform.replace(/import .* from '\.\.\/_shared\/stripe\.ts'\r?\n/, sharedStripe + '\n')
platform = platform.replace(/import .* from '\.\.\/_shared\/stripeTax\.ts'\r?\n/, sharedTax + '\n')
const out2 = path.join(root, 'create-platform-checkout-session', 'index.dashboard.ts')
fs.writeFileSync(out2, platform, 'utf8')
console.log('platform', out2)