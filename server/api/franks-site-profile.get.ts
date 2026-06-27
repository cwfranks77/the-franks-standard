import { getFranksWpPublicProfile } from '../utils/franksWpConfig'

/** Franks Standard isolated site profile — blocked from B&C code paths. */
export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  const wp = getFranksWpPublicProfile()
  const phoneDisplay = String(config.public.customerServicePhone || '(877) 837-0527').trim()
  const digits = phoneDisplay.replace(/\D/g, '')
  const phoneTel = digits.length === 10
    ? `+1${digits}`
    : (digits.startsWith('1') ? `+${digits}` : `+1${digits}`)

  return {
    ok: true,
    profile: wp,
    support: {
      phoneDisplay,
      phoneTel,
      email: 'info@thefranksstandard.com',
      hours: 'Mon-Sat 9AM - 6PM CST',
    },
  }
})
