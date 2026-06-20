import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

const THRESHOLDS = { loginFreeze: 5, captcha: 10, accountFreeze: 20 }
const LOGIN_FREEZE_MS = 10 * 60 * 1000
const ACCOUNT_FREEZE_MS = 24 * 60 * 60 * 1000

async function logSecurityEvent (
  admin: SupabaseClient,
  row: Record<string, unknown>,
) {
  await admin.from('security_events').insert({
    user_id: row.userId ?? null,
    event_type: row.eventType,
    severity: row.severity ?? 'warning',
    ip_address: row.ipAddress ?? null,
    device_fingerprint: row.deviceFingerprint ?? null,
    details: row.details ?? {},
  })
}

export async function recordLoginAttempt (
  admin: SupabaseClient,
  params: {
    identifier: string
    userId?: string | null
    success?: boolean
    ipAddress?: string | null
    deviceFingerprint?: string | null
  },
) {
  const idKey = String(params.identifier || params.userId || params.ipAddress || 'unknown').toLowerCase().trim()
  const now = new Date()

  if (params.success) {
    await admin.from('login_attempt_state').upsert({
      identifier: idKey,
      failed_count: 0,
      login_frozen_until: null,
      captcha_required: false,
      account_frozen_until: null,
      last_attempt_at: now.toISOString(),
      updated_at: now.toISOString(),
    }, { onConflict: 'identifier' })
    return { ok: true as const, allowed: true }
  }

  const { data: state } = await admin.from('login_attempt_state').select('*').eq('identifier', idKey).maybeSingle()
  const failedCount = (state?.failed_count ?? 0) + 1
  let loginFrozenUntil = state?.login_frozen_until ?? null
  let captchaRequired = state?.captcha_required ?? false

  if (failedCount >= THRESHOLDS.accountFreeze) {
    captchaRequired = true
    if (params.userId) {
      await admin.from('profiles').update({
        safety_frozen_at: new Date(now.getTime() + ACCOUNT_FREEZE_MS).toISOString(),
        safety_freeze_reason: 'Brute-force login protection (20 failed attempts)',
        frozen: true,
      }).eq('id', params.userId)
    }
    await logSecurityEvent(admin, {
      userId: params.userId,
      eventType: 'brute_force_account_freeze',
      severity: 'critical',
      ipAddress: params.ipAddress,
      deviceFingerprint: params.deviceFingerprint,
      details: { failed_count: failedCount },
    })
  } else if (failedCount >= THRESHOLDS.captcha) {
    captchaRequired = true
  } else if (failedCount >= THRESHOLDS.loginFreeze) {
    loginFrozenUntil = new Date(now.getTime() + LOGIN_FREEZE_MS).toISOString()
  }

  await admin.from('login_attempt_state').upsert({
    identifier: idKey,
    failed_count: failedCount,
    login_frozen_until: loginFrozenUntil,
    captcha_required: captchaRequired,
    last_attempt_at: now.toISOString(),
    updated_at: now.toISOString(),
  }, { onConflict: 'identifier' })

  if (loginFrozenUntil && new Date(loginFrozenUntil) > now) {
    return {
      ok: false as const,
      allowed: false,
      error: 'login_temporarily_frozen',
      captcha_required: captchaRequired,
      frozen_until: loginFrozenUntil,
      failed_count: failedCount,
    }
  }

  return { ok: true as const, allowed: true, captcha_required: captchaRequired, failed_count: failedCount }
}

export async function assertLoginAllowed (admin: SupabaseClient, identifier: string) {
  const idKey = String(identifier).toLowerCase().trim()
  const { data: state } = await admin.from('login_attempt_state').select('*').eq('identifier', idKey).maybeSingle()
  if (!state) return { ok: true as const, allowed: true }

  const now = new Date()
  if (state.login_frozen_until && new Date(state.login_frozen_until) > now) {
    return {
      ok: false as const,
      allowed: false,
      error: 'login_temporarily_frozen',
      frozen_until: state.login_frozen_until,
      captcha_required: state.captcha_required,
    }
  }
  return { ok: true as const, allowed: true, captcha_required: state.captcha_required }
}
