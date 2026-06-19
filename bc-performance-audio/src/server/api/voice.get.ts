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
