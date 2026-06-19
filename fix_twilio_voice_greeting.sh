#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
API_DIR="$ROOT/api"
VOICE_DIR="$ROOT/bc-audio/voice"

echo "=== FIXING TWILIO VOICE GREETING ==="

mkdir -p "$API_DIR" "$VOICE_DIR"

###############################################
# 1. Twilio Voice webhook (TwiML)
###############################################
cat > "$API_DIR/voice.js" <<'EOF'
const GREETING =
  'Thank you for calling B and C Performance Audio, a division of The Franks Standard. ' +
  'Your call is important to us. Please hold while we connect you to customer support.';

function escapeXml (value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default function handler (req, res) {
  const forwardTo = String(
    process.env.PRIVATE_OWNER_CELL_PHONE
    || process.env.FORWARD_SUPPORT_TO
    || process.env.NUXT_PUBLIC_BC_AUDIO_SUPPORT_TEL
    || '+18337224147',
  ).trim();

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">${escapeXml(GREETING)}</Say>
  <Dial timeout="35">${escapeXml(forwardTo)}</Dial>
</Response>`;

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(twiml);
}
EOF

###############################################
# 2. Nuxt / Nitro route (when server is deployed)
###############################################
NUXT_VOICE="$ROOT/bc-performance-audio/src/server/api/voice.get.ts"
mkdir -p "$(dirname "$NUXT_VOICE")"
cat > "$NUXT_VOICE" <<'EOF'
/** B&C inbound call greeting — returns TwiML for Twilio webhook. */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const forwardTo = String(
    process.env.PRIVATE_OWNER_CELL_PHONE
    || config.private?.ownerCellPhone
    || config.public?.bcAudioSupportTel
    || '+18337224147',
  ).trim()

  const greeting =
    'Thank you for calling B and C Performance Audio, a division of The Franks Standard. ' +
    'Your call is important to us. Please hold while we connect you to customer support.'

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">${greeting.replace(/&/g, 'and')}</Say>
  <Dial timeout="35">${forwardTo}</Dial>
</Response>`

  setHeader(event, 'Content-Type', 'text/xml')
  return xml
})
EOF

###############################################
# 3. Greeting text file (reference)
###############################################
cat > "$VOICE_DIR/customer_service_greeting.txt" <<'EOF'
Thank you for calling B&C Performance Audio, a division of The Franks Standard.
Your call is important to us. Please hold while we connect you to customer support.
EOF

echo "=== Twilio Voice Greeting Updated Successfully ==="
echo "Set PRIVATE_OWNER_CELL_PHONE in .env.local to your cell (E.164, e.g. +12255551234)."
echo "Point Twilio number webhook to your hosted /api/voice URL, OR run:"
echo "  npm run ops:deploy-bc-voice"
