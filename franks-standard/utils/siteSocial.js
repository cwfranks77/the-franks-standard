/**
 * Public social / follow links — set via NUXT_PUBLIC_SOCIAL_* in .env or GitHub Actions.
 * Empty URLs are omitted from the footer.
 */

export function buildSocialLinks (publicConfig = {}) {
  const items = [
    { id: 'instagram', label: 'Instagram', url: publicConfig.socialInstagram, icon: 'IG' },
    { id: 'facebook', label: 'Facebook', url: publicConfig.socialFacebook, icon: 'FB' },
    { id: 'tiktok', label: 'TikTok', url: publicConfig.socialTiktok, icon: 'TT' },
    { id: 'youtube', label: 'YouTube', url: publicConfig.socialYoutube, icon: 'YT' },
    { id: 'x', label: 'X', url: publicConfig.socialX, icon: 'X' },
    { id: 'linkedin', label: 'LinkedIn', url: publicConfig.socialLinkedin, icon: 'in' },
  ]
  return items
    .map((item) => ({ ...item, url: String(item.url || '').trim() }))
    .filter((item) => item.url.startsWith('http'))
}
