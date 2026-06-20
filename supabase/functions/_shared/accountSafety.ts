import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { notificationTriggers } from './notifications.ts'

export type SafetyProfile = {
  id: string
  account_frozen_at?: string | null
  seller_debt_status?: string | null
  seller_debt_paid_at?: string | null
  seller_banned_at?: string | null
  safety_frozen_at?: string | null
  messaging_frozen_until?: string | null
  platform_banned_at?: string | null
  requires_phone_verification?: boolean | null
  phone_verified_at?: string | null
}

export function isDebtFrozen (profile: SafetyProfile | null | undefined): boolean {
  if (!profile?.account_frozen_at) return false
  if (profile.seller_debt_paid_at) return false
  return profile.seller_debt_status === 'pending'
}

export function isAccountFrozen (profile: SafetyProfile | null | undefined): boolean {
  if (!profile) return false
  if (profile.platform_banned_at || profile.seller_banned_at) return true
  if (profile.safety_frozen_at) return true
  if (isDebtFrozen(profile)) return true
  return false
}

export function isMessagingFrozen (profile: SafetyProfile | null | undefined): boolean {
  if (!profile) return true
  if (isAccountFrozen(profile)) return true
  if (!profile.messaging_frozen_until) return false
  return new Date(profile.messaging_frozen_until) > new Date()
}

export async function loadSafetyProfile (
  admin: SupabaseClient,
  userId: string,
): Promise<SafetyProfile | null> {
  const { data } = await admin
    .from('profiles')
    .select(`
      id, account_frozen_at, seller_debt_status, seller_debt_paid_at, seller_banned_at,
      safety_frozen_at, messaging_frozen_until, platform_banned_at,
      requires_phone_verification, phone_verified_at
    `)
    .eq('id', userId)
    .maybeSingle()
  return data as SafetyProfile | null
}

export async function freezeAccount (
  admin: SupabaseClient,
  userId: string,
  reason: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const now = new Date().toISOString()
  const { error } = await admin.from('profiles').update({
    safety_frozen_at: now,
    safety_freeze_reason: reason.slice(0, 2000),
    frozen: true,
  }).eq('id', userId)
  if (error) return { ok: false, error: error.message }
  await logBanAudit(admin, { userId, reason, bannedBy: 'system', action: 'freeze_account' })
  await notificationTriggers.accountFreeze(admin, { userId, reason }).catch((e) => console.error('freeze notification', e))
  return { ok: true }
}

