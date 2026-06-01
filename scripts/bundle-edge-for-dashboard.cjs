const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..', 'supabase', 'functions')
const shared = fs.readFileSync(path.join(root, '_shared', 'stripe.ts'), 'utf8')

function inlineShared (src) {
  const helpers = shared
    .replace(/^import Stripe.*\n/m, '')
    .replace(/^import.*\n/m, '')
  return src
    .replace(/import .* from '\.\.\/_shared\/stripe\.ts'\n/, helpers + '\n')
}

const targets = [
  'create-checkout-session',
  'stripe-connect-onboard',
  'confirm-order-receipt',
]

for (const name of targets) {
  const src = fs.readFileSync(path.join(root, name, 'index.ts'), 'utf8')
  const out = inlineShared(src)
  const outPath = path.join(root, name, 'index.dashboard.ts')
  fs.writeFileSync(outPath, out, 'utf8')
  console.log('wrote', outPath, out.length, 'chars')
}
