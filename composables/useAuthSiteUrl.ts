const PRODUCTION_SITE = 'https://thefranksstandard.com'

/** URL used in signup / resend email links — never localhost when user is on the live site. */
export function useAuthSiteUrl(): string {
  const config = useRuntimeConfig()
  let site = String(config.public?.siteUrl || '').trim().replace(/\/$/, '')

  if (import.meta.client && typeof window !== 'undefined') {
    const { hostname, protocol, host } = window.location
    if (hostname && !/localhost|127\.0\.0\.1/i.test(hostname)) {
      return `${protocol}//${host}`
    }
  }

  if (!site || /localhost|127\.0\.0\.1/i.test(site)) {
    site = PRODUCTION_SITE
  }
  return site
}
