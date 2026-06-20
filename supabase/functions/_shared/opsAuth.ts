/** Verify ops toolkit key (same normalization as utils/opsPhrase.ts). */

export function normalizeOpsPhrase (input: string): string {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, '-')
}

async function sha256Hex (input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyOpsKey (provided: string): Promise<boolean> {
  const plain = Deno.env.get('OPS_ACCESS_KEY') ?? Deno.env.get('NUXT_PUBLIC_OPS_ACCESS_KEY') ?? ''
  const expectedHash = (
    Deno.env.get('OPS_ACCESS_KEY_HASH')
    ?? Deno.env.get('NUXT_PUBLIC_OPS_ACCESS_KEY_HASH')
    ?? ''
  ).trim().toLowerCase()

  if (plain) {
    return normalizeOpsPhrase(provided) === normalizeOpsPhrase(plain)
  }
  if (!expectedHash) return false
  const typed = await sha256Hex(normalizeOpsPhrase(provided))
  return typed === expectedHash
}
