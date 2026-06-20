import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

const SENDGRID_KEY = () => Deno.env.get('SENDGRID_API_KEY') ?? ''
const FROM_EMAIL = () => Deno.env.get('SENDGRID_FROM_EMAIL') ?? 'info@thefranksstandard.com'
const FROM_NAME = () => Deno.env.get('SENDGRID_FROM_NAME') ?? 'The Franks Standard'
const SITE = () => (Deno.env.get('SITE_URL') ?? 'https://thefranksstandard.com').replace(/\/+$/, '')

export async function sendFollowupEmail (
  admin: SupabaseClient,
  userId: string,
  sourceType: 'dispute' | 'contact' | 'call' | 'ticket',
  sourceId: string,
  existingFollowupId?: string,
): Promise<{ ok: true; followup_id: string; token: string } | { ok: false; error: string }> {
  let followup: { id: string; token: string } | null = null

  if (existingFollowupId) {
    const { data } = await admin
      .from('support_followup_emails')
      .select('id, token')
      .eq('id', existingFollowupId)
      .maybeSingle()
    followup = data
  }

  if (!followup) {
    const { data, error } = await admin
      .from('support_followup_emails')
      .insert({ user_id: userId, source_type: sourceType, source_id: sourceId })
      .select('id, token')
      .single()
    if (error || !data?.id) return { ok: false, error: error?.message ?? 'insert_failed' }
    followup = data
  }

  const { data: authUser } = await admin.auth.admin.getUserById(userId)
  const toEmail = authUser?.user?.email
  if (!toEmail) return { ok: true, followup_id: followup.id, token: followup.token }

  const surveyUrl = `${SITE()}/support-rating?token=${encodeURIComponent(followup.token)}`
  const sgKey = SENDGRID_KEY()
  if (!sgKey) {
    console.warn('sendFollowupEmail: SENDGRID_API_KEY not set; queued only', followup.id)
    return { ok: true, followup_id: followup.id, token: followup.token }
  }

  const body = {
    personalizations: [{ to: [{ email: toEmail }] }],
    from: { email: FROM_EMAIL(), name: FROM_NAME() },
    subject: 'How did we do? — The Franks Standard support follow-up',
    content: [{
      type: 'text/html',
      value: `<p>Your recent support case has been closed.</p>
<p>Please take a moment to rate your experience (1–5 stars) and tell us if your issue was resolved.</p>
<p><a href="${surveyUrl}">Complete the short survey</a></p>
<p>If the link does not open, copy this URL: ${surveyUrl}</p>`,
    }],
  }

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sgKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    console.error('sendFollowupEmail sendgrid', res.status, txt)
  } else {
    await admin.from('support_followup_emails').update({
      email_dispatched_at: new Date().toISOString(),
    }).eq('id', followup.id)
  }

  return { ok: true, followup_id: followup.id, token: followup.token }
}

export async function recordSupportRating (
  admin: SupabaseClient,
  params: {
    token: string
    rating: number
    issueResolved: 'yes' | 'no' | 'partial'
    comments?: string
  },
): Promise<{ ok: true; rating_id: string } | { ok: false; error: string }> {
  const { data: followup, error: fErr } = await admin
    .from('support_followup_emails')
    .select('id, user_id, completed_at')
    .eq('token', params.token)
    .maybeSingle()

  if (fErr || !followup) return { ok: false, error: 'invalid_token' }
  if (followup.completed_at) return { ok: false, error: 'already_submitted' }

  const { data, error } = await admin.from('support_ratings').insert({
    followup_id: followup.id,
    user_id: followup.user_id,
    rating: params.rating,
    issue_resolved: params.issueResolved,
    comments: String(params.comments ?? '').slice(0, 4000),
  }).select('id').single()

  if (error || !data?.id) return { ok: false, error: error?.message ?? 'insert_failed' }

  await admin.from('support_followup_emails').update({
    completed_at: new Date().toISOString(),
  }).eq('id', followup.id)

  return { ok: true, rating_id: data.id }
}
