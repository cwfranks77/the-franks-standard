/**
 * COA chain-of-custody gatherer for reporting packages.
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} userId
 */
async function fetchCoaChainForUser (admin, userId) {
  const { data: logs } = await admin
    .from('coa_evidence_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(200)

  const { data: files } = await admin
    .from('coa_files')
    .select('*, coa_hashes(hash_sha256), coa_listing_links(listing_id, certificate_id)')
    .eq('uploader_id', userId)
    .limit(100)

  return { evidence_logs: logs ?? [], files: files ?? [] }
}

module.exports = { fetchCoaChainForUser }
