const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const bcSrcDir = path.join(rootDir, 'bc-performance-audio', 'src')

function linkDirectory (linkPath, targetPath, label) {
  if (!fs.existsSync(targetPath)) {
    console.error(`[restore-nuxt-bc-links] Missing ${label} folder:`, targetPath)
    process.exit(1)
  }

  fs.mkdirSync(path.dirname(linkPath), { recursive: true })

  if (fs.existsSync(linkPath)) {
    fs.rmSync(linkPath, { recursive: true, force: true })
  }

  if (process.platform === 'win32') {
    fs.symlinkSync(targetPath, linkPath, 'junction')
  } else {
    const relativeTarget = path.relative(path.dirname(linkPath), targetPath)
    fs.symlinkSync(relativeTarget, linkPath, 'dir')
  }

  console.log(`[restore-nuxt-bc-links] ${label} -> ${path.relative(rootDir, targetPath)}`)
}

function linkFile (linkPath, targetPath, label) {
  if (!fs.existsSync(targetPath)) {
    console.error(`[restore-nuxt-bc-links] Missing ${label} file:`, targetPath)
    process.exit(1)
  }

  fs.mkdirSync(path.dirname(linkPath), { recursive: true })

  if (fs.existsSync(linkPath)) {
    fs.rmSync(linkPath, { force: true })
  }

  if (process.platform === 'win32') {
    try {
      fs.symlinkSync(targetPath, linkPath, 'file')
    } catch {
      fs.linkSync(targetPath, linkPath)
    }
  } else {
    const relativeTarget = path.relative(path.dirname(linkPath), targetPath)
    fs.symlinkSync(relativeTarget, linkPath, 'file')
  }

  console.log(`[restore-nuxt-bc-links] ${label} -> ${path.relative(rootDir, targetPath)}`)
}

linkDirectory(
  path.join(rootDir, 'pages', 'bc-audio'),
  path.join(bcSrcDir, 'pages', 'bc-audio'),
  'pages/bc-audio',
)

const middlewareSourceDir = path.join(bcSrcDir, 'middleware')
if (fs.existsSync(middlewareSourceDir)) {
  for (const entry of fs.readdirSync(middlewareSourceDir, { withFileTypes: true })) {
    if (!entry.isFile()) {
      continue
    }

    linkFile(
      path.join(rootDir, 'middleware', entry.name),
      path.join(middlewareSourceDir, entry.name),
      `middleware/${entry.name}`,
    )
  }
}
