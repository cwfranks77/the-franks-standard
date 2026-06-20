const fs = require('node:fs')
const path = require('node:path')

function walk (dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (entry.name.endsWith('.ts')) {
      const before = fs.readFileSync(full, 'utf8')
      const after = before.replace(/require\('\.\.(\/\.\.)*\/backend\//g, "require('#backend/")
      if (after !== before) {
        fs.writeFileSync(full, after)
        console.log('updated', full)
      }
    }
  }
}

walk(path.join(__dirname, '..', 'server'))
