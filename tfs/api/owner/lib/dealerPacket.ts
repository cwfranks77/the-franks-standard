import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { H3Event } from 'h3'
import { requireTfsOwnerAuth } from './auth'
import { logDealerPacket } from './log'

const PACKET_DIR = resolve(process.cwd(), 'tfs/system/dealer-packet')

async function loadBuilder () {
  const href = pathToFileURL(resolve(process.cwd(), 'tfs/system/dealer-packet/builder.js')).href
  return import(href)
}

async function loadExport () {
  const href = pathToFileURL(resolve(process.cwd(), 'tfs/system/utils/packet-export.js')).href
  return import(href)
}

export async function handleDealerPacketBuild (event: H3Event) {
  const owner = requireTfsOwnerAuth(event)
  logDealerPacket(owner, 'build-request', 'UI')
  const { buildDealerPacket } = await loadBuilder()
  const result = await buildDealerPacket({ owner })
  logDealerPacket(owner, 'build-complete', result.lastUpdated)
  return result
}

export async function handleDealerPacketExportPdf (event: H3Event) {
  const owner = requireTfsOwnerAuth(event)
  const mdPath = resolve(PACKET_DIR, 'Dealer_Packet.md')
  const pdfPath = resolve(PACKET_DIR, 'Dealer_Packet.pdf')
  if (!existsSync(mdPath)) {
    throw createError({ statusCode: 404, statusMessage: 'Run Build Packet first' })
  }
  const { markdownToPdf } = await loadExport()
  const { readFileSync } = await import('node:fs')
  markdownToPdf(readFileSync(mdPath, 'utf8'), pdfPath)
  logDealerPacket(owner, 'export-pdf', 'Dealer_Packet.pdf')
  return { ok: true, path: 'tfs/system/dealer-packet/Dealer_Packet.pdf' }
}

export async function handleDealerPacketExportZip (event: H3Event) {
  const owner = requireTfsOwnerAuth(event)
  const mdPath = resolve(PACKET_DIR, 'Dealer_Packet.md')
  const pdfPath = resolve(PACKET_DIR, 'Dealer_Packet.pdf')
  const indexPath = resolve(PACKET_DIR, 'index.json')
  const zipPath = resolve(PACKET_DIR, 'Dealer_Packet.zip')
  if (!existsSync(mdPath)) {
    throw createError({ statusCode: 404, statusMessage: 'Run Build Packet first' })
  }
  const { bundleToZip } = await loadExport()
  const sources = [mdPath, pdfPath, indexPath].filter(existsSync)
  bundleToZip(sources, zipPath)
  logDealerPacket(owner, 'export-zip', 'Dealer_Packet.zip')
  return { ok: true, path: 'tfs/system/dealer-packet/Dealer_Packet.zip' }
}

export function handleDealerPacketFolder (event: H3Event) {
  const owner = requireTfsOwnerAuth(event)
  logDealerPacket(owner, 'open-folder', PACKET_DIR)
  return {
    ok: true,
    folder: 'tfs/system/dealer-packet',
    absolute: PACKET_DIR,
    hint: 'Open this folder in the file manager or on your computer when running locally.',
  }
}

export async function handleSystemValidate (event: H3Event) {
  requireTfsOwnerAuth(event)
  const config = useRuntimeConfig(event)
  const siteUrl = String(config.public?.siteUrl || 'http://localhost:3000').replace(/\/$/, '')
  const href = pathToFileURL(resolve(process.cwd(), 'tfs/system/utils/validator.js')).href
  const { runValidation } = await import(href)
  return runValidation({ apiBase: siteUrl.includes('localhost') ? 'http://localhost:3000' : siteUrl })
}
