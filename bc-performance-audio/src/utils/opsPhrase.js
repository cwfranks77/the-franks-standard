/** Normalize owner unlock phrase (same rules as server hash). */
export function normalizeOpsPhrase (phrase) {
  return String(phrase || '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}
