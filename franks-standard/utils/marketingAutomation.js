/**
 * Owner marketing automation — weekly queue generation, local + cloud persistence.
 * Uses existing caption builders; no paid API calls from the browser.
 */

import { buildSocialCaption, REEL_SCRIPT_IDEAS, SITE_URL } from '~/utils/socialPromotion.js'

export const MARKETING_QUEUE_KEY = 'marketingAutomation'
export const LOCAL_QUEUE_KEY = 'franks-marketing-queue-v1'

export const PLATFORM_LINKS = {
  instagram: 'https://www.instagram.com/',
  tiktok: 'https://www.tiktok.com/upload',
  linkedin: 'https://www.linkedin.com/post/new/',
  reddit: 'https://www.reddit.com/submit',
  facebook: 'https://www.facebook.com/',
  search_console: 'https://search.google.com/search-console',
  bing: 'https://www.bing.com/webmasters',
  youtube_studio: 'https://studio.youtube.com/channel/UC/videos/upload?d=ud',
  youtube_channel: 'https://www.youtube.com/',
  google_business: 'https://business.google.com/',
  google_ads: 'https://ads.google.com/',
  pinterest: 'https://www.pinterest.com/pin-creation-tool/',
  indexnow: 'https://www.indexnow.org/documentation',
  lob_postcards: 'https://dashboard.lob.com/register',
  lob_dashboard: 'https://dashboard.lob.com/',
  capcut: 'https://www.capcut.com/',
  canva_video: 'https://www.canva.com/create/videos/',
}

/** Where to register the site so Google, YouTube, and others can find you. */
export const VISIBILITY_DESTINATIONS = [
  {
    id: 'google-search-console',
    label: 'Google Search Console',
    why: 'Tells Google your site exists and lets you request indexing.',
    url: PLATFORM_LINKS.search_console,
    steps: `Add property ${SITE_URL} → verify → Sitemaps → submit ${SITE_URL}/sitemap.xml → URL Inspection → Request indexing for /, /sell, /browse`,
  },
  {
    id: 'bing-webmaster',
    label: 'Bing / Yahoo search',
    why: 'Bing powers Yahoo and Copilot search results.',
    url: PLATFORM_LINKS.bing,
    steps: `Import from Google or add ${SITE_URL} manually → submit same sitemap`,
  },
  {
    id: 'google-business',
    label: 'Google Business Profile',
    why: 'Shows your business on Google Maps and local search.',
    url: PLATFORM_LINKS.google_business,
    steps: 'Create profile for The Franks Standard LLC · add website, phone (877) 837-0527, category Online marketplace',
  },
  {
    id: 'youtube-channel',
    label: 'YouTube channel',
    why: 'Shorts and explainers rank in Google video results.',
    url: PLATFORM_LINKS.youtube_channel,
    steps: 'Create channel → About → link thefranksstandard.com → upload Shorts from AI Video Ad Builder below',
  },
  {
    id: 'google-ads',
    label: 'Google Ads',
    why: 'Paid search when organic ranking is still building.',
    url: PLATFORM_LINKS.google_ads,
    steps: 'Start $10/day search campaign · keywords: authenticated sports cards, COA marketplace, sell collectibles online',
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    why: 'Collectibles and cards photos drive referral traffic.',
    url: PLATFORM_LINKS.pinterest,
    steps: 'Pin listing photos and /learn articles with link back to site',
  },
  {
    id: 'reddit-ads',
    label: 'Reddit Ads',
    why: 'Reach r/sportscards, r/coins, r/EbaySeller communities.',
    url: 'https://ads.reddit.com/',
    steps: 'Traffic campaign · $5/day · link to /sell or /join/founders10',
  },
  {
    id: 'radio-local',
    label: 'Local radio / podcast pitch',
    why: 'Lake Charles / SWLA stations and hobby podcasts accept owner stories.',
    url: 'mailto:info@thefranksstandard.com',
    steps: 'Use the radio pitch copy below → email station program director or podcast host',
  },
]

