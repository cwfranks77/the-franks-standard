const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const logPath = path.join(rootDir, 'UNSORTED_FILES.log')
const lines = ['Unsorted items:']

const scanRoots = ['pages', 'components', 'layouts', 'utils', 'composables', 'server', 'middleware', 'plugins']

for (const root of scanRoots) {
  const fullRoot = path.join(rootDir, root)
  if (!fs.existsSync(fullRoot)) {
    continue
  }

  for (const entry of fs.readdirSync(fullRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() && !entry.isFile()) {
      continue
    }

    const name = entry.name
    if (name === 'franks-standard' || name === 'bc-audio') {
      continue
    }

    if ((root === 'middleware' || root === 'plugins') && /bc/i.test(name)) {
      continue
    }

    lines.push(`./${root}/${name}`)
  }
}

fs.writeFileSync(logPath, `${lines.join('\n')}\n`, 'utf8')
console.log(`[unsorted-log] wrote ${lines.length - 1} entries to UNSORTED_FILES.log`)
