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
