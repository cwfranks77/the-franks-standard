<template>
  <section class="site-promo-offers" :class="{ 'site-promo-offers--compact': compact }" aria-label="Special offers">
    <div class="container">
      <header v-if="showHeading" class="site-promo-head">
        <h2 class="site-promo-title">Limited seller offers</h2>
        <p class="site-promo-lead">Use your code at registration or on the offer page. One benefit per account.</p>
      </header>
      <div class="site-promo-grid">
        <NuxtLink to="/join/founders10" class="site-promo-card site-promo-founding">
          <span class="site-promo-badge">First 10 sellers</span>
          <h3>3 months Pro — free</h3>
          <p>
            The first 10 people who sign up to sell get Pro free for 3 months: unlimited listings and featured placement.
          </p>
          <div class="site-promo-code" aria-label="Promo code FOUNDERS10">FOUNDERS10</div>
          <span v-if="foundingSpots != null" class="site-promo-spots">{{ foundingSpots }} of 10 spots left</span>
          <span class="site-promo-cta">Claim founding seller offer →</span>
        </NuxtLink>
        <NuxtLink to="/honor" class="site-promo-card site-promo-honor">
          <span class="site-promo-badge">Military &amp; first responders</span>
          <h3>6 months Pro — free</h3>
          <p>
            Veterans, active duty, Guard, Reserve, police, fire, EMS, dispatch, and corrections: 6 months Pro free when you sell.
          </p>
          <div class="site-promo-code" aria-label="Promo code HONOR26">HONOR26</div>
          <span class="site-promo-cta">Honor our heroes →</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  compact: { type: Boolean, default: false },
  showHeading: { type: Boolean, default: true },
})

const { fetchAvailability } = usePromoCode()
const foundingSpots = ref(null)

onMounted(async () => {
  const avail = await fetchAvailability('founders10')
  if (avail?.remaining != null) foundingSpots.value = avail.remaining
})
</script>

<style scoped>
.site-promo-offers {
  padding: 28px 0 36px;
}
.site-promo-offers--compact {
  padding: 0;
}
.site-promo-head {
  text-align: center;
  max-width: 640px;
  margin: 0 auto 20px;
}
.site-promo-title {
  font-size: 1.5rem;
  margin: 0 0 8px;
  color: #111827 !important;
  -webkit-text-fill-color: #111827 !important;
  font-family: 'Cinzel', serif;
}
.site-promo-lead {
  margin: 0;
  font-size: 0.95rem;
  color: #374151 !important;
  -webkit-text-fill-color: #374151 !important;
  font-weight: 600;
}
.site-promo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
}
.site-promo-card {
  display: flex;
  flex-direction: column;
  padding: 22px 24px;
  border-radius: var(--radius-lg);
  text-decoration: none;
  background: #0f172a;
  border: 2px solid rgba(201, 168, 76, 0.45);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.25);
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.site-promo-card:hover {
  transform: translateY(-3px);
  border-color: var(--gold);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.35);
}
.site-promo-founding {
  border-left: 4px solid #059669;
}
.site-promo-honor {
  border-left: 4px solid #2563eb;
}
.site-promo-badge {
  display: inline-block;
  align-self: flex-start;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 5px 11px;
  border-radius: 999px;
  margin-bottom: 12px;
  color: #fcd34d !important;
  -webkit-text-fill-color: #fcd34d !important;
  background: rgba(201, 168, 76, 0.15);
  border: 1px solid rgba(201, 168, 76, 0.5);
}
.site-promo-card h3 {
  font-size: 1.15rem;
  margin: 0 0 10px;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  font-family: 'Cinzel', serif;
}
.site-promo-card p {
  margin: 0 0 14px;
  flex: 1;
  font-size: 0.9rem;
  line-height: 1.55;
  color: #e5e7eb !important;
  -webkit-text-fill-color: #e5e7eb !important;
  font-weight: 600;
}
.site-promo-code {
  display: inline-block;
  align-self: flex-start;
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  padding: 10px 18px;
  margin-bottom: 10px;
  color: #fde68a !important;
  -webkit-text-fill-color: #fde68a !important;
  background: rgba(201, 168, 76, 0.18);
  border: 2px dashed rgba(201, 168, 76, 0.65);
  border-radius: 8px;
}
.site-promo-spots {
  font-size: 0.8rem;
  font-weight: 700;
  color: #6ee7b7 !important;
  -webkit-text-fill-color: #6ee7b7 !important;
  margin-bottom: 8px;
}
.site-promo-cta {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--gold) !important;
  -webkit-text-fill-color: var(--gold) !important;
}
.site-promo-offers--compact .site-promo-card {
  padding: 18px 20px;
}
.site-promo-offers--compact .site-promo-card h3 {
  font-size: 1.02rem;
}
.site-promo-offers--compact .site-promo-code {
  font-size: 1.1rem;
  padding: 8px 14px;
}
</style>
