import { SupabaseClient } from 'npm:@supabase/supabase-js@2'

export type IntegrityHoldProfile = {
  id: string
  integrity_hold_at: string | null
  integrity_hold_reason: string | null
  integrity_hold_expires_at: string | null
  seller_banned_at: string | null
}

export const DEFAULT_HOLD_DAYS = 14
export const INTEGRITY_APPEAL_EMAIL = 'info@thefranksstandard.com'

export function isIntegrityHoldActive (profile: IntegrityHoldProfile | null | undefined): boolean {
  if (!profile?.integrity_hold_at) return false
  if (profile.integrity_hold_expires_at) {
    return new Date(profile.integrity_hold_expires_at) > new Date()
  }
  return true
}

export function integrityHoldMessage (profile: IntegrityHoldProfile & {
  integrity_hold_reason?: string | null
}): string {
  const reason = profile.integrity_hold_reason || 'An authenticity or description concern is under review.'
  const exp = profile.integrity_hold_expires_at
    ? ` Review window ends ${new Date(profile.integrity_hold_expires_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}.`
    : ''
  return (
    `${reason} Your selling and buying activity is paused while we review.${exp} ` +
    `Email ${INTEGRITY_APPEAL_EMAIL} with photos, invoices, inventory notes, or other proof. ` +
    'Intentional misrepresentation may still result in a permanent ban after review.'
  )
}

export async function loadIntegrityHoldState (
  admin: SupabaseClient,
  userId: string,
): Promise<IntegrityHoldProfile | null> {
  const { data } = await admin
    .from('profiles')
    .select('id, integrity_hold_at, integrity_hold_reason, integrity_hold_expires_at, seller_banned_at')
    .eq('id', userId)
    .maybeSingle()
  return data as IntegrityHoldProfile | null
}

export async function assertSellerNotOnIntegrityHold (
  admin: SupabaseClient,
  sellerId: string,
): Promise<{ ok: true } | { ok: false; error: string; message: string }> {
  const profile = await loadIntegrityHoldState(admin, sellerId)
  if (isIntegrityHoldActive(profile)) {
    return {
      ok: false,
      error: 'integrity_hold',
      message: integrityHoldMessage(profile as IntegrityHoldProfile & { integrity_hold_reason?: string }),
    }
  }
  return { ok: true }
}

export async function placeIntegrityHold (
  admin: SupabaseClient,
  params: {
    sellerId: string
    listingId?: string | null
    reason: string
    holdDays?: number
    opsNote?: string | null
    archivePublishedListings?: boolean
  },
): Promise<{ ok: true; expiresAt: string } | { ok: false; error: string }> {
  const now = new Date()
  const days = params.holdDays ?? DEFAULT_HOLD_DAYS
  const expires = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  const expiresAt = expires.toISOString()
  const nowIso = now.toISOString()
  const reasonText = params.reason.trim() || 'Authenticity review — submit evidence to clear your name.'

  const { error: profileErr } = await admin
    .from('profiles')
    .update({
      integrity_hold_at: nowIso,
      integrity_hold_reason: reasonText,
      integrity_hold_listing_id: params.listingId ?? null,
      integrity_hold_expires_at: expiresAt,
    })
    .eq('id', params.sellerId)

  if (profileErr) return { ok: false, error: profileErr.message }

  if (params.archivePublishedListings !== false) {
    await admin
      .from('listings')
      .update({
        status: 'archived',
        integrity_status: 'suspended',
        integrity_scanned_at: nowIso,
      })
      .eq('seller_id', params.sellerId)
      .eq('status', 'published')
  }

  if (params.listingId) {
    await admin
      .from('listings')
      .update({
        status: 'archived',
        integrity_status: 'suspended',
        integrity_scanned_at: nowIso,
      })
      .eq('id', params.listingId)
  }

  await admin.from('integrity_hold_events').insert({
    seller_id: params.sellerId,
    listing_id: params.listingId ?? null,
    event_type: 'hold',
    reason: reasonText,
    expires_at: expiresAt,
    notes: params.opsNote ?? null,
  })

  return { ok: true, expiresAt }
}

export async function liftIntegrityHold (
  admin: SupabaseClient,
  params: {
    sellerId: string
    opsNote?: string | null
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const now = new Date().toISOString()
  const { error } = await admin
    .from('profiles')
    .update({
      integrity_hold_at: null,
      integrity_hold_reason: null,
      integrity_hold_listing_id: null,
      integrity_hold_expires_at: null,
    })
    .eq('id', params.sellerId)

  if (error) return { ok: false, error: error.message }

  await admin.from('integrity_hold_events').insert({
    seller_id: params.sellerId,
    event_type: 'lift',
    notes: params.opsNote ?? 'Hold lifted after review — seller may resume activity.',
  })

  return { ok: true }
}

export async function banSellerAfterIntegrityHold (
  admin: SupabaseClient,
  params: {
    sellerId: string
    banReason?: string | null
    opsNote?: string | null
  },
): Promise<void> {
  const now = new Date().toISOString()
  await admin.from('profiles').update({
    seller_banned_at: now,
    seller_ban_reason: params.banReason ?? 'Authenticity policy violation after review',
    integrity_hold_at: null,
    integrity_hold_reason: null,
    integrity_hold_expires_at: null,
  }).eq('id', params.sellerId)

  await admin.from('integrity_hold_events').insert({
    seller_id: params.sellerId,
    event_type: 'ban_after_hold',
    notes: params.opsNote ?? params.banReason ?? null,
  })

  await admin
    .from('listings')
    .update({ status: 'archived', integrity_status: 'counterfeit_confirmed' })
    .eq('seller_id', params.sellerId)
    .in('status', ['published', 'draft'])
}
