const GREETING =
  'Thank you for calling B and C Performance Audio. ' +
  'Your call is important to us.';

function escapeXml (value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default function handler (req, res) {
  const forwardTo = String(
    process.env.BC_OWNER_CELL_PHONE
    || process.env.PRIVATE_OWNER_CELL_PHONE
    || process.env.FORWARD_SUPPORT_TO
    || '+13373400449',
  ).trim()

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">${escapeXml(GREETING)}</Say>
  <Dial timeout="35">${escapeXml(forwardTo)}</Dial>
</Response>`;

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(twiml);
}
