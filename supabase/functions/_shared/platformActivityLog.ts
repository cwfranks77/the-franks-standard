import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

export type ServerActivityEvent = {
  userId: string
  eventType: string
  actionCategory: 'auth' | 'browse' | 'listing' | 'transaction' | 'message' | 'owner' | 'sell' | 'general' | 'infraction' | 'safety'
  action: string
  metadata?: Record<string, unknown>
  ipAddress?: string | null
  deviceFingerprint?: string | null
  userDisplayName?: string | null
}

/** Server-side activity log — all safety and marketplace events. */
export async function logServerActivity (
  admin: SupabaseClient,
  event: ServerActivityEvent,
): Promise<void> {
  try {
    await admin.from('platform_activity_events').insert({
      user_id: event.userId,
      user_display_name: event.userDisplayName ?? null,
      action: event.action,
      action_category: event.actionCategory,
      event_type: event.eventType,
      ip_address: event.ipAddress ?? 'edge-function',
      device_fingerprint: event.deviceFingerprint ?? null,
      user_agent: 'supabase-edge',
      metadata: event.metadata ?? {},
      created_at: new Date().toISOString(),
    })
  } catch (e) {
    console.error('logServerActivity', e)
  }
}

export const ACTIVITY_EVENT_TYPES = [
  'login',
  'logout',
  'listing_created',
  'listing_edited',
  'listing_deleted',
  'message_sent',
  'review_submitted',
  'dispute_opened',
  'coa_uploaded',
  'purchase_completed',
  'refund_requested',
  'policy_violation',
  'dispute_notification',
  'checkout_start',
  'cart_update',
  'listing_view',
  'page_view',
] as const