export const POST_VIDEO_DESTINATIONS = [
  { id: 'youtube', label: 'YouTube Shorts / video', url: PLATFORM_LINKS.youtube_studio },
  { id: 'tiktok', label: 'TikTok', url: PLATFORM_LINKS.tiktok },
  { id: 'instagram', label: 'Instagram Reel', url: PLATFORM_LINKS.instagram },
  { id: 'facebook', label: 'Facebook Page video', url: 'https://www.facebook.com/' },
  { id: 'linkedin', label: 'LinkedIn video', url: PLATFORM_LINKS.linkedin },
]

export const POSTCARD_MAIL_COPY = `THE FRANKS STANDARD — sell where proof is required

SECURITY: COA + escrow · verify COA · enforcement in writing
LOW FEES: 4–5% by plan (3% launch) — not 13%+ stacked
PERKS: FOUNDERS10 · HONOR26 · AI store · eBay import

thefranksstandard.com/sell · (877) 837-0527
Charles Franks · The Franks Standard LLC`

export const RADIO_PITCH_COPY = `Subject: Local marketplace founder — 60-second interview pitch

Hi [Program Director / Host name],

I'm Charles Franks, founder of The Franks Standard — a Louisiana-based online marketplace built so collectible sellers must show proof (COA or signed guarantee) before they list.

I'd love 60 seconds on your show to explain:
• Why buyers keep asking "is this real?" — and what we changed
• Lower seller fees (4–5%) vs stacked marketplace fees
• Free listing for local shops moving inventory online

Phone: (877) 837-0527
Site: thefranksstandard.com

Happy to call in live or send a pre-recorded 30-second clip.

Thank you,
Charles Franks`

/**
 * Builds a ready-to-film 30s ad script + caption + upload links (no paid AI API — copy into CapCut/Canva or record on phone).
 */
const REEL_SCRIPT_IDEES_SAFE = REEL_SCRIPT_IDEAS.map((r) => ({
  ...r,
  topic: r.cta === '/protection' ? 'security' : r.cta === '/how-it-works' ? 'coa' : 'fees',
}))

export const VIDEO_AD_IDEAS = REEL_SCRIPT_IDEES_SAFE

export function buildVideoAdPackage (ideaIndex = 0) {
  const idea = REEL_SCRIPT_IDEES_SAFE[ideaIndex] || REEL_SCRIPT_IDEES_SAFE[0]
  const ctaUrl = `${SITE_URL}${idea.cta.startsWith('/') ? idea.cta : `/${idea.cta}`}`
  const caption = buildSocialCaption({
    platform: 'tiktok',
    format: 'short',
    topic: idea.topic || 'fees',
    ctaPath: idea.cta,
  })

  const script = [
    `[0–3s HOOK — on screen text] ${idea.hook}`,
    `[3–12s — voiceover + B-roll] ${idea.body}`,
    `[12–25s — show site on phone] Escrow checkout · seller proof required · ${SITE_URL}`,
    `[25–30s CTA] Tap link · List free at ${ctaUrl}`,
  ].join('\n')

  const scenes = [
    { sec: '0–3', visual: 'Bold text hook on dark background', audio: idea.hook },
    { sec: '3–12', visual: 'Screen record or stock: marketplace / COA scan', audio: idea.body },
    { sec: '12–25', visual: 'Show phone on thefranksstandard.com/sell', audio: 'Explain proof + escrow in one sentence' },
    { sec: '25–30', visual: 'Logo + URL + phone number', audio: 'Call to action — list free today' },
  ]

  return {
    title: idea.hook.slice(0, 80),
    script,
    scenes,
    caption,
    ctaUrl,
    editTools: [
      { label: 'CapCut (free edit)', url: PLATFORM_LINKS.capcut },
      { label: 'Canva video (free tier)', url: PLATFORM_LINKS.canva_video },
    ],
    postLinks: POST_VIDEO_DESTINATIONS,
  }
}

export const VISIBILITY_PROGRESS_KEY = 'franks-visibility-progress-v1'

export function loadVisibilityProgress () {
  if (!import.meta.client) return {}
  try {
    return JSON.parse(localStorage.getItem(VISIBILITY_PROGRESS_KEY) || '{}')
  } catch {
    return {}
  }
}

