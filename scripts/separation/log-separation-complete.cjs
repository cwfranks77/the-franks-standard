const fs = require('node:fs')
const path = require('node:path')

const logFile = path.join(path.resolve(__dirname, '..', '..'), 'SEPARATION_PROGRESS.log')
fs.appendFileSync(logFile, `${new Date().toISOString()}: SEPARATION COMPLETE\n`, 'utf8')
console.log('[log-separation-complete] wrote SEPARATION COMPLETE to SEPARATION_PROGRESS.log')
