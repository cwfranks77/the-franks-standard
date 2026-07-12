/**
 * B&C Performance Audio — owner marketing automation (bcpoweraudio.com only).
 */
import { BC_BRAND } from '~/utils/bcBrand.js'
import { BC_AD_LOGO } from '~/utils/bcSocialAdImages.js'

export const BC_SITE_URL = 'https://www.bcpoweraudio.com'
export const BC_MARKETING_QUEUE_KEY = 'bcMarketingAutomation'
export const BC_LOCAL_QUEUE_KEY = 'bc-marketing-queue-v1'
export const BC_VISIBILITY_PROGRESS_KEY = 'bc-visibility-progress-v1'

export const BC_PLATFORM_LINKS = {
  youtube_studio: 'https://studio.youtube.com/channel/UC/videos/upload?d=ud',
  tiktok: 'https://www.tiktok.com/upload',
  instagram: 'https://www.instagram.com/',
  linkedin: 'https://www.linkedin.com/post/new/',
  search_console: 'https://search.google.com/search-console',
  bing: 'https://www.bing.com/webmasters',
  google_business: 'https://business.google.com/',
  google_ads: 'https://ads.google.com/',
  lob_postcards: 'https://dashboard.lob.com/register',
  lob_dashboard: 'https://dashboard.lob.com/',
  capcut: 'https://www.capcut.com/',
  canva_video: 'https://www.canva.com/create/videos/',
  stripe_dashboard: 'https://dashboard.stripe.com/',
  stripe_payouts: 'https://dashboard.stripe.com/payouts',
  mercury_dashboard: 'https://app.mercury.com/',
}

export const BC_VIDEO_AD_IDEAS = [
  {
    hook: 'Competition-grade bass without the markup games',
    body: 'Screen record bcpoweraudio.com catalog — subwoofers, amps, staging gear dropship to your door.',
    cta: '/bc-audio/catalog',
    topic: 'catalog',
  },
  {
    hook: 'Wholesale audio pricing — authorized distribution',
    body: 'Show department filter: home, car, marine, Bluetooth. MSRP visible. Checkout on site.',
    cta: '/',
    topic: 'wholesale',
  },
  {
    hook: 'Open Door policy — talk to the owner',
    body: 'Walk through /bc-audio/open-door — toll-free support, real fulfillment.',
    cta: '/bc-audio/open-door',
    topic: 'support',
  },
  {
    hook: 'Before you buy speakers online…',
    body: 'Compare authorized SKUs vs gray market. Petra fulfillment. Louisiana-based dealer.',
    cta: '/bc-audio/catalog',
    topic: 'trust',
  },
]

export const BC_VISIBILITY_DESTINATIONS = [
  {
    id: 'google-search-console',
    label: 'Google Search Console',
    why: 'Get bcpoweraudio.com indexed in Google search.',
    url: BC_PLATFORM_LINKS.search_console,
    steps: `Add ${BC_SITE_URL} → verify → submit sitemap ${BC_SITE_URL}/sitemap.xml → request indexing for / and /bc-audio/catalog`,
  },
  {
    id: 'bing-webmaster',
    label: 'Bing Webmaster Tools',
    why: 'Bing and Yahoo search visibility.',
    url: BC_PLATFORM_LINKS.bing,
    steps: 'Import from Google or add site manually → submit same sitemap',
  },
  {
    id: 'google-business',
    label: 'Google Business Profile',
    why: 'Local and brand search for B&C Performance Audio LLC.',
    url: BC_PLATFORM_LINKS.google_business,
    steps: 'List B&C Performance Audio · website bcpoweraudio.com · phone (833) 722-4147',
  },
  {
    id: 'youtube-channel',
    label: 'YouTube channel',
    why: 'Shorts demo product installs and catalog walkthroughs.',
    url: 'https://www.youtube.com/',
    steps: 'Create channel → link bcpoweraudio.com → upload Shorts from AI Video Ad Builder below',
  },
  {
    id: 'google-ads',
    label: 'Google Ads',
    why: 'Paid search for car audio, subwoofers, marine speakers.',
    url: BC_PLATFORM_LINKS.google_ads,
    steps: 'Keywords: competition subwoofer, car audio wholesale, marine amplifier — link to catalog',
  },
  {
    id: 'instagram-reels',
    label: 'Instagram Reels',
    why: 'Car audio enthusiasts and install shops scroll Reels daily.',
    url: BC_PLATFORM_LINKS.instagram,
    steps: 'Post Reels with catalog link · use caption from weekly queue',
  },
  {
    id: 'radio-local',
    label: 'Local radio / car audio podcast',
    why: 'SWLA stations and install podcasts need short dealer spots.',
    url: 'mailto:bc-audio@thefranksstandard.com',
    steps: 'Copy radio pitch below → email program director',
  },
]

