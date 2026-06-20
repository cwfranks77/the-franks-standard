/**
 * Copy marketing/** to public/marketing/ for static owner download URLs.
 */
const fs = require('fs')
const path = require('path')

function copyDir (src, dest) {
  if (!fs.existsSync(src)) return 0
  fs.mkdirSync(dest, { recursive: true })
  let count = 0
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      count += copyDir(s, d)
    } else {
      fs.copyFileSync(s, d)
      count += 1
    }
  }
  return count
}

const root = path.resolve(__dirname, '..')
const srcDir = path.join(root, 'marketing')
const destDir = path.join(root, 'public', 'marketing')

const n = copyDir(srcDir, destDir)
console.log(`sync-marketing-content: copied ${n} file(s) to public/marketing/`)
