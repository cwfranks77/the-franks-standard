import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const PACKET_DIR = path.join(process.cwd(), 'tfs/system/dealer-packet')

function logPacket (action, detail) {
  const logFile = path.join(process.cwd(), 'tfs/logs/dealer-packet.log')
  const line = `[${new Date().toISOString()}] [system] PACKET: ${action} DETAIL: ${detail}\n`
  fs.mkdirSync(path.dirname(logFile), { recursive: true })
  fs.appendFileSync(logFile, line, 'utf8')
}

/** Escape text for a minimal PDF stream */
function escapePdfText (text) {
  return String(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

/**
 * Convert markdown/plain text to a simple single-page PDF (text layout).
 * @param {string} markdown
 * @param {string} outPath
 */
export function markdownToPdf (markdown, outPath) {
  const lines = String(markdown || '').split(/\r?\n/).slice(0, 80)
  const contentLines = ['BT', '/F1 10 Tf', '50 750 Td', '14 TL']
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].slice(0, 90) || ' '
    if (i === 0) contentLines.push(`(${escapePdfText(line)}) Tj`)
    else contentLines.push('T*', `(${escapePdfText(line)}) Tj`)
  }
  contentLines.push('ET')
  const stream = contentLines.join('\n')
  const streamLen = Buffer.byteLength(stream, 'utf8')

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'))
    pdf += obj
  }
  const xrefStart = Buffer.byteLength(pdf, 'utf8')
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`

  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, pdf)
  logPacket('pdf-export', path.basename(outPath))
  return outPath
}

/**
 * Bundle files into a ZIP archive.
 * @param {string[]} filePaths absolute paths
 * @param {string} zipPath
 */
export function bundleToZip (filePaths, zipPath) {
  const existing = filePaths.filter((p) => fs.existsSync(p))
  if (!existing.length) {
    throw new Error('No files to zip')
  }

  fs.mkdirSync(path.dirname(zipPath), { recursive: true })
  const tempDir = path.join(PACKET_DIR, '.zip-staging')
  fs.rmSync(tempDir, { recursive: true, force: true })
  fs.mkdirSync(tempDir, { recursive: true })

  for (const src of existing) {
    const name = path.basename(src)
    fs.copyFileSync(src, path.join(tempDir, name))
  }

  if (process.platform === 'win32') {
    const psZip = zipPath.replace(/'/g, "''")
    const psSrc = tempDir.replace(/'/g, "''")
    execFileSync('powershell', [
      '-NoProfile', '-Command',
      `Compress-Archive -Path '${psSrc}\\*' -DestinationPath '${psZip}' -Force`,
    ], { stdio: 'pipe' })
  } else {
    execFileSync('zip', ['-j', zipPath, ...existing.map((p) => path.basename(p))], { cwd: tempDir })
  }

  fs.rmSync(tempDir, { recursive: true, force: true })
  logPacket('zip-export', path.basename(zipPath))
  return zipPath
}

export default { markdownToPdf, bundleToZip }
