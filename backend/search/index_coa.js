/**
 * Index COA files for hash and listing lookup.
 */

async function indexCoa (admin, { limit = 200 } = {}) {
  if (!admin) return { ok: false, error: 'admin_required' }

  const { data: files, error } = await admin
    .from('coa_files')
    .select('id, hash, hash_sha256, listing_id, user_id, uploader_id, coa_serial')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return { ok: false, error: error.message }

  const rows = (files ?? []).map((f) => ({
    coa_id: f.id,
    hash: String(f.hash || f.hash_sha256 || f.coa_serial || '').slice(0, 128),
    listing_id: f.listing_id,
    uploader_id: f.uploader_id || f.user_id,
    indexed_at: new Date().toISOString(),
  })).filter((r) => r.hash)

  if (!rows.length) return { ok: true, indexed: 0 }

  const { error: upsertErr } = await admin.from('search_index_coa').upsert(rows, { onConflict: 'coa_id' })
  if (upsertErr) return { ok: false, error: upsertErr.message }

  return { ok: true, indexed: rows.length }
}

module.exports = { indexCoa }
