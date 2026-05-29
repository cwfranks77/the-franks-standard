<template>
  <div class="auth-ops-page">
    <div class="container">
      <p class="eyebrow">Owner toolkit</p>
      <h1>Authenticity &amp; counterfeit enforcement</h1>
      <p class="lead text-muted">
        Automated risk scan, buyer reports, and one-click actions: suspend listing, confirm counterfeit, ban seller.
        Franks COAs use year-scoped serials (<code>FS-2026-000001</code>) — verify at <code>/verify/coa/[serial]</code>.
      </p>

      <section class="card panel">
        <div class="panel-head">
          <h2>Run full integrity scan</h2>
          <button type="button" class="btn btn-primary btn-sm" :disabled="busy" @click="runScanAll">
            {{ busy ? 'Scanning…' : 'Scan all published listings' }}
          </button>
        </div>
        <p class="text-muted small">Flags replica language, graded claims without COA, coin/sneaker/watch risk patterns. Updates <code>integrity_status</code> on each listing.</p>
        <p v-if="lastError" class="error-text">{{ lastError }}</p>
      </section>

      <section class="card panel">
        <h2>Review queue ({{ queue.flagged?.length || 0 }} listings)</h2>
        <button type="button" class="btn btn-outline btn-sm mb-2" :disabled="busy" @click="refreshQueue">Refresh queue</button>
        <div v-if="!queue.flagged?.length" class="text-muted">No flagged listings.</div>
        <div v-for="item in queue.flagged" :key="item.id" class="queue-row">
          <div>
            <strong>{{ item.title }}</strong>
            <p class="text-muted small">{{ item.category }} · score {{ item.integrity_score }} · {{ item.integrity_status }}</p>
            <p v-for="f in (item.integrity_flags || []).slice(0, 3)" :key="f.id" class="flag-tag">{{ f.label }}</p>
          </div>
          <div class="queue-actions">
            <NuxtLink :to="`/listing/${item.id}`" class="btn btn-outline btn-sm">View</NuxtLink>
            <button type="button" class="btn btn-outline btn-sm" @click="clearListing(item.id)">Clear</button>
            <button type="button" class="btn btn-outline btn-sm" @click="suspendListing(item.id)">Suspend</button>
            <button type="button" class="btn btn-primary btn-sm danger" @click="confirmFake(item)">Confirm fake + ban</button>
          </div>
        </div>
      </section>

      <section class="card panel">
        <h2>Open reports ({{ queue.reports?.length || 0 }})</h2>
        <div v-for="r in queue.reports" :key="r.id" class="queue-row">
          <div>
            <strong>{{ r.reason }}</strong>
            <p class="text-muted small">{{ r.details.slice(0, 120) }}{{ r.details.length > 120 ? '…' : '' }}</p>
            <p class="text-muted small">Listing: <NuxtLink :to="`/listing/${r.listing_id}`">{{ r.listing_id }}</NuxtLink></p>
          </div>
          <div class="queue-actions">
            <button type="button" class="btn btn-outline btn-sm" @click="dismissReport(r.id)">Dismiss</button>
            <button type="button" class="btn btn-primary btn-sm danger" @click="confirmFake({ id: r.listing_id }, r.id)">Confirm fake + ban</button>
          </div>
        </div>
      </section>

      <p class="text-muted small">
        <NuxtLink to="/ops/panel">← Ops panel</NuxtLink> ·
        <NuxtLink to="/ops/refunds">Forced buyer refunds</NuxtLink> ·
        <code>docs/AUTHENTICITY-INTEGRITY.md</code>
      </p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'ops-auth' })

const { busy, lastError, callOps } = useIntegrityOps()
const queue = ref({ flagged: [], reports: [] })

async function refreshQueue () {
  const data = await callOps('list_queue')
  if (data) queue.value = { flagged: data.flagged || [], reports: data.reports || [] }
}

async function runScanAll () {
  await callOps('scan_all')
  await refreshQueue()
}

async function suspendListing (listingId) {
  if (!confirm('Suspend this listing (archive + integrity suspended)?')) return
  await callOps('suspend_listing', { listing_id: listingId })
  await refreshQueue()
}

async function clearListing (listingId) {
  await callOps('clear_listing', { listing_id: listingId })
  await refreshQueue()
}

async function confirmFake (item, reportId = '') {
  const notes = window.prompt('Resolution notes (optional):', 'Proven counterfeit — permanent ban per policy.')
  if (notes === null) return
  if (!confirm('Confirm counterfeit, remove listing, and PERMANENTLY ban seller?')) return
  await callOps('confirm_counterfeit', {
    listing_id: item.id,
    report_id: reportId || undefined,
    notes: notes || undefined,
    ban_reason: 'Proven counterfeit / misrepresentation',
  })
  await refreshQueue()
}

async function dismissReport (reportId) {
  await callOps('dismiss_report', { report_id: reportId })
  await refreshQueue()
}

onMounted(refreshQueue)

useSeoMeta({ title: 'Ops — Authenticity enforcement' })
</script>

<style scoped>
.auth-ops-page { padding: 40px 0 80px; }
.eyebrow { font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: #92400e; }
.lead { max-width: 42rem; line-height: 1.6; }
.panel { padding: 20px; margin-bottom: 20px; }
.panel-head { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; }
.queue-row {
  display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between;
  padding: 14px 0; border-bottom: 1px solid #e5e7eb;
}
.queue-actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-start; }
.flag-tag { font-size: 0.75rem; background: #fef3c7; padding: 2px 8px; border-radius: 4px; margin: 4px 4px 0 0; display: inline-block; }
.error-text { color: #b91c1c; font-weight: 600; }
.btn.danger { background: #b91c1c; border-color: #b91c1c; }
</style>
