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
