/** Retry fetch for Supabase client (same behavior as @nuxtjs/supabase). */
export async function fetchWithRetry (req, init) {
  const retries = 3
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetch(req, init)
    } catch (error) {
      if (init?.signal?.aborted) throw error
      if (attempt === retries) {
        const { headers: _headers, ...safeInit } = init ?? {}
        console.error(`Error fetching request ${req}`, error, safeInit)
        throw error
      }
      console.warn(`Retrying fetch attempt ${attempt + 1} for request: ${req}`)
      await new Promise((resolve) => setTimeout(resolve, 100 * attempt))
    }
  }
  throw new Error('Unreachable code')
}
