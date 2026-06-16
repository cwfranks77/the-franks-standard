import { scanOffPlatformContent } from '~/utils/offPlatformGuard'

export type PlatformMessageInput = {
  conversationId: string
  senderId: string
  senderDisplayName: string
  body: string
}

export type PlatformMessageResult =
  | { ok: true; status: 'sent'; body: string }
  | { ok: false; status: 'blocked'; violations: { id: string; label: string }[]; message: string }

export function validatePlatformMessage (body: string): PlatformMessageResult {
  const text = String(body || '').trim()
  if (!text) {
    return {
      ok: false,
      status: 'blocked',
      violations: [{ id: 'empty', label: 'Message cannot be empty' }],
      message: 'Type a message before sending.',
    }
  }
  const scan = scanOffPlatformContent(text)
  if (!scan.ok) {
    return {
      ok: false,
      status: 'blocked',
      violations: scan.violations,
      message:
        'This message was blocked. Personal emails, phone numbers, payment apps, and off-platform contact are not allowed. Use checkout and on-site messaging only.',
    }
  }
  return { ok: true, status: 'sent', body: text }
}

export const MESSAGING_POLICY =
  'All buyer–seller communication must stay on The Franks Standard. Do not share email, phone, social handles, or payment details in messages.'
