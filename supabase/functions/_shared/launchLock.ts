import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

export const LOCK_ROW_ID = '00000000-0000-0000-0000-000000000001'

export async function isLaunchLocked (admin: SupabaseClient) {
  const { data, error } = await admin
    .from('launch_lock')
    .select('locked, emergency_shutdown, locked_at')
    .eq('id', LOCK_ROW_ID)
    .maybeSingle()

  if (error) return { locked: false, emergency_shutdown: false, error: error.message }
  return {
    locked: !!data?.locked,
    emergency_shutdown: !!data?.emergency_shutdown,
    locked_at: data?.locked_at ?? null,
  }
}

export async function assertLaunchNotLocked (
  admin: SupabaseClient,
  action: string,
): Promise<{ ok: true } | { ok: false; error: string; message: string }> {
  const state = await isLaunchLocked(admin)
  if (state.locked) {
    return {
      ok: false,
      error: 'launch_locked',
      message: `Platform is locked — ${action} is disabled until launch.`,
    }
  }
  return { ok: true }
}
