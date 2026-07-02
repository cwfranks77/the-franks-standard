/** Normalize owner unlock phrase (same rules as opsPhrase.ts and Supabase opsAuth). */
export function normalizeOpsPhrase (phrase) {
  return String(phrase || '')
    .trim()
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, '-')
}
