/**
 * Apply B&C greeting to Twilio (833) 722-4147 via Supabase — no local Twilio keys needed.
 *   npm run ops:apply-bc-voice-twilio
 */
const URL = 'https://rochesyrxiyrxhzmkuwk.supabase.co/functions/v1/bc-voice-apply-twilio'

async function main () {
  const res = await fetch(URL, { method: 'POST' })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = { raw: text } }
  console.log(JSON.stringify(data, null, 2))
  if (!res.ok || !data.ok) process.exit(1)
  console.log('\n[OK] Call (833) 722-4147 to test the B&C greeting.')
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
