/**
 * Client-side account freeze checks (seller debt / forced refund recovery).
 */

export function useAccountFreeze () {
  const supabase = useSupabaseClient()

  async function loadFreezeState (userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        account_frozen_at, account_freeze_reason,
        seller_debt_balance, seller_debt_status, seller_debt_paid_at,
        seller_banned_at, seller_ban_reason
      `)
      .eq('id', userId)
      .maybeSingle()
    if (error) return { frozen: false, profile: null, error: error.message }
    const frozen = !!(
      data?.account_frozen_at &&
      data?.seller_debt_status === 'pending' &&
      !data?.seller_debt_paid_at
    )
    return { frozen, profile: data, error: null }
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
      'Email info@thefranksstandard.com to pay.'
    )
  }

  return { loadFreezeState, freezeAlertMessage }
}
