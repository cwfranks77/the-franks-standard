const fs = require('node:fs')
const path = require('node:path')

const importLine = "import { backendRequire as require } from '#cjs-require'\n"

function walk (dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (entry.name.endsWith('.ts') && full.includes(`${path.sep}server${path.sep}`)) {
      if (full.endsWith(`${path.sep}cjsRequire.ts`)) continue
      let content = fs.readFileSync(full, 'utf8')
      if (!content.includes("require('#backend/") && !content.includes('require("#backend/')) continue
      if (content.includes("from '#cjs-require'")) {
        content = content.replace(
          /import \{ createRequire \} from 'node:module'\r?\n/g,
          '',
        )
        content = content.replace(
          /const require = createRequire\(import\.meta\.url\)\r?\n/g,
          '',
        )
      } else {
        content = content.replace(
          /import \{ createRequire \} from 'node:module'\r?\n/g,
          importLine,
        )
        content = content.replace(
          /const require = createRequire\(import\.meta\.url\)\r?\n/g,
          '',
        )
        if (!content.includes("from '#cjs-require'")) {
          content = importLine + content
        }
      }
      fs.writeFileSync(full, content)
      console.log('updated', full)
    }
  }
}

walk(path.join(__dirname, '..', 'server'))
