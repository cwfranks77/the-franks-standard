import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { logServerActivity } from './platformActivityLog.ts'

export function formatCopyToken (serial: string, copyNumber: number) {
  const base = String(serial || '').trim().toUpperCase()
  return `COPY-${base}-${String(copyNumber).padStart(4, '0')}`
}

export async function recordCoaPrintCopy (
  admin: SupabaseClient,
  params: {
    certificateId: string
    serialNumber: string
    issuedToUserId: string
    listingId?: string | null
    copyType: 'original_issue' | 'view' | 'print' | 'download'
    deviceFingerprint?: string | null
    ipAddress?: string | null
    metadata?: Record<string, unknown>
  },
): Promise<{ ok: true; copyNumber: number; copyToken: string; copyId: string } | { ok: false; error: string }> {
  const { data: last } = await admin
    .from('coa_print_copies')
    .select('copy_number')
    .eq('certificate_id', params.certificateId)
    .order('copy_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const copyNumber = (last?.copy_number ?? 0) + 1
  const copyToken = formatCopyToken(params.serialNumber, copyNumber)

  const { data: row, error } = await admin
    .from('coa_print_copies')
    .insert({
      certificate_id: params.certificateId,
      serial_number: params.serialNumber,
      copy_number: copyNumber,
      copy_token: copyToken,
      issued_to_user_id: params.issuedToUserId,
      listing_id: params.listingId ?? null,
      copy_type: params.copyType,
      device_fingerprint: params.deviceFingerprint ?? null,
      ip_address: params.ipAddress ?? null,
      metadata: params.metadata ?? {},
    })
    .select('id, copy_number, copy_token')
    .single()

  if (error || !row) return { ok: false, error: error?.message ?? 'copy_insert_failed' }

  await admin.from('coa_evidence_logs').insert({
    coa_serial: params.serialNumber,
    event_type: 'coa_copy_issued',
    user_id: params.issuedToUserId,
    listing_id: params.listingId ?? null,
    device_fingerprint: params.deviceFingerprint ?? null,
    ip_address: params.ipAddress ?? null,
    metadata: {
      certificate_id: params.certificateId,
      copy_number: row.copy_number,
      copy_token: row.copy_token,
      copy_type: params.copyType,
      ...(params.metadata ?? {}),
    },
  })

  await logServerActivity(admin, {
    userId: params.issuedToUserId,
    eventType: 'coa_copy_issued',
    actionCategory: 'sell',
    action: `COA registry copy #${row.copy_number} issued`,
    metadata: {
      certificate_id: params.certificateId,
      serial_number: params.serialNumber,
      copy_token: row.copy_token,
      copy_type: params.copyType,
      listing_id: params.listingId,
    },
    ipAddress: params.ipAddress,
    deviceFingerprint: params.deviceFingerprint,
  })

  return { ok: true, copyNumber: row.copy_number, copyToken: row.copy_token, copyId: row.id }
}

export async function verifyCoaCopyToken (
  admin: SupabaseClient,
  copyToken: string,
) {
  const token = String(copyToken || '').trim().toUpperCase()
  if (!token.startsWith('COPY-')) return null

  const { data } = await admin
    .from('coa_print_copies')
    .select('id, copy_number, copy_token, copy_type, serial_number, certificate_id, listing_id, issued_to_user_id, created_at')
    .eq('copy_token', token)
    .maybeSingle()

  return data
}
