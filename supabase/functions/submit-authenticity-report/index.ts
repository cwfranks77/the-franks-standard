import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''
const NOTIFY_EMAIL = Deno.env.get('CONTACT_NOTIFY_EMAIL') ?? 'info@thefranksstandard.com'
const SENDGRID_KEY = Deno.env.get('SENDGRID_API_KEY') ?? ''

const REASONS = new Set([
  'suspected_counterfeit',
  'misrepresented_grade',
  'wrong_item_photos',
  'fake_coa_document',
  'other',
])

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  if (body.website) return json({ ok: true })

  const listingId = String(body.listing_id ?? '').trim()
  const reason = String(body.reason ?? '').trim()
  const details = String(body.details ?? '').trim().slice(0, 4000)
  const reporterEmail = String(body.reporter_email ?? '').trim().slice(0, 200)

  if (!listingId || !REASONS.has(reason) || details.length < 10) {
    return json({ error: 'missing_fields' }, 400)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })

  const { data: listing } = await admin
    .from('listings')
    .select('id, title, status, seller_id')
    .eq('id', listingId)
    .maybeSingle()

  if (!listing || listing.status !== 'published') {
    return json({ error: 'listing_not_found' }, 404)
  }

  let reporterId: string | null = null
  const authHeader = req.headers.get('Authorization') ?? ''
  if (authHeader.startsWith('Bearer ')) {
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    })
    const { data: { user } } = await userClient.auth.getUser()
    reporterId = user?.id ?? null
  }

  const { data: report, error: insErr } = await admin
    .from('authenticity_reports')
    .insert({
      listing_id: listingId,
      reporter_id: reporterId,
      reporter_email: reporterEmail || null,
      reason,
      details,
      status: 'open',
    })
    .select('id')
    .single()

  if (insErr) return json({ error: insErr.message }, 500)

  await admin
    .from('listings')
    .update({
      integrity_status: 'review',
      integrity_scanned_at: new Date().toISOString(),
    })
    .eq('id', listingId)
    .in('integrity_status', ['clear', 'review'])

  if (SENDGRID_KEY && NOTIFY_EMAIL) {
    try {
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SENDGRID_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: NOTIFY_EMAIL }] }],
          from: {
            email: Deno.env.get('SENDGRID_FROM_EMAIL') ?? 'info@thefranksstandard.com',
            name: 'The Franks Standard',
          },
          subject: `[AUTH REPORT] ${reason} — ${listing.title}`,
          content: [{
            type: 'text/plain',
            value: `Listing: ${listingId}\nTitle: ${listing.title}\nReason: ${reason}\n\n${details}\n\nReporter: ${reporterEmail || reporterId || 'anonymous'}\nReport ID: ${report.id}`,
          }],
        }),
      })
    } catch { /* best-effort */ }
  }

  return json({ ok: true, report_id: report.id })
})