export const BC_WEEKLY_SLOTS = [
  { slot: 'mon-linkedin', dayOffset: 0, dayLabel: 'Monday', kind: 'social', platform: 'linkedin', title: 'LinkedIn — authorized dealer post' },
  { slot: 'tue-tiktok', dayOffset: 1, dayLabel: 'Tuesday', kind: 'social', platform: 'tiktok', title: 'TikTok — bass demo Short' },
  { slot: 'wed-instagram', dayOffset: 2, dayLabel: 'Wednesday', kind: 'social', platform: 'instagram', title: 'Instagram Reel — catalog walkthrough' },
  { slot: 'fri-youtube', dayOffset: 4, dayLabel: 'Friday', kind: 'social', platform: 'youtube', title: 'YouTube Short — product highlight' },
  { slot: 'mon-email', dayOffset: 0, dayLabel: 'Monday', kind: 'email', title: 'Email — install shop outreach' },
  { slot: 'wed-seo', dayOffset: 2, dayLabel: 'Wednesday', kind: 'seo', title: 'SEO — request indexing' },
]

const BC_SOCIAL_CAPTIONS = {
  linkedin: `${BC_BRAND.full} — authorized wholesale distribution for competition-grade audio.

Home · car · marine · Bluetooth — browse the live catalog, MSRP shown, dropship fulfillment.

${BC_SITE_URL}/bc-audio/catalog

#caraudio #subwoofer #marineaudio #competitionaudio`,
  tiktok: `POV: you found authorized competition audio without the runaround 🔊

${BC_BRAND.full} — subwoofers, amps, staging. Ships to your door.

${BC_SITE_URL}

#caraudio #bass #competitionaudio #subwoofer`,
  instagram: `Competition-grade sound — authorized dealer network 🏁

Browse departments → checkout on ${BC_SITE_URL.replace('https://', '')}

#BCPerformanceAudio #CarAudio #Subwoofer #MarineAudio #CompetitionGrade`,
  youtube: `Title: ${BC_BRAND.full} — Competition Audio Catalog Tour

Description: Authorized wholesale portal for subwoofers, amplifiers, marine and car audio. Browse ${BC_SITE_URL}

Tags: car audio, subwoofer, competition bass, B&C Performance Audio`,
}

const BC_DEALER_EMAIL = `Hi {{name}},

I'm with ${BC_BRAND.full} — authorized wholesale distribution for competition-grade subwoofers, amplifiers, and staging gear.

• Live catalog with MSRP and dropship checkout
• Home, car, marine, and Bluetooth departments
• Open-door owner support: (833) 722-4147

Browse: ${BC_SITE_URL}/bc-audio/catalog

— B&C Performance Audio LLC
${BC_SITE_URL}

Reply STOP to opt out.`

export const BC_POSTCARD_COPY = `${BC_BRAND.full.toUpperCase()}
AUTHORIZED COMPETITION AUDIO

Subwoofers · Amps · Marine · Car · Bluetooth
Browse catalog · Dropship checkout

${BC_SITE_URL}
(833) 722-4147`

export const BC_RADIO_PITCH = `Subject: 60-second spot — local competition audio dealer

Hi [Program Director],

${BC_BRAND.full} is a Louisiana authorized distribution portal for competition subwoofers, amplifiers, and car/marine audio — with real checkout at bcpoweraudio.com.

I'd love a 60-second live read or pre-recorded spot for your listeners who install or upgrade car audio.

Phone: (833) 722-4147
Site: ${BC_SITE_URL}

Thank you,
B&C Performance Audio LLC`

