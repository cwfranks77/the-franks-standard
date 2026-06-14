<template>
  <div class="page top-sellers-page">
    <div class="container">
      <header class="page-head">
        <p class="eyebrow">{{ program.shortName }}</p>
        <h1>{{ program.name }}</h1>
        <p class="lead text-muted">{{ program.tagline }}</p>
        <p class="cycle text-muted">
          <strong>{{ program.cycleLabel }}</strong> we crown the top sellers and apply fee rewards for
          {{ program.rewards[0].durationDays }} days.
        </p>
      </header>

      <section class="rewards-grid">
        <article v-for="r in program.rewards" :key="r.rank" class="reward-card card">
          <span class="reward-rank">#{{ r.rank }}</span>
          <h2>{{ r.title }}</h2>
          <p class="reward-fee">{{ r.feeDiscount }}</p>
          <ul>
            <li v-for="(p, i) in r.perks" :key="i">{{ p }}</li>
          </ul>
        </article>
      </section>

      <section class="card scoring-card">
        <h2>How we score the cycle</h2>
        <ul>
          <li v-for="(s, i) in program.scoring" :key="i">{{ s }}</li>
        </ul>
        <h3 class="mt">Rules</h3>
        <ul class="rules">
          <li v-for="(r, i) in program.rules" :key="i">{{ r }}</li>
        </ul>
      </section>

      <section class="leaderboard-section">
        <h2>Current leaderboard</h2>
        <p v-if="loading" class="text-muted">Loading…</p>
        <p v-else-if="error" class="text-muted">{{ error }}</p>
        <div v-else class="leader-table-wrap card">
          <table v-if="leaders.length" class="leader-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Seller</th>
                <th>Sales</th>
                <th>Rating</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in leaders" :key="row.seller_id">
                <td class="rank-cell">#{{ row.rank }}</td>
                <td>
                  <span v-if="row.excellence_badge" class="badge-pill">{{ row.excellence_badge }}</span>
                  {{ row.display_name }}
                </td>
                <td>{{ row.completed_sales }}</td>
                <td>
                  <template v-if="row.review_count">
                    {{ Number(row.rating_avg).toFixed(1) }}★ ({{ row.review_count }})
                  </template>
                  <span v-else class="text-muted">—</span>
                </td>
                <td>
                  <NuxtLink
                    v-if="row.store_slug"
                    :to="`/store/${row.store_slug}`"
                    class="link-sm"
                  >Store</NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="text-muted pad">No qualifying sellers yet. Complete sales and collect reviews to appear here.</p>
        </div>
      </section>

      <section class="tools-cta card">
        <h2>Tools for every seller</h2>
        <p class="text-muted">
          Before you list high-value inventory, use our curated appraiser and comp links.
        </p>
        <NuxtLink to="/seller-tools" class="btn btn-primary btn-sm">Open seller tools</NuxtLink>
      </section>
    </div>
  </div>
</template>

<script setup>
import { EXCELLENCE_PROGRAM } from '~/utils/sellerExcellenceProgram.js'

definePageMeta({ layout: 'default' })
const program = EXCELLENCE_PROGRAM
const { loading, error, leaders, load } = useSellerLeaderboard()

useSeoMeta({
  title: 'Top sellers & Seller Excellence | The Franks Standard',
  description:
    'Every six months top sellers earn featured placement and reduced platform fees based on sales volume and buyer reviews.',
})

onMounted(() => load(12))
</script>

<style scoped>
.top-sellers-page { padding: 40px 16px 100px; }
.page-head { max-width: 720px; margin-bottom: 2rem; }
.eyebrow {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--gold, #f7ca00);
  font-weight: 700;
}
.lead { line-height: 1.6; margin-top: 0.5rem; }
.cycle { margin-top: 0.75rem; }
.rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}
.reward-card { padding: 1.25rem; }
.reward-rank {
  font-size: 2rem;
  font-weight: 800;
  color: var(--gold, #f7ca00);
}
.reward-fee { font-weight: 700; color: #86efac; margin: 8px 0; }
.reward-card ul { margin: 0; padding-left: 1.1rem; color: #9ca3af; font-size: 0.9rem; }
.scoring-card { padding: 1.5rem; margin-bottom: 2rem; }
.scoring-card h2 { color: var(--gold, #f7ca00); font-size: 1.1rem; }
.scoring-card h3.mt { margin-top: 1.25rem; font-size: 1rem; }
.scoring-card ul { line-height: 1.65; color: #d1d5db; }
.rules { color: #9ca3af; font-size: 0.92rem; }
.leaderboard-section h2 { margin-bottom: 1rem; }
.leader-table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
.leader-table th, .leader-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #374151; }
.rank-cell { font-weight: 800; color: var(--gold, #f7ca00); }
.badge-pill {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-right: 6px;
  color: #047857;
}
.link-sm { color: #93c5fd; }
.pad { padding: 1.5rem; }
.tools-cta { padding: 1.5rem; margin-top: 2rem; }
.tools-cta h2 { font-size: 1.1rem; color: var(--gold, #f7ca00); margin-bottom: 0.5rem; }
</style>
