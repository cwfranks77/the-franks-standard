/**
 * Brute-force login protection.
 * 5 fails → 10 min login freeze | 10 fails → CAPTCHA flag | 20 fails → 24h account freeze
 */

const THRESHOLDS = {
  loginFreeze: 5,
  captcha: 10,
  accountFreeze: 20,
}

const LOGIN_FREEZE_MS = 10 * 60 * 1000
const ACCOUNT_FREEZE_MS = 24 * 60 * 60 * 1000

async function logSecurityEvent (admin, row) {
  if (!admin) return
  await admin.from('security_events').insert({
    user_id: row.userId ?? null,
    event_type: row.eventType,
    severity: row.severity ?? 'warning',
    ip_address: row.ipAddress ?? null,
    device_fingerprint: row.deviceFingerprint ?? null,
    details: row.details ?? {},
  })
}

async function recordLoginAttempt (admin, {
  identifier,
  userId = null,
  success = false,
  ipAddress = null,
  deviceFingerprint = null,
}) {
  const idKey = String(identifier || userId || ipAddress || 'unknown').toLowerCase().trim()
  const now = new Date()

  if (success) {
    if (admin) {
      await admin.from('login_attempt_state').upsert({
        identifier: idKey,
        failed_count: 0,
        login_frozen_until: null,
        captcha_required: false,
        account_frozen_until: null,
        last_attempt_at: now.toISOString(),
        updated_at: now.toISOString(),
      }, { onConflict: 'identifier' })
    }
    return { ok: true, allowed: true }
  }

  const { data: state } = admin
    ? await admin.from('login_attempt_state').select('*').eq('identifier', idKey).maybeSingle()
    : { data: null }

  const failedCount = (state?.failed_count ?? 0) + 1
  let loginFrozenUntil = state?.login_frozen_until ?? null
  let captchaRequired = state?.captcha_required ?? false
  let accountFrozenUntil = state?.account_frozen_until ?? null

  const { logFailedLogin, logSuspiciousActivity } = require('../activity/activity_recorder.js')
  await logFailedLogin(userId ?? null, admin).catch(() => {})

  if (failedCount >= THRESHOLDS.captcha) {
    await logSuspiciousActivity(userId ?? idKey, 'multiple failed logins', {
      failed_count: failedCount,
      ip_address: ipAddress,
    }, admin).catch(() => {})
  }

  if (failedCount >= THRESHOLDS.accountFreeze) {
    accountFrozenUntil = new Date(now.getTime() + ACCOUNT_FREEZE_MS).toISOString()
    captchaRequired = true
    if (userId && admin) {
      await admin.from('profiles').update({
        safety_frozen_at: accountFrozenUntil,
        safety_freeze_reason: 'Brute-force login protection (20 failed attempts)',
        frozen: true,
      }).eq('id', userId)
    }
    await logSecurityEvent(admin, {
      userId,
      eventType: 'brute_force_account_freeze',
      severity: 'critical',
      ipAddress,
      deviceFingerprint,
      details: { failed_count: failedCount, identifier: idKey },
    })
  } else if (failedCount >= THRESHOLDS.captcha) {
    captchaRequired = true
    await logSecurityEvent(admin, {
      userId,
      eventType: 'brute_force_captcha_required',
      severity: 'warning',
      ipAddress,
      deviceFingerprint,
      details: { failed_count: failedCount },
    })
  } else if (failedCount >= THRESHOLDS.loginFreeze) {
    loginFrozenUntil = new Date(now.getTime() + LOGIN_FREEZE_MS).toISOString()
    await logSecurityEvent(admin, {
      userId,
      eventType: 'brute_force_login_freeze',
      severity: 'warning',
      ipAddress,
      deviceFingerprint,
      details: { failed_count: failedCount, frozen_until: loginFrozenUntil },
    })
  }

  if (admin) {
    await admin.from('login_attempt_state').upsert({
      identifier: idKey,
      failed_count: failedCount,
      login_frozen_until: loginFrozenUntil,
      captcha_required: captchaRequired,
      account_frozen_until: accountFrozenUntil,
      last_attempt_at: now.toISOString(),
      updated_at: now.toISOString(),
    }, { onConflict: 'identifier' })
  }

  if (loginFrozenUntil && new Date(loginFrozenUntil) > now) {
    return {
      ok: false,
      allowed: false,
      error: 'login_temporarily_frozen',
      captcha_required: captchaRequired,
      frozen_until: loginFrozenUntil,
      failed_count: failedCount,
    }
  }

  return {
    ok: true,
    allowed: true,
    captcha_required: captchaRequired,
    failed_count: failedCount,
  }
}

async function assertLoginAllowed (admin, identifier) {
  const idKey = String(identifier).toLowerCase().trim()
  const { data: state } = admin
    ? await admin.from('login_attempt_state').select('*').eq('identifier', idKey).maybeSingle()
    : { data: null }

  if (!state) return { ok: true, allowed: true }

  const now = new Date()
  if (state.login_frozen_until && new Date(state.login_frozen_until) > now) {
    return {
      ok: false,
      allowed: false,
      error: 'login_temporarily_frozen',
      frozen_until: state.login_frozen_until,
      captcha_required: state.captcha_required,
    }
  }

  return {
    ok: true,
    allowed: true,
    captcha_required: state.captcha_required,
    failed_count: state.failed_count,
  }
}

function getBruteForceStatus () {
  return { enabled: true, thresholds: THRESHOLDS }
}

module.exports = { recordLoginAttempt, assertLoginAllowed, getBruteForceStatus, THRESHOLDS }
