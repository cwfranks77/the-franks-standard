<template>
  <div class="honor-page">
    <div class="container">
      <div class="honor-hero text-center">
        <span class="honor-tag">With gratitude</span>
        <h1>Honor Our Heroes</h1>
        <p class="text-muted lead">
          Veterans, law enforcement, firefighters, EMS, dispatchers, and first responders keep our communities safe.
          The Franks Standard salutes your service with meaningful seller benefits on our marketplace.
        </p>
      </div>

      <div class="honor-grid">
        <article v-for="card in serviceCards" :key="card.key" class="honor-card">
          <span class="honor-icon" aria-hidden="true">{{ card.icon }}</span>
          <h3>{{ card.title }}</h3>
          <p>{{ card.body }}</p>
        </article>
      </div>

      <section class="benefits-box">
        <h2 class="section-title text-center">What you receive</h2>
        <ul class="benefits-list">
          <li><strong>6 months of Pro Seller free</strong> — unlimited listings, featured placement, AI Store Builder</li>
          <li><strong>Honors badge</strong> on your seller profile — we recognize your service category</li>
          <li><strong>Priority support</strong> — dedicated help line at (877) 837-0527</li>
          <li><strong>Same listing standards</strong> — seller proof on collectibles; Platform facilitation and enforcement</li>
        </ul>
        <p class="honor-code text-center">
          Use promo code <code>{{ HONOR_PROMO_CODE }}</code> when you register or on the Pay &amp; fees page.
        </p>
      </section>

      <section class="claim-box">
        <h2 class="text-center">Claim your honors benefits</h2>
        <p class="text-muted text-center">Select your service, then create a free seller account. One redemption per person.</p>
        <div class="claim-form">
          <label class="label" for="honor-cat">I serve as</label>
          <select id="honor-cat" v-model="selectedCategory" class="select">
            <option value="">Choose your service</option>
            <option v-for="c in SERVICE_CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
          <NuxtLink
            :to="registerHref"
            class="btn btn-primary btn-lg"
            :class="{ disabled: !selectedCategory }"
            :aria-disabled="!selectedCategory"
            @click="onClaimClick"
          >
            Sign up to sell — honors pricing
          </NuxtLink>
        </div>
        <p class="fine text-muted text-center">
          Offer is extended in good faith to active, retired, and honorably discharged service members and career first responders.
          Misuse may result in account review. Questions? <a href="mailto:info@thefranksstandard.com">info@thefranksstandard.com</a>
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
import {
  HONOR_PROMO_CODE,
  SERVICE_CATEGORIES,
  honorPromoRegisterPath,
  savePendingHonorCategory,
} from '~/utils/honorPromo.js'
import { usePromoCode } from '~/composables/usePromoCode.js'

const { savePendingPromo } = usePromoCode()
const selectedCategory = ref('')

const serviceCards = [
  { key: 'veteran', icon: '🇺🇸', title: 'Military Veterans', body: 'Active duty, Guard, Reserve, and honorably discharged veterans who served our nation.' },
  { key: 'police', icon: '🛡️', title: 'Law Enforcement', body: 'Police officers, deputies, state troopers, and federal agents who protect our streets.' },
  { key: 'fire', icon: '🚒', title: 'Firefighters', body: 'Career and volunteer firefighters who run toward danger when others run away.' },
  { key: 'ems', icon: '🚑', title: 'EMS & Paramedics', body: 'Emergency medical professionals who save lives on the worst days.' },
  { key: 'dispatcher', icon: '📡', title: '911 Dispatchers', body: 'The calm voice on the line — coordinating help when seconds count.' },
  { key: 'corrections', icon: '⚖️', title: 'Corrections', body: 'Corrections officers maintaining safety and order behind the walls.' },
]

const registerHref = computed(() => honorPromoRegisterPath(selectedCategory.value || undefined))

function onClaimClick (e) {
  if (!selectedCategory.value) {
    e.preventDefault()
    return
  }
  savePendingPromo(HONOR_PROMO_CODE)
  savePendingHonorCategory(selectedCategory.value)
}

onMounted(() => {
  savePendingPromo(HONOR_PROMO_CODE)
  const route = useRoute()
  const q = String(route.query.honor || '').trim().toLowerCase()
  if (q && SERVICE_CATEGORIES.some((c) => c.value === q)) selectedCategory.value = q
})

useSeoMeta({
  title: 'Honor Our Heroes — Veterans & First Responders | The Franks Standard',
  description: '6 months Pro free for veterans, police, firefighters, EMS, and first responders who sell on The Franks Standard.',
})
</script>

<style scoped>
.honor-page { padding: 40px 0 80px; }
.honor-hero { margin-bottom: 40px; max-width: 760px; margin-left: auto; margin-right: auto; }
.honor-hero h1 { font-size: 2.4rem; margin: 12px 0 10px; color: var(--stone-50); }
.lead { font-size: 1.08rem; line-height: 1.7; }
.honor-tag {
  display: inline-block; padding: 5px 14px; border-radius: 999px;
  font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.25), rgba(201, 168, 76, 0.2));
  color: #93c5fd; border: 1px solid rgba(147, 197, 253, 0.35);
}
.honor-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 48px;
}
@media (max-width: 900px) { .honor-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 550px) { .honor-grid { grid-template-columns: 1fr; } }
.honor-card {
  padding: 22px 18px; border: 1px solid var(--stone-800); border-radius: var(--radius-lg);
  background: var(--stone-900); text-align: center;
}
.honor-card:hover { border-color: rgba(147, 197, 253, 0.45); }
.honor-icon { font-size: 2rem; display: block; margin-bottom: 10px; }
.honor-card h3 { font-size: 1rem; margin-bottom: 8px; color: var(--gold); }
.honor-card p { font-size: 0.85rem; color: var(--stone-400); line-height: 1.55; margin: 0; }
.benefits-box {
  padding: 36px 28px; border-radius: var(--radius-lg);
  border: 1px solid rgba(147, 197, 253, 0.25);
  background: linear-gradient(135deg, rgba(30, 58, 138, 0.15), rgba(18, 8, 32, 0.9));
  margin-bottom: 40px;
}
.benefits-list {
  max-width: 640px; margin: 20px auto; padding: 0; list-style: none;
}
.benefits-list li {
  padding: 10px 0 10px 28px; position: relative; color: var(--stone-200); line-height: 1.55;
}
.benefits-list li::before {
  content: ''; position: absolute; left: 0; top: 16px; width: 10px; height: 10px;
  border-radius: 50%; background: var(--gold);
}
.honor-code code {
  padding: 4px 10px; border-radius: 6px; background: rgba(201, 168, 76, 0.15);
  color: var(--gold); font-weight: 700;
}
.claim-box {
  padding: 36px 24px; border: 2px solid var(--gold); border-radius: var(--radius-lg);
  background: linear-gradient(135deg, rgba(201, 168, 76, 0.06), rgba(18, 8, 32, 0.95));
  max-width: 520px; margin: 0 auto;
}
.claim-form { display: flex; flex-direction: column; gap: 14px; margin-top: 20px; }
.claim-form .btn.disabled { pointer-events: none; opacity: 0.5; }
.fine { font-size: 0.82rem; margin-top: 20px; line-height: 1.5; }
.fine a { color: var(--gold); font-weight: 600; }
</style>