export async function unfreezeAccount (
  admin: SupabaseClient,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await admin.from('profiles').update({
    safety_frozen_at: null,
    safety_freeze_reason: null,
    messaging_frozen_until: null,
  }).eq('id', userId)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function freezeMessaging72h (
  admin: SupabaseClient,
  userId: string,
  reason: string,
): Promise<{ ok: true; until: string } | { ok: false; error: string }> {
  const until = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
  const { error } = await admin.from('profiles').update({
    messaging_frozen_until: until,
    safety_freeze_reason: reason.slice(0, 2000),
  }).eq('id', userId)
  if (error) return { ok: false, error: error.message }
  return { ok: true, until }
}

export async function banUser (
  admin: SupabaseClient,
  userId: string,
  reason: string,
  bannedBy = 'system',
): Promise<{ ok: true } | { ok: false; error: string }> {
  const now = new Date().toISOString()
  const { error } = await admin.from('profiles').update({
    platform_banned_at: now,
    platform_ban_reason: reason.slice(0, 2000),
    seller_banned_at: now,
    seller_ban_reason: reason.slice(0, 2000),
    safety_frozen_at: now,
    safety_freeze_reason: reason.slice(0, 2000),
  }).eq('id', userId)
  if (error) return { ok: false, error: error.message }

  await admin.from('listings').update({
    status: 'archived',
    integrity_status: 'suspended',
  }).eq('seller_id', userId).eq('status', 'published')

  await logBanAudit(admin, { userId, reason, bannedBy, action: 'ban_user' })
  await notificationTriggers.accountBan(admin, { userId, reason }).catch((e) => console.error('ban notification', e))
  return { ok: true }
}

export async function banDevice (
  admin: SupabaseClient,
  deviceFingerprint: string,
  reason: string,
  userId?: string | null,
  bannedBy = 'system',
): Promise<void> {
  const fp = String(deviceFingerprint || '').trim()
  if (!fp) return
  await admin.from('banned_devices').upsert({
    device_fingerprint: fp,
    user_id: userId ?? null,
    reason: reason.slice(0, 2000),
    banned_at: new Date().toISOString(),
    banned_by: bannedBy,
  }, { onConflict: 'device_fingerprint' })
}

export async function banIp (
  admin: SupabaseClient,
  ipAddress: string,
  reason: string,
  opts: { fraudFlag?: boolean; userId?: string | null; bannedBy?: string } = {},
): Promise<void> {
  const ip = String(ipAddress || '').trim()
  if (!ip || ip === 'unknown') return
  await admin.from('banned_ips').upsert({
    ip_address: ip,
    user_id: opts.userId ?? null,
    reason: reason.slice(0, 2000),
    fraud_flag: opts.fraudFlag ?? false,
    banned_at: new Date().toISOString(),
    banned_by: opts.bannedBy ?? 'system',
  }, { onConflict: 'ip_address' })
}

export async function banBrowserFingerprint (
  admin: SupabaseClient,
  browserFingerprint: string,
  reason: string,
  userId?: string | null,
): Promise<void> {
  const fp = String(browserFingerprint || '').trim()
  if (!fp) return
  await admin.from('banned_browser_fingerprints').upsert({
    browser_fingerprint: fp,
    user_id: userId ?? null,
    reason: reason.slice(0, 2000),
    banned_at: new Date().toISOString(),
  }, { onConflict: 'browser_fingerprint' })
}

export type BanCheckInput = {
  userId?: string | null
  deviceFingerprint?: string | null
  browserFingerprint?: string | null
  ipAddress?: string | null
}

export async function isBanned (
  admin: SupabaseClient,
  input: BanCheckInput,
): Promise<{ banned: boolean; reason?: string; source?: string }> {
  if (input.userId) {
    const profile = await loadSafetyProfile(admin, input.userId)
    if (profile?.platform_banned_at || profile?.seller_banned_at) {
      return { banned: true, reason: 'account_banned', source: 'profile' }
    }
  }

  const fp = String(input.deviceFingerprint || '').trim()
  if (fp) {
    const { data } = await admin.from('banned_devices').select('reason').eq('device_fingerprint', fp).maybeSingle()
    if (data) return { banned: true, reason: data.reason || 'device_banned', source: 'device' }
  }

  const bpf = String(input.browserFingerprint || '').trim()
  if (bpf) {
    const { data } = await admin.from('banned_browser_fingerprints').select('reason').eq('browser_fingerprint', bpf).maybeSingle()
    if (data) return { banned: true, reason: data.reason || 'browser_banned', source: 'browser' }
  }

  const ip = String(input.ipAddress || '').trim()
  if (ip && ip !== 'unknown') {
    const { data } = await admin.from('banned_ips').select('reason, fraud_flag').eq('ip_address', ip).maybeSingle()
    if (data) return { banned: true, reason: data.reason || 'ip_banned', source: 'ip' }
  }

  return { banned: false }
}

export async function assertAccountNotFrozenForActivity (
  admin: SupabaseClient,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string; message: string }> {
  const ban = await isBanned(admin, { userId })
  if (ban.banned) {
    return { ok: false, error: 'account_banned', message: 'This account is permanently banned from The Franks Standard.' }
  }
  const profile = await loadSafetyProfile(admin, userId)
  if (isAccountFrozen(profile)) {
    return {
      ok: false,
      error: 'account_frozen',
      message: profile?.safety_freeze_reason || 'This account is frozen and cannot complete this action.',
    }
  }
  if (profile?.requires_phone_verification && !profile.phone_verified_at) {
    return {
      ok: false,
      error: 'phone_verification_required',
      message: 'Phone verification is required before using this feature.',
    }
  }
  return { ok: true }
}

async function logBanAudit (
  admin: SupabaseClient,
  row: { userId: string; reason: string; bannedBy: string; action: string },
) {
  try {
    await admin.from('audit_logs').insert({
      actor_type: 'ops',
      actor_id: row.bannedBy,
      action: row.action,
      target_type: 'profile',
      target_id: row.userId,
      details: { reason: row.reason },
    })
  } catch { /* non-fatal */ }
}
