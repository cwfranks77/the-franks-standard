<template>
  <div class="site-qa-page">
    <div class="container">
      <p class="eyebrow">Owner toolkit</p>
      <h1>Full site QA</h1>
      <p class="lead text-muted">
        Tests every public route, shortcut, and ops page for HTTP errors and known broken bundles.
        Run after deploy — then run checkout smoke on
        <NuxtLink to="/ops/test-checkout">Checkout QA</NuxtLink>
        and follow
        <code>docs/POST-DEPLOY-TRIPLE-TEST.md</code>.
      </p>

      <div class="qa-toolbar card">
        <p class="text-muted small">Base URL: <strong>{{ siteBase() }}</strong></p>
        <div class="btn-row">
          <button type="button" class="btn btn-primary" :disabled="running" @click="runAllRoutes()">
            {{ running ? `Testing ${results.length} routes…` : 'Run all route checks' }}
          </button>
          <button type="button" class="btn btn-outline btn-sm" :disabled="running" @click="runAllRoutes('trust')">
            Legal/trust only
          </button>
          <button type="button" class="btn btn-outline btn-sm" :disabled="running" @click="runAllRoutes('ops')">
            Ops pages only
          </button>
        </div>
        <p v-if="lastRunAt" class="summary">
          Last run: {{ lastRunAt }} —
          <span class="pass">{{ passCount }} pass</span>,
          <span class="warn">{{ warnCount }} warn</span>,
          <span class="fail">{{ failCount }} fail</span>
        </p>
      </div>

      <section v-for="(routes, group) in groupedResults" :key="group" class="card panel">
        <h2>{{ groupLabels[group] || group }}</h2>
        <table class="qa-table">
          <thead>
            <tr><th>Route</th><th>Label</th><th>Status</th><th>Note</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in routes" :key="r.path" :class="r.status">
              <td><code>{{ r.path }}</code></td>
              <td>{{ r.label }}</td>
              <td><span class="pill" :class="r.status">{{ r.status }}</span></td>
              <td class="note">{{ r.message }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="card panel">
        <h2>Manual UI checklist (every button)</h2>
        <p class="text-muted small">Automated checks cannot click forms. After routes pass, verify in browser:</p>
        <ul class="manual-list">
          <li><strong>Nav:</strong> Features &amp; Settings menus, mobile quick tiles, footer columns, trust chips</li>
          <li><strong>Sell:</strong> Policy signature gate → direct/dropship toggle → publish (draft)</li>
          <li><strong>Import:</strong> CSV upload UI, import selected (draft)</li>
          <li><strong>Listing:</strong> Buy now, bid, report authenticity, COA verify link</li>
          <li><strong>Auth:</strong> Register, login, logout, dashboard links</li>
          <li><strong>Ops:</strong> Panel buttons, authenticity scan, refunds dry-run</li>
        </ul>
      </section>

      <p class="text-muted small">
        <NuxtLink to="/ops/panel">← Ops panel</NuxtLink> ·
        <NuxtLink to="/ops/test-checkout">Checkout QA</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { SITE_ROUTE_GROUPS } from '~/utils/siteRoutes.js'

definePageMeta({ middleware: 'ops-auth' })

const groupLabels = SITE_ROUTE_GROUPS

const {
  results,
  running,
  lastRunAt,
  passCount,
  failCount,
  warnCount,
  siteBase,
  runAllRoutes,
} = useSiteQaAudit()

const groupedResults = computed(() => {
  const map = {}
  for (const r of results.value) {
    if (!map[r.group]) map[r.group] = []
    map[r.group].push(r)
  }
  return map
})
</script>

<style scoped>
.site-qa-page { padding: 40px 0 80px; }
.lead { max-width: 42rem; line-height: 1.6; }
.qa-toolbar { padding: 20px; margin-bottom: 24px; }
.btn-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
.summary { margin-top: 12px; font-size: 0.9rem; }
.pass { color: #059669; font-weight: 700; }
.warn { color: #d97706; font-weight: 700; }
.fail { color: #dc2626; font-weight: 700; }
.panel { padding: 16px; margin-bottom: 20px; }
.qa-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.qa-table th, .qa-table td { border: 1px solid #e5e7eb; padding: 8px 10px; text-align: left; }
.qa-table th { background: #f9fafb; }
.pill { text-transform: uppercase; font-size: 0.7rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; }
.pill.pass { background: #d1fae5; color: #065f46; }
.pill.fail { background: #fee2e2; color: #991b1b; }
.pill.warn { background: #fef3c7; color: #92400e; }
.pill.pending, .pill.running { background: #f3f4f6; color: #6b7280; }
.note { color: #6b7280; font-size: 0.8rem; }
.manual-list { line-height: 1.65; font-size: 0.9rem; }
code { font-size: 0.8em; }
</style>
