/**
 * Twilio inbound webhook for B&C Performance Audio (833) 722-4147.
 * Plays the official hold greeting, then forwards to the owner cell.
 */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const GREETING = [
  'Thank you for calling B and C Performance Audio, a division of The Franks Standard.',
  'Your call is important to us.',
  'Please hold while we connect you to customer support.',
].join(' ')

function escapeXml (value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function ownerE164 () {
  const raw = Deno.env.get('PRIVATE_OWNER_CELL_PHONE') || '+13373400449'
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return raw.startsWith('+') ? raw : `+${digits}`
}

Deno.serve(() => {
  const forwardTo = ownerE164()
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${escapeXml(GREETING)}</Say>
  <Dial timeout="35">${forwardTo}</Dial>
</Response>`

  return new Response(twiml, {
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  })
})
