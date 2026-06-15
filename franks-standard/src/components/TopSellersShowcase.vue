<template>
  <section class="top-sellers-section section" aria-labelledby="top-sellers-heading">
    <div class="container">
      <div class="top-sellers-head">
        <div>
          <p class="eyebrow">Seller Excellence</p>
          <h2 id="top-sellers-heading">Top sellers this cycle</h2>
          <p class="text-muted lede">
            Sellers with the most completed sales and positive buyer feedback rise here.
            Every {{ cycleMonths }} months we reward the leaders with
            <strong>reduced or waived platform fees</strong> for 30 days.
          </p>
        </div>
        <NuxtLink to="/top-sellers" class="btn btn-outline btn-sm">Program details</NuxtLink>
      </div>

      <p v-if="loading" class="text-muted">Loading leaderboard…</p>
      <p v-else-if="error" class="text-muted">{{ error }}</p>

      <div v-else-if="leaders.length" class="leader-grid">
        <article
          v-for="row in leaders"
          :key="row.seller_id"
          class="leader-card card"
        >
          <span class="leader-rank">#{{ row.rank }}</span>
          <span v-if="row.excellence_badge" class="leader-badge">{{ row.excellence_badge }}</span>
          <h3 class="leader-name">{{ row.display_name }}</h3>
          <ul class="leader-stats">
            <li><strong>{{ row.completed_sales }}</strong> sales</li>
            <li v-if="row.review_count">
              <strong>{{ Number(row.rating_avg).toFixed(1) }}</strong>★
              ({{ row.review_count }} reviews)
            </li>
            <li v-else class="text-muted">Awaiting reviews</li>
          </ul>
          <NuxtLink
            v-if="row.store_slug"
            :to="`/store/${row.store_slug}`"
            class="btn btn-primary btn-sm"
          >Visit store</NuxtLink>
          <NuxtLink v-else to="/browse" class="btn btn-outline btn-sm">Browse listings</NuxtLink>
        </article>
      </div>

      <div v-else class="leader-empty card">
        <p class="text-muted">
          Leaderboard fills as sales complete. Be the first —
          <NuxtLink to="/sell/start">list an item</NuxtLink>
          and earn your spot.
        </p>
      </div>

      <div class="reward-strip">
        <span v-for="r in rewards" :key="r.rank" class="reward-pill">
          #{{ r.rank }} {{ r.title }}: {{ r.feeDiscount }} ({{ r.durationDays }} days)
        </span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { EXCELLENCE_CYCLE_MONTHS, EXCELLENCE_PROGRAM } from '~/utils/sellerExcellenceProgram.js'

const { loading, error, leaders, load } = useSellerLeaderboard()
const cycleMonths = EXCELLENCE_CYCLE_MONTHS
const rewards = EXCELLENCE_PROGRAM.rewards

onMounted(() => load(3))
</script>

<style scoped>
.top-sellers-section {
  background: linear-gradient(180deg, rgba(247, 202, 0, 0.06) 0%, transparent 100%);
}
.top-sellers-head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.eyebrow {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--gold, #f7ca00);
  font-weight: 700;
}
.lede { max-width: 52ch; line-height: 1.55; margin-top: 0.5rem; }
.leader-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}
.leader-card {
  padding: 1.25rem;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.leader-rank {
  font-size: 2rem;
  font-weight: 800;
  color: var(--gold, #f7ca00);
  line-height: 1;
}
.leader-badge {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #047857;
  letter-spacing: 0.06em;
}
.leader-name { font-size: 1.1rem; margin: 0; }
.leader-stats {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.88rem;
  color: #9ca3af;
}
.leader-stats strong { color: #e5e7eb; }
.leader-empty { padding: 1.5rem; text-align: center; }
.reward-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 1.25rem;
}
.reward-pill {
  font-size: 0.78rem;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(247, 202, 0, 0.35);
  background: rgba(247, 202, 0, 0.08);
  color: #fde68a;
}
</style>