export function saveVisibilityProgress (progress) {
  if (!import.meta.client) return
  localStorage.setItem(VISIBILITY_PROGRESS_KEY, JSON.stringify(progress))
}


/** One post per weekday — matches ops/social-promo weekly rhythm. */
export const WEEKLY_SLOTS = [
  {
    slot: 'mon-linkedin',
    dayOffset: 0,
    dayLabel: 'Monday',
    kind: 'social',
    platform: 'linkedin',
    format: 'post',
    topic: 'fees',
    ctaPath: '/compare',
    title: 'LinkedIn — fee math for card shops',
  },
  {
    slot: 'tue-tiktok',
    dayOffset: 1,
    dayLabel: 'Tuesday',
    kind: 'social',
    platform: 'tiktok',
    format: 'short',
    topic: 'security',
    ctaPath: '/protection',
    title: 'TikTok Short — security stack',
  },
  {
    slot: 'wed-instagram',
    dayOffset: 2,
    dayLabel: 'Wednesday',
    kind: 'social',
    platform: 'instagram',
    format: 'reel',
    topic: 'coa',
    ctaPath: '/how-it-works',
    title: 'Instagram Reel — COA and trust',
  },
  {
    slot: 'thu-story',
    dayOffset: 3,
    dayLabel: 'Thursday',
    kind: 'social',
    platform: 'instagram',
    format: 'story',
    topic: 'fees',
    ctaPath: '/learn/tools/fee-calculator',
    title: 'Instagram Story — fee poll',
  },
  {
    slot: 'fri-reddit',
    dayOffset: 4,
    dayLabel: 'Friday',
    kind: 'social',
    platform: 'reddit',
    format: 'education',
    topic: 'security',
    ctaPath: '/social/community',
    title: 'Reddit — educational value post',
  },
  {
    slot: 'mon-email',
    dayOffset: 0,
    dayLabel: 'Monday',
    kind: 'email',
    title: 'Email — seller outreach (permission list only)',
  },
  {
    slot: 'wed-seo',
    dayOffset: 2,
    dayLabel: 'Wednesday',
    kind: 'seo',
    title: 'SEO — request indexing for new pages',
  },
]

const SELLER_EMAIL_BODY = `Hi {{name}},

I built The Franks Standard — an authenticated collectibles marketplace where proof comes before publish.

• Seller COA or signed guarantee on collectible listings
• Sale fees 4–5% by plan (3% launch promo for new sellers)
• Escrow checkout and optional video inspect

List free: {{sellUrl}}
Questions: (877) 837-0527

— Charles Franks
The Franks Standard LLC
{{siteUrl}}

Reply STOP to opt out.`

