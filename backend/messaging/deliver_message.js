/**
 * Hardened message delivery — dual-write to platform_messages + messages table.
 */

const { sanitizeAndLog } = require('../security/message_sanitize.js')

async function deliverMessage (admin, {
  conversationId,
  senderId,
  receiverId,
  rawContent,
  ipAddress = null,
  deviceFingerprint = null,
  displayName = 'Account holder',
}) {
  const sanitized = await sanitizeAndLog(admin, {
    userId: senderId,
    content: rawContent,
    sourceType: 'message',
    sourceId: conversationId,
    ipAddress,
    deviceFingerprint,
  })

  const { data: platformMsg, error: pmErr } = await admin.from('platform_messages').insert({
    conversation_id: conversationId,
    sender_id: senderId,
    sender_display_name: displayName,
    body: sanitized.sanitized,
    raw_content: rawContent,
    sanitized_content: sanitized.sanitized,
    receiver_id: receiverId,
    ip_address: ipAddress,
    device_fingerprint: deviceFingerprint,
    status: 'sent',
    blocked_pii: sanitized.modified,
    pii_violations: sanitized.stripped,
  }).select('id, created_at').single()

  if (pmErr) return { ok: false, error: pmErr.message }

  await admin.from('messages').insert({
    sender_id: senderId,
    receiver_id: receiverId,
    conversation_id: conversationId,
    content: rawContent,
    sanitized_content: sanitized.sanitized,
    ip_address: ipAddress,
    device_fingerprint: deviceFingerprint,
    platform_message_id: platformMsg.id,
  })

  return {
    ok: true,
    message_id: platformMsg.id,
    created_at: platformMsg.created_at,
    sanitized: sanitized.modified,
  }
}

module.exports = { deliverMessage }
