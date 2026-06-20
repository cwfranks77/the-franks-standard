import { appendLocalActivity } from '~/utils/platformActivity'
import { getDeviceFingerprint } from '~/utils/deviceFingerprint'

export type RemoteActivityPayload = {
  action: string
  action_category: 'auth' | 'browse' | 'listing' | 'transaction' | 'message' | 'owner' | 'sell' | 'general'
  event_type?: string
  metadata?: Record<string, unknown>
  user_display_name?: string
}

/** Log to Supabase platform_activity_events (falls back to local buffer when offline). */
export async function logPlatformActivity (
  supabase: ReturnType<typeof useSupabaseClient>,
  payload: RemoteActivityPayload,
) {
  if (!import.meta.client) return

  const fp = getDeviceFingerprint()
  const ts = new Date().toISOString()
  const eventType = payload.event_type || payload.action_category

  const { data: { session } } = await supabase.auth.getSession()
  const localFallback = () => {
    appendLocalActivity({
      user_id: session?.user?.id ?? null,
      user_display_name: payload.user_display_name
        || session?.user?.user_metadata?.full_name
        || null,
      ip_address: 'browser-session',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      action: payload.action,
      action_category: payload.action_category,
      metadata: { ...payload.metadata, device_fingerprint: fp, event_type: eventType },
      created_at: ts,
    })
  }

  if (!session?.access_token) {
    localFallback()
    return
  }

  try {
    const { error } = await supabase.functions.invoke('platform-log-activity', {
      body: {
        action: payload.action,
        action_category: payload.action_category,
        event_type: eventType,
        device_fingerprint: fp,
        timestamp: ts,
        user_display_name: payload.user_display_name,
        metadata: payload.metadata || {},
      },
    })
    if (error) localFallback()
  } catch {
    localFallback()
  }
}