/** Owner social ads page — copy + image previews for bcpoweraudio.com campaigns. */
export const BC_SOCIAL_AD_CREATIVES = [
  {
    platform: 'X (Twitter) — profile + pin',
    icon: '𝕏',
    format: 'Profile: 400×400 · Header: 1500×500 · Post image: 1200×675',
    image: 'img/bc-logo-primary.png',
    imageSrc: BC_AD_LOGO,
    tip: 'Pin a catalog tweet with the B&C logo — keep Franks Standard branding off this account.',
    text: `DISPLAY NAME: B&C Performance Audio
BIO: Competition-grade car, marine & home audio — authorized wholesale · ${BC_SITE_URL}
SUPPORT: (833) 722-4147 · bc-audio@thefranksstandard.com

PIN POST:
Authorized competition audio — subwoofers, amps, staging gear.
Browse the live catalog with MSRP + dropship checkout.

${BC_SITE_URL}/bc-audio/catalog`,
  },
  {
    platform: 'Instagram / Facebook',
    icon: '📸',
    format: 'Square 1080×1080 (feed) · Vertical 1080×1920 (Reels)',
    image: 'img/bc-logo-primary.png on dark background',
    imageSrc: BC_AD_LOGO,
    tip: 'Link in bio → bcpoweraudio.com · use Reels for catalog screen recordings.',
    text: `${BC_BRAND.full} 🔊

Competition subwoofers · amps · marine audio
Authorized dealer · dropship checkout
Open Door support: (833) 722-4147

Shop: ${BC_SITE_URL}

#caraudio #subwoofer #competitionaudio #marineaudio #BCPerformanceAudio`,
  },
  {
    platform: 'TikTok / YouTube Shorts',
    icon: '🎬',
    format: 'Vertical 9:16 · 15–45 seconds',
    image: 'Screen record bcpoweraudio.com catalog + B&C logo end card',
    imageSrc: BC_AD_LOGO,
    tip: 'Use the Video ad builder in Marketing automation for scene-by-scene script.',
    text: `HOOK: POV you found authorized competition bass without the runaround
BODY: Screen record Car Audio + Marine rows on ${BC_SITE_URL}
CTA: B&C Performance Audio · (833) 722-4147 · link in bio`,
  },
  {
    platform: 'Google Ads — search',
    icon: '🔍',
    format: 'Responsive search ad · 3 headlines · 2 descriptions',
    image: 'img/bc-logo-primary.png (optional image extension)',
    imageSrc: BC_AD_LOGO,
    tip: 'Keywords: competition subwoofer, car audio wholesale, marine amplifier Louisiana',
    text: `Headlines:
Authorized Competition Audio | B&C Performance Audio | Car & Marine Catalog

Descriptions:
Browse subwoofers, amps & staging gear with MSRP shown. Dropship checkout at ${BC_SITE_URL}.
Louisiana dealer · Open Door owner support (833) 722-4147.`,
  },
]

const BC_SOCIAL_IMAGE_BY_PLATFORM = {
  linkedin: BC_AD_LOGO,
  tiktok: BC_AD_LOGO,
  instagram: BC_AD_LOGO,
  youtube: BC_AD_LOGO,
}

export const BC_POST_VIDEO_DESTINATIONS = [
  { id: 'youtube', label: 'YouTube Studio', url: BC_PLATFORM_LINKS.youtube_studio },
  { id: 'tiktok', label: 'TikTok', url: BC_PLATFORM_LINKS.tiktok },
  { id: 'instagram', label: 'Instagram', url: BC_PLATFORM_LINKS.instagram },
]

