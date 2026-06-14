const { spawnSync } = require('node:child_process')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..', '..')
spawnSync(process.execPath, [path.join(rootDir, 'scripts', 'write-unsorted-nuxt-log.cjs')], {
  cwd: rootDir,
  stdio: 'inherit',
})
