import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { sha256Hex } from './requestContext.ts'
import { logServerActivity } from './platformActivityLog.ts'

export async function recordCoaUpload (
  admin: SupabaseClient,
  params: {
    coaSerial?: string | null
    storagePath: string
    mimeType?: string | null
    fileSizeBytes?: number | null
    fileContentForHash?: string | null
    uploaderId: string
    listingId?: string | null
    certificateId?: string | null
    deviceFingerprint?: string | null
    ipAddress?: string | null
    metadata?: Record<string, unknown>
  },
): Promise<{ ok: true; coaFileId: string; hashSha256: string } | { ok: false; error: string }> {
  const { data: fileRow, error: fileErr } = await admin.from('coa_files').insert({
    coa_serial: params.coaSerial ?? null,
    storage_path: params.storagePath,
    mime_type: params.mimeType ?? null,
    file_size_bytes: params.fileSizeBytes ?? null,
    uploader_id: params.uploaderId,
  }).select('id').single()

  if (fileErr || !fileRow?.id) return { ok: false, error: fileErr?.message ?? 'coa_file_insert_failed' }

  const hashInput = params.fileContentForHash
    ?? `${params.storagePath}::${params.coaSerial ?? ''}::${params.uploaderId}::${Date.now()}`
  const hashSha256 = await sha256Hex(hashInput)

  await admin.from('coa_hashes').insert({
    coa_file_id: fileRow.id,
    hash_sha256: hashSha256,
    algorithm: 'sha256',
  })

  if (params.listingId || params.certificateId) {
    await admin.from('coa_listing_links').insert({
      coa_file_id: fileRow.id,
      listing_id: params.listingId ?? null,
      certificate_id: params.certificateId ?? null,
    })
  }

  await admin.from('coa_evidence_logs').insert({
    coa_file_id: fileRow.id,
    coa_serial: params.coaSerial ?? null,
    event_type: 'coa_uploaded',
    user_id: params.uploaderId,
    listing_id: params.listingId ?? null,
    hash_sha256: hashSha256,
    device_fingerprint: params.deviceFingerprint ?? null,
    ip_address: params.ipAddress ?? null,
    metadata: params.metadata ?? {},
  })

  await logServerActivity(admin, {
    userId: params.uploaderId,
    eventType: 'coa_uploaded',
    actionCategory: 'sell',
    action: 'COA file uploaded',
    metadata: {
      coa_file_id: fileRow.id,
      coa_serial: params.coaSerial,
      listing_id: params.listingId,
      hash_sha256: hashSha256,
    },
    ipAddress: params.ipAddress,
    deviceFingerprint: params.deviceFingerprint,
  })

  return { ok: true, coaFileId: fileRow.id, hashSha256 }
}

export async function recordCoaIssued (
  admin: SupabaseClient,
  params: {
    coaSerial: string
    listingId: string
    certificateId: string
    sellerId: string
    itemFingerprint: string
    deviceFingerprint?: string | null
    ipAddress?: string | null
  },
): Promise<void> {
  const hashSha256 = await sha256Hex(params.itemFingerprint)

  const { data: fileRow } = await admin.from('coa_files').insert({
    coa_serial: params.coaSerial,
    storage_path: `certificate:${params.certificateId}`,
    uploader_id: params.sellerId,
  }).select('id').single()

  if (fileRow?.id) {
    await admin.from('coa_hashes').insert({
      coa_file_id: fileRow.id,
      hash_sha256: hashSha256,
    })
    await admin.from('coa_listing_links').insert({
      coa_file_id: fileRow.id,
      listing_id: params.listingId,
      certificate_id: params.certificateId,
    })
  }

  await admin.from('coa_evidence_logs').insert({
    coa_file_id: fileRow?.id ?? null,
    coa_serial: params.coaSerial,
    event_type: 'coa_issued',
    user_id: params.sellerId,
    listing_id: params.listingId,
    hash_sha256: hashSha256,
    device_fingerprint: params.deviceFingerprint ?? null,
    ip_address: params.ipAddress ?? null,
    metadata: { certificate_id: params.certificateId },
  })
}

export async function fetchCoaChainForUser (
  admin: SupabaseClient,
  userId: string,
): Promise<Record<string, unknown>> {
  const { data: logs } = await admin
    .from('coa_evidence_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(200)

  const { data: files } = await admin
    .from('coa_files')
    .select('*, coa_hashes(hash_sha256), coa_listing_links(listing_id, certificate_id)')
    .eq('uploader_id', userId)
    .limit(100)

  return { evidence_logs: logs ?? [], files: files ?? [] }
}
