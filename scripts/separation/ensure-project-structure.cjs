const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..', '..')
const folders = ['pages', 'components', 'layouts', 'composables', 'utils', 'server', 'assets']

for (const project of ['franks-standard', 'bc-performance-audio']) {
  for (const folder of folders) {
    const dir = path.join(rootDir, project, 'src', folder)
    fs.mkdirSync(dir, { recursive: true })
  }
}

console.log('[ensure-project-structure] franks-standard/src and bc-performance-audio/src folders ready')
