/**
 * B&C ONLY — set BC_OWNER_CELL_PHONE on Supabase then re-apply Twilio voice.
 *   node scripts/set-bc-owner-cell.cjs +1XXXXXXXXXX
 */
const URL = 'https://rochesyrxiyrxhzmkuwk.supabase.co/functions/v1/bc-voice-apply-twilio'

function normalizeE164 (raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  const t = String(raw || '').trim()
  return t.startsWith('+') ? t : digits ? `+${digits}` : ''
}

const cell = normalizeE164(process.argv[2] || '+13373400449')
if (!cell) {
  process.exit(1)
}

async function main () {
  // bc-voice-apply-twilio reads BC_OWNER_CELL_PHONE from Supabase secrets.
  // Until secret is set in dashboard, pass via query for one-time apply (function must support it).
  const applyUrl = `${URL}?bc_owner_cell_phone=${encodeURIComponent(cell)}`
  const res = await fetch(applyUrl, { method: 'POST' })
  const text = await res.text()
  console.log(text)
  if (!res.ok) process.exit(1)
}

main().catch((e) => {
  console.error(e.message || e)
  process.exit(1)
})
