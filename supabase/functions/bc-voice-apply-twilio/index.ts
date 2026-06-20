/**
 * B&C ONLY — point (833) 722-4147 at bc-voice-inbound (AI first, owner on escalate).
 */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const BC_E164 = '+18337224147'
const BC_VOICE_URL = (Deno.env.get('BC_VOICE_INBOUND_URL') ?? '').trim()
  || 'https://rochesyrxiyrxhzmkuwk.supabase.co/functions/v1/bc-voice-inbound'

function normalizeE164 (raw: string): string {
  const digits = String(raw || '').replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  const t = String(raw || '').trim()
  return t.startsWith('+') ? t.replace(/\s/g, '') : digits ? `+${digits}` : ''
}

async function twilioGet (sid: string, auth: string, path: string) {
  const r = await fetch(`https://api.twilio.com/2010-04-01${path}`, { headers: { Authorization: auth } })
  const t = await r.text()
  if (!r.ok) throw new Error(`GET ${r.status}: ${t.slice(0, 200)}`)
  return JSON.parse(t)
}

async function twilioPost (sid: string, auth: string, path: string, body: Record<string, string>) {
  const r = await fetch(`https://api.twilio.com/2010-04-01${path}`, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body).toString(),
  })
  const t = await r.text()
  if (!r.ok) throw new Error(`POST ${r.status}: ${t.slice(0, 200)}`)
  return JSON.parse(t)
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false }), { status: 405, headers: { 'Content-Type': 'application/json' } })
  }

  const sid = (Deno.env.get('TWILIO_ACCOUNT_SID') ?? '').trim()
  const token = (Deno.env.get('TWILIO_AUTH_TOKEN') ?? '').trim()
  if (!sid || !token) {
    return new Response(JSON.stringify({ ok: false, error: 'missing twilio secrets' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const auth = 'Basic ' + btoa(`${sid}:${token}`)
  const list = await twilioGet(sid, auth, `/Accounts/${sid}/IncomingPhoneNumbers.json?PageSize=100`)
  const nums = list.incoming_phone_numbers ?? []
  const bc = nums.find((n: { phone_number?: string }) => normalizeE164(n.phone_number ?? '') === BC_E164)

  if (!bc?.sid) {
    return new Response(JSON.stringify({ ok: false, error: 'bc number not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const u = await twilioPost(sid, auth, `/Accounts/${sid}/IncomingPhoneNumbers/${bc.sid}.json`, {
    FriendlyName: 'B&C Performance Audio LLC — Customer Support',
    VoiceUrl: BC_VOICE_URL,
    VoiceMethod: 'POST',
    VoiceFallbackUrl: BC_VOICE_URL,
    VoiceFallbackMethod: 'POST',
    VoiceApplicationSid: '',
    TrunkSid: '',
  })

  return new Response(
    JSON.stringify({
      ok: true,
      phone: u.phone_number,
      voice_url: u.voice_url,
      flow: 'AI first — owner cell only on request or escalation',
      owner_handoff_cell: '+13373400449',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
