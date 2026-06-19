const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const targetDir = path.join(rootDir, 'components')
const sourceDirs = [
  path.join(rootDir, 'bc-performance-audio', 'src', 'components'),
  path.join(rootDir, 'franks-standard', 'src', 'components'),
  path.join(rootDir, 'root-build-components'),
]

function copyDir (sourceDir, destDir) {
  if (!fs.existsSync(sourceDir)) return
  fs.mkdirSync(destDir, { recursive: true })
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name)
    const targetPath = path.join(destDir, entry.name)
    if (entry.isDirectory()) {
      copyDir(sourcePath, targetPath)
      continue
    }
    if (entry.isFile()) {
      fs.copyFileSync(sourcePath, targetPath)
    }
  }
}

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true })
}

for (const sourceDir of sourceDirs) {
  copyDir(sourceDir, targetDir)
}

console.log('[merge-project-components] synced components to', targetDir)
