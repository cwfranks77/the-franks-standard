import { createClient } from 'npm:@supabase/supabase-js@2'
import { parse } from 'npm:csv-parse/sync'
import { requireUser } from '../_shared/adminAuth.ts'
import { corsHeaders, json } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

const CONDITIONS: Record<string, string> = {
  new: 'new',
  'new / sealed': 'new',
  sealed: 'new',
  nib: 'new',
  'like new': 'like-new',
  'like-new': 'like-new',
  excellent: 'excellent',
  used: 'good',
  'pre-owned': 'good',
  worn: 'fair',
  fair: 'fair',
  poor: 'fair',
}

function cleanPrice(rawPrice: unknown): number {
  const value = String(rawPrice ?? '').replace(/[^0-9.]/g, '')
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0
}

function normalizeCategory(ebayCat: unknown): string {
  const check = String(ebayCat ?? '').toLowerCase()
  if (check.includes('watch') || check.includes('jewelry')) return 'Watches & Jewelry'
  if (check.includes('game') || check.includes('console') || check.includes('nintendo')) return 'Vintage Electronics & Games'
  if (check.includes('pokemon') || check.includes('mtg') || check.includes('tcg')) return 'Trading Card Games (Pokemon, MTG, etc.)'
  if (check.includes('card') || check.includes('sports')) return 'Sports Cards & Memorabilia'
  if (check.includes('camera') || check.includes('photo') || check.includes('lens')) return 'Photography & Film Gear'
  if (check.includes('comic')) return 'Comics & Graphic Novels'
  if (check.includes('coin') || check.includes('currency')) return 'Coins & Currency'
  if (check.includes('shoe') || check.includes('sneaker') || check.includes('streetwear')) return 'Sneakers & Streetwear'
  return 'General Merchandise'
}

function normalizeCondition(ebayCond: unknown): string {
  const check = String(ebayCond ?? '').trim().toLowerCase()
  if (!check) return 'good'
  for (const [needle, value] of Object.entries(CONDITIONS)) {
    if (check.includes(needle)) return value
  }
  if (check.includes('refurbished') || check.includes('renewed')) return 'excellent'
  return 'good'
}

function pick(row: Record<string, unknown>, names: string[]): string {
  for (const name of names) {
    const value = String(row[name] ?? '').trim()
    if (value) return value
  }
  return ''
}

function buildDescription(row: Record<string, unknown>, title: string, imageUrl: string, sku: string): string {
  const original = pick(row, ['Description', 'Item description'])
  const lines = [
    original || `${title} - imported from an eBay migration file for review on The Franks Standard.`,
    '',
    'Migration notes',
    '- Imported as a draft so photos, COA/proof, shipping details, and final seller guarantee can be reviewed before publishing.',
  ]
  if (sku) lines.push(`- Source SKU/custom label: ${sku}`)
  if (imageUrl) lines.push(`- Original eBay image URL: ${imageUrl}`)
  return lines.join('\n')
}

function parseRows(csvText: string) {
  return parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as Record<string, unknown>[]
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

    const body = await req.json().catch(() => ({})) as {
      csvText?: string
      fileName?: string
      status?: string
    }
    const csvText = String(body.csvText ?? '').trim()
    if (!csvText) {
      return json({ error: 'csv_required' }, 400)
    }

    const rows = parseRows(csvText)
    if (rows.length === 0) {
      return json({ error: 'empty_csv' }, 400)
    }

    const status = 'draft'
    const errors: Array<{ row: number; error: string; title?: string }> = []
    const listings = []

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i]
      const rowNumber = i + 2
      const title = pick(row, ['Title', 'Item title', 'Item Title']) || 'Migrated eBay Listing'
      const rawPrice = pick(row, ['Start price', 'Price', 'Buy It Now price', 'Buy It Now Price'])
      const price = cleanPrice(rawPrice)
      if (price <= 0) {
        errors.push({ row: rowNumber, title, error: 'Price must be greater than zero.' })
        continue
      }

      const sku = pick(row, ['Custom label', 'Custom Label', 'SKU'])
      const itemNumber = pick(row, ['Item number', 'Item Number'])
      const imageUrl = pick(row, ['PicURL', 'Image URL', 'Image URL 1', 'Picture URL'])
      const sourceSku = sku || (itemNumber ? `EBAY-${itemNumber}` : `EBAY-MIGRATE-${crypto.randomUUID().slice(0, 8)}`)

      listings.push({
        seller_id: user.id,
        title: title.slice(0, 180),
        description: buildDescription(row, title, imageUrl, sourceSku),
        category: normalizeCategory(pick(row, ['Category name', 'Category Name', 'Category'])),
        price,
        condition: normalizeCondition(pick(row, ['Condition', 'Item condition'])),
        coa_type: 'guarantee',
        guarantee_signed: false,
        seller_legal_name: null,
        coa_storage_path: null,
        image_paths: [],
        status,
        sale_type: 'fixed',
        listing_mode: 'direct',
      })
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    await admin.from('profiles').upsert({
      id: user.id,
      full_name: String(user.user_metadata?.full_name ?? user.email ?? '').trim() || null,
      account_type: 'seller',
    }, { onConflict: 'id', ignoreDuplicates: true })

    const { data: inserted, error: insertError } = listings.length > 0
      ? await admin.from('listings').insert(listings).select('id, title, status, price, category')
      : { data: [], error: null }

    if (insertError) {
      return json({ error: 'import_failed', detail: insertError.message }, 500)
    }

    const insertedRows = inserted ?? []
    const batchStatus = errors.length > 0 ? 'completed_with_errors' : 'completed'
    const { data: batch } = await admin
      .from('listing_import_batches')
      .insert({
        seller_id: user.id,
        source: 'ebay_csv',
        file_name: String(body.fileName ?? '').trim() || null,
        status: batchStatus,
        total_rows: rows.length,
        inserted_count: insertedRows.length,
        skipped_count: errors.length,
        errors,
      })
      .select('id')
      .maybeSingle()

    return json({
      ok: true,
      batch_id: batch?.id ?? null,
      total_rows: rows.length,
      inserted_count: insertedRows.length,
      skipped_count: errors.length,
      status,
      listings: insertedRows,
      errors,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'import_failed'
    return json({ error: 'import_failed', detail: message }, 500)
  }
})
