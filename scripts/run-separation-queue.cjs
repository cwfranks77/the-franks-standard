const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const rootDir = path.resolve(__dirname, '..')
const queueFile = path.join(rootDir, 'SEPARATION_TASKS.queue')
const logFile = path.join(rootDir, 'SEPARATION_PROGRESS.log')

const TASK_SCRIPTS = {
  'organize-bc-assets-and-public': 'scripts/separation/organize-bc-assets-and-public.cjs',
  'organize-franks-assets-and-public': 'scripts/separation/organize-franks-assets-and-public.cjs',
  'remove-root-bridge-files': 'scripts/separation/remove-root-bridge-files.cjs',
  'cleanup-root-leftovers': 'scripts/separation/cleanup-root-leftovers.cjs',
  'ensure-project-structure': 'scripts/separation/ensure-project-structure.cjs',
  'log-separation-complete': 'scripts/separation/log-separation-complete.cjs',
  'move-franks-middleware-plugins': 'scripts/separation/move-franks-middleware-plugins.cjs',
  'move-franks-assets': 'scripts/separation/move-franks-assets.cjs',
  'move-petra-catalog-to-bc': 'scripts/separation/move-petra-catalog-to-bc.cjs',
  'move-franks-public-images': 'scripts/separation/move-franks-public-images.cjs',
  'write-unsorted-log': 'scripts/separation/write-unsorted-log.cjs',
}

function readQueue () {
  if (!fs.existsSync(queueFile)) {
    console.error('ERROR: No task queue found. Create SEPARATION_TASKS.queue first.')
    process.exit(1)
  }

  return fs.readFileSync(queueFile, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
}

function runOneTask () {
  const queueLines = readQueue()

  if (queueLines.length === 0) {
    console.log('All separation tasks complete.')
    return false
  }

  const nextTask = queueLines[0]
  const scriptRel = TASK_SCRIPTS[nextTask]

  if (!scriptRel) {
    console.error(`ERROR: Unknown task "${nextTask}". Update TASK_SCRIPTS in run-separation-queue.cjs.`)
    process.exit(1)
  }

  const scriptPath = path.join(rootDir, scriptRel)
  if (!fs.existsSync(scriptPath)) {
    console.error(`ERROR: Task script missing: ${scriptRel}`)
    process.exit(1)
  }

  console.log(`Running task: ${nextTask}`)
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: rootDir,
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    console.error(`Task failed: ${nextTask}`)
    process.exit(result.status || 1)
  }

  const stamp = new Date().toISOString()
  fs.appendFileSync(logFile, `${stamp}: Completed -> ${nextTask}\n`, 'utf8')

  const remaining = queueLines.slice(1)
  fs.writeFileSync(queueFile, remaining.length ? `${remaining.join('\n')}\n` : '', 'utf8')

  console.log('Task complete.')
  if (remaining.length) {
    console.log(`Next in queue: ${remaining[0]}`)
  }

  return remaining.length > 0
}

const runAll = process.argv.includes('--all')

if (runAll) {
  while (runOneTask()) {
    console.log('Running next...')
  }
} else {
  runOneTask()
}
