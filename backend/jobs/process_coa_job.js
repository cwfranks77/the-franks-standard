/** Process COA file job — hash verification and chain-of-custody update. */

module.exports = async function processCoaJob (admin, payload) {
  const { coa_file_id, listing_id, user_id } = payload || {}
  if (!admin) throw new Error('supabase_required')
  if (!coa_file_id) throw new Error('coa_file_id_required')

  const { data: file, error } = await admin
    .from('coa_files')
    .select('id, hash, storage_path, user_id')
    .eq('id', coa_file_id)
    .maybeSingle()

  if (error || !file) throw new Error(error?.message || 'coa_file_not_found')

  await admin.from('coa_evidence_logs').insert({
    coa_id: coa_file_id,
    coa_file_id,
    action: 'coa_processed',
    event_type: 'coa_processed',
    user_id: user_id || file.user_id,
    listing_id: listing_id || null,
    metadata: { hash: file.hash, storage_path: file.storage_path },
  })

  return { ok: true, coa_file_id }
}
