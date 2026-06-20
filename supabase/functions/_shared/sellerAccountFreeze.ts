import { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import type { ForceRefundReason } from './forceRefund.ts'

export type FrozenProfileRow = {
  id: string
  account_frozen_at: string | null
  seller_debt_status: string | null
  seller_debt_paid_at: string | null
  seller_banned_at: string | null
  safety_frozen_at?: string | null
  platform_banned_at?: string | null
  safety_freeze_reason?: string | null
}

/** Buyer-not-at-fault refund reasons → seller owes platform. */
export const SELLER_AT_FAULT_REFUND_REASONS: ForceRefundReason[] = [
  'counterfeit',
  'not_as_described',
  'dispute_upheld',
  'seller_failed_refund',
]

export function isSellerAtFaultRefundReason (reason: string): boolean {
  return SELLER_AT_FAULT_REFUND_REASONS.includes(reason as ForceRefundReason)
}

export function isAccountFrozen (profile: FrozenProfileRow | null | undefined): boolean {
  if (!profile?.account_frozen_at) return false
  if (profile.seller_debt_paid_at) return false
  return profile.seller_debt_status === 'pending'
}

export function accountFrozenMessage (profile: FrozenProfileRow & { account_freeze_reason?: string | null; seller_debt_balance?: number | null }): string {
  const balance = profile.seller_debt_balance != null
    ? `$${Number(profile.seller_debt_balance).toLocaleString()}`
    : 'the amount shown in your account notice'
  const reason = profile.account_freeze_reason || 'Platform advanced a buyer refund you refused to honor.'
  return `${reason} Your account is frozen (no buying, selling, or listing changes; escrow payouts held) until you repay ${balance} to The Franks Standard. Contact info@thefranksstandard.com to arrange payment.`
}

export async function loadProfileFreezeState (
  admin: SupabaseClient,
  userId: string,
): Promise<FrozenProfileRow | null> {
  const { data } = await admin
    .from('profiles')
    .select('id, account_frozen_at, seller_debt_status, seller_debt_paid_at, seller_banned_at, account_freeze_reason, seller_debt_balance, safety_frozen_at, platform_banned_at, safety_freeze_reason')
    .eq('id', userId)
    .maybeSingle()
  return data as FrozenProfileRow | null
}

export async function assertAccountNotFrozen (
  admin: SupabaseClient,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string; message: string }> {
  const profile = await loadProfileFreezeState(admin, userId)
  if (profile?.platform_banned_at || profile?.seller_banned_at) {
    return {
      ok: false,
      error: 'account_banned',
      message: 'This account is permanently banned from The Franks Standard.',
    }
  }
  if (profile?.safety_frozen_at) {
    return {
      ok: false,
      error: 'account_frozen',
      message: profile.safety_freeze_reason || 'This account is frozen and cannot complete this action.',
    }
  }
  if (isAccountFrozen(profile)) {
    return {
      ok: false,
      error: 'account_frozen',
      message: accountFrozenMessage(profile as FrozenProfileRow & { account_freeze_reason?: string; seller_debt_balance?: number }),
    }
  }
  return { ok: true }
}

/** Freeze all seller activity until platform debt is recovered. */
export async function freezeSellerForPlatformDebt (
  admin: SupabaseClient,
  params: {
    sellerId: string
    orderId: string
    debtAmount: number
    refundReason: string
    opsNote?: string | null
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const now = new Date().toISOString()
  const reasonText = `Seller at fault (${params.refundReason}). Platform refunded buyer $${params.debtAmount.toFixed(2)} for order ${params.orderId.slice(0, 8)}…. Repay to restore access.`

  const { error: profileErr } = await admin
    .from('profiles')
    .update({
      account_frozen_at: now,
      account_freeze_reason: reasonText,
      seller_debt_balance: params.debtAmount,
      seller_debt_order_id: params.orderId,
      seller_debt_recorded_at: now,
      seller_debt_paid_at: null,
      seller_debt_status: 'pending',
    })
    .eq('id', params.sellerId)

  if (profileErr) return { ok: false, error: profileErr.message }

  await admin
    .from('listings')
    .update({
      status: 'archived',
      integrity_status: 'suspended',
      integrity_scanned_at: now,
    })
    .eq('seller_id', params.sellerId)
    .eq('status', 'published')

  await admin
    .from('orders')
    .update({
      escrow_frozen_at: now,
      escrow_freeze_reason: 'seller_debt_recovery',
    })
    .eq('seller_id', params.sellerId)
    .eq('escrow_status', 'held')
    .in('status', ['paid', 'shipped', 'delivered'])

  await admin.from('seller_debt_events').insert({
    seller_id: params.sellerId,
    order_id: params.orderId,
    event_type: 'freeze',
    amount: params.debtAmount,
    notes: params.opsNote ?? reasonText,
  })

  return { ok: true }
}

export async function recordSellerDebtPayment (
  admin: SupabaseClient,
  params: {
    sellerId: string
    amount?: number
    notes?: string | null
    banAfterPayment?: boolean
    banReason?: string | null
  },
): Promise<{ ok: true; banned: boolean } | { ok: false; error: string }> {
  const now = new Date().toISOString()
  const { data: profile } = await admin
    .from('profiles')
    .select('seller_debt_balance, seller_debt_order_id')
    .eq('id', params.sellerId)
    .maybeSingle()

  if (!profile || profile.seller_debt_balance == null) {
    return { ok: false, error: 'no_pending_debt' }
  }

  const patch: Record<string, unknown> = {
    seller_debt_paid_at: now,
    seller_debt_status: 'paid',
    account_frozen_at: null,
    account_freeze_reason: null,
  }

  let banned = false
  if (params.banAfterPayment) {
    banned = true
    patch.seller_banned_at = now
    patch.seller_ban_reason = params.banReason ?? 'Permanent ban after debt repayment — policy violation'
  }

  const { error } = await admin.from('profiles').update(patch).eq('id', params.sellerId)
  if (error) return { ok: false, error: error.message }

  await admin.from('seller_debt_events').insert({
    seller_id: params.sellerId,
    order_id: profile.seller_debt_order_id,
    event_type: params.banAfterPayment ? 'ban_after_debt' : 'payment',
    amount: params.amount ?? profile.seller_debt_balance,
    notes: params.notes ?? null,
  })

  if (!params.banAfterPayment) {
    await admin.from('seller_debt_events').insert({
      seller_id: params.sellerId,
      order_id: profile.seller_debt_order_id,
      event_type: 'lift_freeze',
      amount: params.amount ?? profile.seller_debt_balance,
      notes: 'Debt marked paid — account unfrozen',
    })
  } else {
    await admin
      .from('listings')
      .update({ status: 'archived', integrity_status: 'suspended' })
      .eq('seller_id', params.sellerId)
      .eq('status', 'published')
  }

  return { ok: true, banned }
}

export async function banSellerAfterDebt (
  admin: SupabaseClient,
  sellerId: string,
  banReason?: string,
): Promise<void> {
  const now = new Date().toISOString()
  await admin.from('profiles').update({
    seller_banned_at: now,
    seller_ban_reason: banReason ?? 'Banned after failing to honor refund and repay platform',
    account_frozen_at: now,
    seller_debt_status: 'pending',
  }).eq('id', sellerId)

  await admin.from('seller_debt_events').insert({
    seller_id: sellerId,
    event_type: 'ban_after_debt',
    notes: banReason ?? null,
  })

  await admin
    .from('listings')
    .update({ status: 'archived', integrity_status: 'suspended' })
    .eq('seller_id', sellerId)
    .eq('status', 'published')
}