export function startOfWeek (date = new Date()) {
  const d = new Date(date)
  d.setHours(12, 0, 0, 0)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

export function weekId (date = new Date()) {
  return formatDateIso(startOfWeek(date))
}

export function formatDateIso (date) {
  return date.toISOString().slice(0, 10)
}

function buildEmailBody () {
  return SELLER_EMAIL_BODY
    .replace(/\{\{sellUrl\}\}/g, `${SITE_URL}/sell`)
    .replace(/\{\{siteUrl\}\}/g, SITE_URL)
}

function buildTaskFromSlot (slot, weekStart) {
  const scheduled = new Date(weekStart)
  scheduled.setDate(scheduled.getDate() + slot.dayOffset)
  const scheduledDate = formatDateIso(scheduled)
  const id = `${weekId(weekStart)}-${slot.slot}`

  if (slot.kind === 'email') {
    return {
      id,
      slot: slot.slot,
      kind: 'email',
      dayLabel: slot.dayLabel,
      scheduledDate,
      title: slot.title,
      status: 'pending',
      postedAt: null,
      bodyTemplate: buildEmailBody(),
      notes: 'Only send to shops that gave permission (opt-in, prior relationship, or replied asking for info).',
    }
  }

  if (slot.kind === 'seo') {
    return {
      id,
      slot: slot.slot,
      kind: 'seo',
      dayLabel: slot.dayLabel,
      scheduledDate,
      title: slot.title,
      status: 'pending',
      postedAt: null,
      checklist: [
        `Open Search Console → URL Inspection → Request indexing for ${SITE_URL}/`,
        `Request indexing for ${SITE_URL}/sell and ${SITE_URL}/browse`,
        `Submit sitemap: ${SITE_URL}/sitemap.xml in Google and Bing Webmaster Tools`,
        'From your PC (optional): npm run seo:ping after deploy',
      ],
    }
  }

  const caption = buildSocialCaption({
    platform: slot.platform,
    format: slot.format,
    topic: slot.topic,
    ctaPath: slot.ctaPath,
  })

  const reelHint = REEL_SCRIPT_IDEAS.find((r) =>
    slot.topic === 'security' ? r.cta === '/protection' : slot.topic === 'coa' ? r.cta === '/how-it-works' : r.cta === '/learn/tools/fee-calculator',
  )

  return {
    id,
    slot: slot.slot,
    kind: 'social',
    dayLabel: slot.dayLabel,
    scheduledDate,
    platform: slot.platform,
    format: slot.format,
    topic: slot.topic,
    title: slot.title,
    caption,
    reelHint: reelHint ? `${reelHint.hook} — ${reelHint.body}` : '',
    platformUrl: PLATFORM_LINKS[slot.platform] || SITE_URL,
    status: 'pending',
    postedAt: null,
  }
}

export function generateWeeklyQueue (weekStart = startOfWeek()) {
  const start = startOfWeek(weekStart)
  const tasks = WEEKLY_SLOTS.map((slot) => buildTaskFromSlot(slot, start))
  return {
    version: 1,
    weekId: weekId(start),
    weekStart: formatDateIso(start),
    generatedAt: new Date().toISOString(),
    tasks,
  }
}

export function mergeQueuePreservingProgress (existing, fresh) {
  if (!existing?.tasks?.length) return fresh
  const statusBySlot = Object.fromEntries(
    existing.tasks.map((t) => [t.slot, { status: t.status, postedAt: t.postedAt }]),
  )
  return {
    ...fresh,
    tasks: fresh.tasks.map((t) => {
      const prev = statusBySlot[t.slot]
      if (!prev || prev.status === 'pending') return t
      return { ...t, status: prev.status, postedAt: prev.postedAt }
    }),
  }
}

export function queueStats (queue) {
  const tasks = queue?.tasks || []
  const total = tasks.length
  const posted = tasks.filter((t) => t.status === 'posted').length
  const skipped = tasks.filter((t) => t.status === 'skipped').length
  const pending = tasks.filter((t) => t.status === 'pending').length
  const today = formatDateIso(new Date())
  const dueToday = tasks.filter((t) => t.scheduledDate === today && t.status === 'pending')
  return { total, posted, skipped, pending, dueToday, pct: total ? Math.round((posted / total) * 100) : 0 }
}

export function loadLocalQueue () {
  if (!import.meta.client) return null
  try {
    const raw = localStorage.getItem(LOCAL_QUEUE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveLocalQueue (queue) {
  if (!import.meta.client || !queue) return
  localStorage.setItem(LOCAL_QUEUE_KEY, JSON.stringify(queue))
}

export function buildSellerOutreachMailto ({ name = 'there', email = '' }) {
  const subject = encodeURIComponent('Sell with proof — The Franks Standard')
  const body = buildEmailBody().replace(/\{\{name\}\}/g, name.trim() || 'there')
  const to = email.trim()
  return to ? `mailto:${encodeURIComponent(to)}?subject=${subject}&body=${encodeURIComponent(body)}` : `mailto:?subject=${subject}&body=${encodeURIComponent(body)}`
}

export function allPendingCaptions (queue) {
  return (queue?.tasks || [])
    .filter((t) => t.kind === 'social' && t.status === 'pending')
    .map((t) => `--- ${t.dayLabel} · ${t.title} ---\n${t.caption}`)
    .join('\n\n')
}
