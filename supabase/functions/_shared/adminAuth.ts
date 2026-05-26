import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

function splitEnv(name: string): string[] {
  return String(Deno.env.get(name) ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
}

export async function requireUser(authHeader: string) {
  if (!authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'unauthorized' }
  }

  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  })
  const { data: { user }, error } = await supabaseUser.auth.getUser()
  if (error || !user) {
    return { user: null, error: 'unauthorized' }
  }

  return { user, error: null }
}

export function isOpsAdmin(user: any): boolean {
  const allowedIds = splitEnv('OPS_ADMIN_USER_IDS')
  const allowedEmails = splitEnv('OPS_ADMIN_EMAILS')
  const userId = String(user?.id ?? '').trim().toLowerCase()
  const email = String(user?.email ?? '').trim().toLowerCase()
  const role = String(user?.app_metadata?.role ?? user?.app_metadata?.user_role ?? '').trim().toLowerCase()

  return (
    role === 'superadmin' ||
    role === 'admin' ||
    allowedIds.includes(userId) ||
    allowedEmails.includes(email)
  )
}

export function adminRequirementHint() {
  return 'Set OPS_ADMIN_EMAILS or OPS_ADMIN_USER_IDS in Supabase function secrets, or assign app_metadata.role=SuperAdmin to the operator user.'
}
