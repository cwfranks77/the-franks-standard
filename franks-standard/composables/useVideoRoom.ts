const PREFIX = 'FranksStd'

/**
 * Jitsi Meet room names: letters, numbers, and some punctuation; keep unguessable.
 */
function randomSegment (): string {
  if (import.meta.client && globalThis.crypto?.getRandomValues) {
    const a = new Uint8Array(12)
    globalThis.crypto.getRandomValues(a)
    return Array.from(a, b => b.toString(16).padStart(2, '0')).join('')
  }
  return String(Date.now()) + Math.random().toString(16).slice(2, 10)
}

export function createRoomSlug (): string {
  return `${PREFIX}${randomSegment()}`
}

/**
 * Jitsi public: room must be a single path segment, safe for URL.
 */
export function isValidRoomSlug (s: string): boolean {
  if (!s || s.length < 8 || s.length > 200) { return false }
  return /^FranksStd[a-f0-9]+$/i.test(s)
}

export function jitsiRoomUrl (room: string, displayName?: string): string {
  const u = new URL(`https://meet.jit.si/${encodeURIComponent(room)}`)
  if (displayName?.trim()) {
    u.hash = `userInfo.displayName=${encodeURIComponent(displayName.trim().slice(0, 50))}`
  }
  return u.toString()
}
