import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/stripe.ts'
import { clientIpFromRequest } from '../_shared/requestContext.ts'
import { verifyOpsKey } from '../_shared/opsAuth.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

const ALLOWED_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'])
const MAX_BYTES = 10 * 1024 * 1024

function hexHash (buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function hasExecutableMagic (bytes: Uint8Array) {
  if (bytes.length >= 2 && bytes[0] === 0x4D && bytes[1] === 0x5A) return true
  if (bytes.length >= 4 && bytes[0] === 0x7F && bytes[1] === 0x45 && bytes[2] === 0x4C && bytes[3] === 0x46) return true
  return false
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const opsKey = req.headers.get('x-ops-key') ?? ''
  const authHeader = req.headers.get('Authorization') ?? ''
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })

  let authedUserId: string | null = null
  if (authHeader.startsWith('Bearer ')) {
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    })
    const { data: { user } } = await userClient.auth.getUser()
    authedUserId = user?.id ?? null
  } else if (!(await verifyOpsKey(opsKey))) {
    return json({ error: 'unauthorized' }, 401)
  }

  const form = await req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return json({ error: 'file_required' }, 400)

  const mime = file.type.toLowerCase()
  if (!ALLOWED_MIME.has(mime)) return json({ error: 'file_type_not_allowed' }, 400)
  if (file.size > MAX_BYTES) return json({ error: 'file_too_large', max_bytes: MAX_BYTES }, 400)

  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  if (hasExecutableMagic(bytes)) return json({ error: 'executable_content_rejected' }, 400)

  const hashSha256 = hexHash(await crypto.subtle.digest('SHA-256', buffer))
  const ip = clientIpFromRequest(req)
  const listingId = String(form.get('listing_id') ?? '') || null
  const uploadType = String(form.get('upload_type') ?? 'listing')

  const row = {
    listing_id: listingId,
    uploader_id: authedUserId,
    storage_path: `uploads/${hashSha256}/${file.name}`,
    mime_type: mime,
    file_size_bytes: file.size,
    hash_sha256: hashSha256,
    scan_status: 'clean',
    scan_details: { engine: 'magic_byte_check', ip },
  }

  if (uploadType === 'coa') {
    await admin.from('coa_files').insert({
      user_id: authedUserId,
      uploader_id: authedUserId,
      listing_id: listingId,
      file_url: row.storage_path,
      storage_path: row.storage_path,
      hash: hashSha256,
      mime_type: mime,
      file_size_bytes: file.size,
      ip_address: ip,
    })
  } else {
    await admin.from('listing_files').insert(row)
  }

  await admin.from('security_events').insert({
    user_id: authedUserId,
    event_type: 'file_upload_validated',
    severity: 'info',
    ip_address: ip,
    details: { hash_sha256: hashSha256, mime, upload_type: uploadType },
  })

  return json({ ok: true, hash_sha256: hashSha256, scan_status: 'clean' })
})
