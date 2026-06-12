/**
 * B&C Performance Audio LLC — inbound voice IVR (Twilio webhook).
 * Isolated from The Franks Standard marketplace voice flows.
 */
const SUPABASE_URL = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '')
const ACTION_URL = `${SUPABASE_URL}/functions/v1/bc-voice-inbound`
const OWNER_PHONE = (Deno.env.get('BC_VOICE_OWNER_PHONE') ?? Deno.env.get('PRIVATE_OWNER_CELL_PHONE') ?? '').trim()
const BC_CALLER_ID = (Deno.env.get('TWILIO_BC_CALLER_ID') ?? '+18337224147').trim()

function xmlEscape (value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function twiml (body: string) {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`, {
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  })
}

function say (text: string) {
  return `<Say voice="Polly.Joanna">${xmlEscape(text)}</Say>`
}

async function readDigits (req: Request) {
  const contentType = req.headers.get('content-type') ?? ''
  if (req.method === 'GET') {
    return new URL(req.url).searchParams.get('Digits')?.trim() ?? ''
  }
  if (!contentType.includes('application/x-www-form-urlencoded')) {
    return ''
  }
  const form = await req.formData()
  return String(form.get('Digits') ?? '').trim()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok')
  }
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response('method not allowed', { status: 405 })
  }

  const digits = await readDigits(req)

  if (!digits) {
    return twiml(
      `<Gather numDigits="1" action="${xmlEscape(ACTION_URL)}" method="POST" timeout="12">${
        say(
          'Thank you for calling B and C Performance Audio, competition car audio and subwoofers. ' +
          'Press 1 for orders or shipping. Press 2 for product help. Press 0 to reach the owner.',
        )
      }</Gather>${say('We did not receive your selection. Goodbye.')}`,
    )
  }

  if (digits === '0') {
    if (!OWNER_PHONE) {
      return twiml(
        say('The owner is unavailable right now. Please email bc audio at the franks standard dot com. Goodbye.'),
      )
    }
    return twiml(
      `${say('Connecting you to the owner now.')}<Dial timeout="35" callerId="${xmlEscape(BC_CALLER_ID)}">${xmlEscape(OWNER_PHONE)}</Dial>${say('The owner could not be reached. Please try again later or visit b c power audio dot com. Goodbye.')}`,
    )
  }

  if (digits === '1') {
    return twiml(
      say(
        'For order and shipping help, visit b c power audio dot com or email bc audio at the franks standard dot com. Goodbye.',
      ),
    )
  }

  if (digits === '2') {
    return twiml(
      say('Browse our competition audio catalog at b c power audio dot com. Goodbye.'),
    )
  }

  return twiml(
    `${say('That is not a valid option.')}<Redirect method="POST">${xmlEscape(ACTION_URL)}</Redirect>`,
  )
})