export function startOfWeek (date = new Date()) {
  const d = new Date(date)
  d.setHours(12, 0, 0, 0)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

export function formatDateIso (date) {
  return date.toISOString().slice(0, 10)
}

export function bcWeekId (date = new Date()) {
  return formatDateIso(startOfWeek(date))
}

function buildBcCaption (platform) {
  return BC_SOCIAL_CAPTIONS[platform] || BC_SOCIAL_CAPTIONS.instagram
}

function buildTaskFromSlot (slot, weekStart) {
  const scheduled = new Date(weekStart)
  scheduled.setDate(scheduled.getDate() + slot.dayOffset)
  const scheduledDate = formatDateIso(scheduled)
  const id = `${bcWeekId(weekStart)}-${slot.slot}`

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
      bodyTemplate: BC_DEALER_EMAIL,
      notes: 'Only email shops/installers who gave permission to contact them.',
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
        `Search Console → request indexing for ${BC_SITE_URL}/`,
        `Request indexing for ${BC_SITE_URL}/bc-audio/catalog`,
        `Submit sitemap ${BC_SITE_URL}/sitemap.xml`,
      ],
    }
  }

  return {
    id,
    slot: slot.slot,
    kind: 'social',
    dayLabel: slot.dayLabel,
    scheduledDate,
    platform: slot.platform,
    title: slot.title,
    caption: buildBcCaption(slot.platform),
    imageSrc: BC_SOCIAL_IMAGE_BY_PLATFORM[slot.platform] || BC_AD_LOGO,
    imageNote: 'img/bc-logo-primary.png',
    platformUrl: BC_PLATFORM_LINKS[slot.platform] || BC_PLATFORM_LINKS.instagram,
    status: 'pending',
    postedAt: null,
  }
}

export function generateBcWeeklyQueue (weekStart = startOfWeek()) {
  const start = startOfWeek(weekStart)
  return {
    version: 1,
    weekId: bcWeekId(start),
    weekStart: formatDateIso(start),
    generatedAt: new Date().toISOString(),
    brand: BC_BRAND.full,
    tasks: BC_WEEKLY_SLOTS.map((slot) => buildTaskFromSlot(slot, start)),
  }
}

