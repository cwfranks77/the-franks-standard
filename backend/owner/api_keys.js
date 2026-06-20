/**
 * Owner API key management — hashed storage, permission scopes.
 */

const crypto = require('crypto')
const { hashKey, logOwnerAction } = require('./_shared.js')

const KEY_PREFIX = 'tfs_owner_'

function generatePlainKey () {
  return `${KEY_PREFIX}${crypto.randomBytes(24).toString('hex')}`
}

async function createKey (admin, { permissions = ['read'], label = '' } = {}) {
  const plain = generatePlainKey()
  const hashed = hashKey(plain)
  const keyPrefix = plain.slice(0, 16)

  const { data, error } = await admin.from('owner_api_keys').insert({
    key: hashed,
    key_prefix: keyPrefix,
    permissions: Array.isArray(permissions) ? permissions : ['read'],
  }).select('id, key_prefix, permissions, created_at').single()

  if (error) return { ok: false, error: error.message }

  await logOwnerAction(admin, {
    action: 'owner_api_key_created',
    targetType: 'owner_api_key',
    targetId: data.id,
    details: { key_prefix: keyPrefix, permissions },
  })

  return {
    ok: true,
    key: plain,
    key_id: data.id,
    key_prefix: keyPrefix,
    permissions: data.permissions,
    warning: 'Store this key now — it cannot be retrieved again.',
  }
}

async function revokeKey (admin, keyId) {
  const { error } = await admin.from('owner_api_keys').update({ revoked: true }).eq('id', keyId)
  if (error) return { ok: false, error: error.message }
  await logOwnerAction(admin, { action: 'owner_api_key_revoked', targetType: 'owner_api_key', targetId: keyId })
  return { ok: true, revoked: keyId }
}

async function listKeys (admin) {
  const { data, error } = await admin
    .from('owner_api_keys')
    .select('id, key_prefix, permissions, revoked, created_at, last_used_at')
    .order('created_at', { ascending: false })
  if (error) return { ok: false, error: error.message }
  return { ok: true, keys: data ?? [] }
}

async function validateKey (admin, plainKey) {
  if (!plainKey || !String(plainKey).startsWith(KEY_PREFIX)) {
    return { valid: false, error: 'invalid_key_format' }
  }

  const hashed = hashKey(plainKey)
  const { data, error } = await admin
    .from('owner_api_keys')
    .select('id, permissions, revoked')
    .eq('key', hashed)
    .maybeSingle()

  if (error || !data) return { valid: false, error: 'key_not_found' }
  if (data.revoked) return { valid: false, error: 'key_revoked' }

  await admin.from('owner_api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', data.id)

  return { valid: true, key_id: data.id, permissions: data.permissions ?? [] }
}

module.exports = { createKey, revokeKey, listKeys, validateKey, KEY_PREFIX }
