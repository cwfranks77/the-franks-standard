/**
 * Copy content/*.md and platform_content_index.json to public/content/
 * for static GitHub Pages fetch (/content/founder_story.md).
 */
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const srcDir = path.join(root, 'content')
const destDir = path.join(root, 'public', 'content')

if (!fs.existsSync(srcDir)) {
  console.warn('sync-platform-content: no content/ directory')
  process.exit(0)
}

fs.mkdirSync(destDir, { recursive: true })

const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.md') || f.endsWith('.json'))
for (const file of files) {
  fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file))
}

console.log(`sync-platform-content: copied ${files.length} file(s) to public/content/`)
