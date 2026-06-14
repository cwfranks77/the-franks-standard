/**
 * Client-side account freeze and integrity hold checks.
 */

const INTEGRITY_APPEAL_EMAIL = 'info@thefranksstandard.com'

function integrityHoldActive (profile: {
  integrity_hold_at?: string | null
  integrity_hold_expires_at?: string | null
} | null): boolean {
  if (!profile?.integrity_hold_at) return false
  if (profile.integrity_hold_expires_at) {
    return new Date(profile.integrity_hold_expires_at) > new Date()
  }
  return true
}

export function useAccountFreeze () {
  const supabase = useSupabaseClient()

  async function loadFreezeState (userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        account_frozen_at, account_freeze_reason,
        seller_debt_balance, seller_debt_status, seller_debt_paid_at,
        seller_banned_at, seller_ban_reason,
        integrity_hold_at, integrity_hold_reason, integrity_hold_expires_at
      `)
      .eq('id', userId)
      .maybeSingle()
    if (error) {
      return {
        frozen: false,
        integrityHold: false,
        blocked: false,
        profile: null,
        error: error.message,
      }
    }
    const debtFrozen = !!(
      data?.account_frozen_at &&
      data?.seller_debt_status === 'pending' &&
      !data?.seller_debt_paid_at
    )
    const hold = integrityHoldActive(data)
    return {
      frozen: debtFrozen,
      integrityHold: hold,
      blocked: debtFrozen || hold,
      profile: data,
      error: null,
    }
  }

  function freezeAlertMessage (profile: {
    account_freeze_reason?: string | null
    seller_debt_balance?: number | null
  } | null) {
    if (!profile) return 'Your account is frozen. Contact info@thefranksstandard.com.'
    const bal = profile.seller_debt_balance != null
      ? `$${Number(profile.seller_debt_balance).toLocaleString()}`
      : 'the outstanding balance'
    return (
      profile.account_freeze_reason ||
      `Your account is frozen until you repay ${bal} to The Franks Standard. ` +
      'You cannot buy, sell, edit listings, or receive escrow payouts until the debt is cleared. ' +
      'After repayment, your account may still be permanently closed per policy. ' +
      `Email ${INTEGRITY_APPEAL_EMAIL} to pay.`
    )
  }

  function integrityHoldAlertMessage (profile: {
    integrity_hold_reason?: string | null
    integrity_hold_expires_at?: string | null
  } | null) {
    if (!profile) {
      return `Your account is paused for an authenticity review. Email ${INTEGRITY_APPEAL_EMAIL} with evidence.`
    }
    const reason = profile.integrity_hold_reason || 'An authenticity or description concern is under review.'
    const exp = profile.integrity_hold_expires_at
      ? ` Review window ends ${new Date(profile.integrity_hold_expires_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}.`
      : ''
    return (
      `${reason} Selling and buying are paused.${exp} ` +
      `Email ${INTEGRITY_APPEAL_EMAIL} with photos, invoices, or inventory notes to present your case. ` +
      'Knowing misrepresentation may still result in a permanent ban after review.'
    )
  }

  return { loadFreezeState, freezeAlertMessage, integrityHoldAlertMessage }
}