export function mergeBcQueuePreservingProgress (existing, fresh) {
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

export function bcQueueStats (queue) {
  const tasks = queue?.tasks || []
  const total = tasks.length
  const posted = tasks.filter((t) => t.status === 'posted').length
  const skipped = tasks.filter((t) => t.status === 'skipped').length
  const pending = tasks.filter((t) => t.status === 'pending').length
  const today = formatDateIso(new Date())
  const dueToday = tasks.filter((t) => t.scheduledDate === today && t.status === 'pending')
  return { total, posted, skipped, pending, dueToday, pct: total ? Math.round((posted / total) * 100) : 0 }
}

export function loadBcLocalQueue () {
  if (!import.meta.client) return null
  try {
    return JSON.parse(localStorage.getItem(BC_LOCAL_QUEUE_KEY) || 'null')
  } catch {
    return null
  }
}

export function saveBcLocalQueue (queue) {
  if (!import.meta.client || !queue) return
  localStorage.setItem(BC_LOCAL_QUEUE_KEY, JSON.stringify(queue))
}

export function loadBcVisibilityProgress () {
  if (!import.meta.client) return {}
  try {
    return JSON.parse(localStorage.getItem(BC_VISIBILITY_PROGRESS_KEY) || '{}')
  } catch {
    return {}
  }
}

export function saveBcVisibilityProgress (progress) {
  if (!import.meta.client) return
  localStorage.setItem(BC_VISIBILITY_PROGRESS_KEY, JSON.stringify(progress))
}

export function buildBcDealerMailto ({ name = 'there', email = '' }) {
  const subject = encodeURIComponent(`${BC_BRAND.full} — authorized catalog for your shop`)
  const body = BC_DEALER_EMAIL.replace(/\{\{name\}\}/g, name.trim() || 'there')
  const to = email.trim()
  return to ? `mailto:${encodeURIComponent(to)}?subject=${subject}&body=${encodeURIComponent(body)}` : `mailto:?subject=${subject}&body=${encodeURIComponent(body)}`
}

export function buildBcVideoAdPackage (ideaIndex = 0) {
  const idea = BC_VIDEO_AD_IDEAS[ideaIndex] || BC_VIDEO_AD_IDEAS[0]
  const ctaUrl = `${BC_SITE_URL}${idea.cta.startsWith('/') ? idea.cta : `/${idea.cta}`}`
  const script = [
    `[0–3s HOOK] ${idea.hook}`,
    `[3–15s] ${idea.body}`,
    `[15–25s] Show ${BC_SITE_URL} on phone — department filter + add to cart`,
    `[25–30s CTA] ${BC_BRAND.full} · ${ctaUrl} · (833) 722-4147`,
  ].join('\n')
  const scenes = [
    { sec: '0–3', visual: 'Bold hook text on dark background', audio: idea.hook },
    { sec: '3–15', visual: 'Screen record catalog or product close-up', audio: idea.body },
    { sec: '15–25', visual: `Phone on ${BC_SITE_URL} — filter + cart`, audio: 'Authorized dealer · dropship checkout' },
    { sec: '25–30', visual: 'B&C logo + URL + (833) 722-4147', audio: 'Shop competition audio today' },
  ]
  const caption = BC_SOCIAL_CAPTIONS.tiktok.replace(BC_SITE_URL, ctaUrl)
  return {
    title: idea.hook,
    script,
    scenes,
    caption,
    ctaUrl,
    editTools: [
      { label: 'CapCut (free)', url: BC_PLATFORM_LINKS.capcut },
      { label: 'Canva video', url: BC_PLATFORM_LINKS.canva_video },
    ],
    postLinks: BC_POST_VIDEO_DESTINATIONS,
  }
}

export function allBcPendingCaptions (queue) {
  return (queue?.tasks || [])
    .filter((t) => t.kind === 'social' && t.status === 'pending')
    .map((t) => `--- ${t.dayLabel} · ${t.title} ---\n${t.caption}`)
    .join('\n\n')
}

/** Summarize orders for owner activity / tax prep printout. */
export function summarizeBcOrders (rows = []) {
  let grossCents = 0
  const lines = []
  for (const row of rows) {
    const cents = Number(row?.order?.amount_total_cents || row?.order?.total_cents || 0)
    if (Number.isFinite(cents)) grossCents += cents
    lines.push({
      id: row?.order_id || row?.id || '—',
      email: row?.order?.buyer_email || '—',
      status: row?.provider_status || 'queued',
      updated: row?.updated_at || '—',
      product: row?.listing?.title || 'B&C order',
      amount: Number.isFinite(cents) ? `$${(cents / 100).toFixed(2)}` : '—',
      amountCents: Number.isFinite(cents) ? cents : 0,
    })
  }
  const taxReserveCents = Math.round(grossCents * 0.25)
  return {
    count: rows.length,
    grossDisplay: `$${(grossCents / 100).toFixed(2)}`,
    grossCents,
    taxReserveDisplay: `$${(taxReserveCents / 100).toFixed(2)}`,
    taxReserveCents,
    operatingDisplay: `$${((grossCents - taxReserveCents) / 100).toFixed(2)}`,
    lines,
  }
}

export function ordersToPrintableText (summary, siteLabel = BC_BRAND.full) {
  const header = [
    `${siteLabel} — order & tax prep summary`,
    `Generated: ${new Date().toLocaleString()}`,
    `Orders: ${summary.count}`,
    `Gross checkout total (Stripe): ${summary.grossDisplay}`,
    `25% business income tax reserve (set aside): ${summary.taxReserveDisplay}`,
    `Operating balance after reserve: ${summary.operatingDisplay}`,
    '',
    'Bank deposits: Stripe Dashboard → Payouts → match payout date to orders below.',
    'Mercury vault: app.mercury.com — business funds only (no personal checking).',
    '',
  ].join('\n')
  const body = summary.lines.map((l) =>
    `${l.updated}\t${l.id}\t${l.product}\t${l.amount}\t${l.status}\t${l.email}`,
  ).join('\n')
  return `${header}Date\tOrder\tProduct\tAmount\tStatus\tEmail\n${body}\n\nLouisiana destination tax applies at checkout by shipping zip. Keep this printout with your tax records.`
}
