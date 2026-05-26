import { createClient } from 'npm:@supabase/supabase-js@2'
import { adminRequirementHint, isOpsAdmin, requireUser } from '../_shared/adminAuth.ts'
import { corsHeaders, json } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

const PRIORITIES = new Set(['low', 'normal', 'high', 'urgent'])
const STATUSES = new Set(['new', 'contacted', 'qualified', 'converted', 'closed'])

function cleanEmail(value: unknown): string {
  return String(value ?? '').trim().toLowerCase()
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405)
  }

  try {
    const { user, error: authError } = await requireUser(req.headers.get('Authorization') ?? '')
    if (authError || !user) {
      return json({ error: 'unauthorized' }, 401)
    }
    if (!isOpsAdmin(user)) {
      return json({ error: 'forbidden', detail: adminRequirementHint() }, 403)
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    const body = await req.json().catch(() => ({})) as {
      action?: string
      storeName?: string
      contactEmail?: string
      category?: string
      priority?: string
      status?: string
      notes?: string
    }
    const action = String(body.action ?? 'create').trim().toLowerCase()

    if (action === 'list') {
      const { data, error } = await admin
        .from('admin_leads')
        .select('id, store_name, contact_email, category, priority, status, notes, source, created_at')
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) {
        return json({ error: 'lead_list_failed', detail: error.message }, 500)
      }
      return json({ ok: true, leads: data ?? [] })
    }

    await admin.from('profiles').upsert({
      id: user.id,
      full_name: String(user.user_metadata?.full_name ?? user.email ?? '').trim() || null,
      account_type: 'seller',
    }, { onConflict: 'id', ignoreDuplicates: true })

    const storeName = String(body.storeName ?? '').trim()
    const contactEmail = cleanEmail(body.contactEmail)
    const category = String(body.category ?? '').trim()
    const priority = PRIORITIES.has(String(body.priority ?? '').trim().toLowerCase())
      ? String(body.priority).trim().toLowerCase()
      : 'normal'
    const status = STATUSES.has(String(body.status ?? '').trim().toLowerCase())
      ? String(body.status).trim().toLowerCase()
      : 'new'
    const notes = String(body.notes ?? '').trim()

    if (!storeName) {
      return json({ error: 'store_name_required' }, 400)
    }
    if (!isEmail(contactEmail)) {
      return json({ error: 'valid_contact_email_required' }, 400)
    }

    const { data, error } = await admin
      .from('admin_leads')
      .insert({
        store_name: storeName,
        contact_email: contactEmail,
        category: category || null,
        priority,
        status,
        notes: notes || null,
        source: 'manual',
        created_by: user.id,
      })
      .select('id, store_name, contact_email, category, priority, status, notes, source, created_at')
      .single()

    if (error) {
      return json({ error: 'lead_create_failed', detail: error.message }, 500)
    }

    return json({ ok: true, lead: data }, 201)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'lead_request_failed'
    return json({ error: 'lead_request_failed', detail: message }, 500)
  }
})
