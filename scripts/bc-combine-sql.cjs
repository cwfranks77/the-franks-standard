const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const migrationsDir = path.join(rootDir, 'bc-performance-audio', 'supabase', 'migrations')
const outFile = path.join(migrationsDir, '000_run_all_bc_owner.sql')

if (!fs.existsSync(migrationsDir)) {
  console.error('Migrations folder missing')
  process.exit(1)
}

const files = fs.readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql') && f !== '000_run_all_bc_owner.sql')
  .sort()

let combined = '-- B&C Performance Audio — run entire owner setup in Supabase SQL editor\n\n'
for (const file of files) {
  combined += `-- ===== ${file} =====\n`
  combined += fs.readFileSync(path.join(migrationsDir, file), 'utf8')
  combined += '\n\n'
}

fs.writeFileSync(outFile, combined)
console.log(`[bc-combine-sql] wrote ${outFile} (${files.length} migrations)`)
