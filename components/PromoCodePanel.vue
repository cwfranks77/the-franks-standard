<template>
  <section class="promo-panel card" :class="'promo-panel--' + program">
    <div class="card-body">
      <h2 class="promo-title">{{ cfg.title }}</h2>
      <p class="promo-intro text-muted">{{ cfg.intro }}</p>

      <p v-if="cfg.showSpots && availability && !availabilityLoading" class="promo-spots" role="status">
        <span v-if="availability.sold_out" class="sold-out">All {{ cfg.maxUses }} spots are claimed.</span>
        <span v-else><strong>{{ availability.remaining }}</strong> of {{ availability.max_uses }} spots left</span>
      </p>

      <div v-if="program === 'honors' && !benefitActive" class="form-group honor-cat-row">
        <label class="label" for="promo-honor-cat">I serve as</label>
        <select id="promo-honor-cat" v-model="serviceCategory" class="select">
          <option value="">Select service</option>
          <option v-for="c in SERVICE_CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
        </select>
      </div>

      <p v-if="benefitActive" class="promo-active">
        <template v-if="program === 'honors'">
          <strong>Honors member</strong> ({{ serviceLabel }}) — Pro free until {{ formatDate(proFreeUntil) }}.
        </template>
        <template v-else>
          You have <strong>Pro free</strong> until {{ formatDate(proFreeUntil) }}.
        </template>
      </p>

      <form v-else class="promo-form" @submit.prevent="apply">
        <input
          v-model="codeInput"
          class="input"
          type="text"
          :placeholder="cfg.placeholder"
          autocomplete="off"
          :disabled="applying || !signedIn"
        />
        <button type="submit" class="btn btn-primary btn-sm" :disabled="applyDisabled">
          {{ applying ? 'Applying…' : 'Apply code' }}
        </button>
      </form>

      <p v-if="!signedIn" class="promo-signin text-muted">
        <NuxtLink :to="registerPath">Create an account</NuxtLink>
        or <NuxtLink to="/auth/login">sign in</NuxtLink> to apply your code.
      </p>
      <p v-if="message" class="promo-msg" :class="messageType" role="status">{{ message }}</p>
    </div>
  </section>
</template>

<script setup>
import { FOUNDING_PROMO_CODE, FOUNDING_PROMO_MAX, foundingPromoRegisterPath } from '~/utils/foundingPromo.js'
import {
  HONOR_PROMO_CODE,
  SERVICE_CATEGORIES,
  honorPromoRegisterPath,
  getPendingHonorCategory,
  savePendingHonorCategory,
  clearPendingHonorCategory,
} from '~/utils/honorPromo.js'

const props = defineProps({
  program: { type: String, default: 'founding' },
  slug: { type: String, default: '' },
})

const PROGRAMS = {
  founding: {
    slug: 'founders10',
    code: FOUNDING_PROMO_CODE,
    maxUses: FOUNDING_PROMO_MAX,
    title: 'Founding seller promo',
    intro: 'First 10 sellers get 3 months Pro free. One redemption per person.',
    placeholder: 'FOUNDERS10',
    showSpots: true,
    registerPath: foundingPromoRegisterPath(),
  },
  honors: {
    slug: 'honor-heroes',
    code: HONOR_PROMO_CODE,
    maxUses: null,
    title: 'Honors program — veterans & first responders',
    intro: 'Active and retired military, police, fire, EMS, dispatch, and corrections: 6 months Pro free. Code of honor applies.',
    placeholder: 'HONOR26',
    showSpots: false,
    registerPath: honorPromoRegisterPath(),
  },
}

const program = computed(() => (props.program === 'honors' ? 'honors' : 'founding'))
const cfg = computed(() => PROGRAMS[program.value])
const slug = computed(() => props.slug || cfg.value.slug)

const supabase = useSupabaseClient()
const { fetchAvailability, redeemCode, getPendingPromo, clearPendingPromo } = usePromoCode()

const codeInput = ref(cfg.value.code)
const serviceCategory = ref(getPendingHonorCategory() || '')
const applying = ref(false)
const message = ref('')
const messageType = ref('')
const availability = ref(null)
const availabilityLoading = ref(true)
const signedIn = ref(false)
const benefitActive = ref(false)
const proFreeUntil = ref(null)

const registerPath = computed(() =>
  program.value === 'honors'
    ? honorPromoRegisterPath(serviceCategory.value || undefined)
    : cfg.value.registerPath
)

const serviceLabel = computed(() => {
  const hit = SERVICE_CATEGORIES.find((c) => c.value === serviceCategory.value)
  return hit ? hit.label : 'Service member'
})

const applyDisabled = computed(() => {
  if (applying.value || !signedIn.value || !codeInput.value.trim()) return true
  if (program.value === 'honors' && !serviceCategory.value) return true
  return false
})

function formatDate (iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}

async function loadProfile () {
  const { data: { user } } = await supabase.auth.getUser()
  signedIn.value = !!user
  if (!user) return
  const { data: profile } = await supabase
    .from('profiles')
    .select('founding_seller, honors_member, pro_free_until, seller_tier, promo_code_used, service_category')
    .eq('id', user.id)
    .maybeSingle()
  if (profile?.service_category) serviceCategory.value = profile.service_category
  const until = profile?.pro_free_until ? new Date(profile.pro_free_until) : null
  if (until && until > new Date()) {
    if (program.value === 'honors' && profile?.honors_member) {
      benefitActive.value = true
      proFreeUntil.value = profile.pro_free_until
    }
    if (program.value === 'founding' && profile?.founding_seller) {
      benefitActive.value = true
      proFreeUntil.value = profile.pro_free_until
    }
  }
}

async function apply () {
  message.value = ''
  messageType.value = ''
  applying.value = true
  try {
    const extra = program.value === 'honors'
      ? { service_category: serviceCategory.value }
      : {}
    const result = await redeemCode(codeInput.value, extra)
    if (result.error) {
      messageType.value = 'err'
      if (result.error === 'sold_out') message.value = result.message || 'This promo is no longer available.'
      else if (result.error === 'already_used') message.value = 'This account already used this promo.'
      else if (result.error === 'service_category_required') message.value = result.message
      else if (result.error === 'not_signed_in') message.value = result.message
      else if (result.error === 'invalid_code') message.value = 'That promo code is not valid.'
      else message.value = result.message || 'Could not apply code. Try again.'
      return
    }
    if (getPendingPromo().toUpperCase() === codeInput.value.trim().toUpperCase()) clearPendingPromo()
    clearPendingHonorCategory()
    benefitActive.value = true
    proFreeUntil.value = result.pro_free_until
    if (result.service_category) serviceCategory.value = result.service_category
    messageType.value = 'ok'
    const months = result.months || (program.value === 'honors' ? 6 : 3)
    message.value = result.already_redeemed
      ? 'You already redeemed this code — your benefits remain active.'
      : `Thank you for your service. ${months} months of Pro free until ${formatDate(result.pro_free_until)}.`
    if (cfg.value.showSpots) availability.value = await fetchAvailability(slug.value)
  } finally {
    applying.value = false
  }
}

onMounted(async () => {
  const pending = getPendingPromo()
  if (pending && pending.toUpperCase() === cfg.value.code) codeInput.value = pending
  if (cfg.value.showSpots) {
    availability.value = await fetchAvailability(slug.value)
  }
  availabilityLoading.value = false
  await loadProfile()
  const pendingMatch = pending && pending.toUpperCase() === cfg.value.code
  if (signedIn.value && pendingMatch && !benefitActive.value) {
    if (program.value !== 'honors' || serviceCategory.value) await apply()
  }
})
</script>

<style scoped>
.promo-panel { margin-bottom: 1.5rem; border: 1px solid rgba(201, 168, 76, 0.35); }
.promo-panel--honors { border-color: rgba(147, 197, 253, 0.4); }
.promo-title { font-size: 1.15rem; margin: 0 0 8px; color: #111827; }
.promo-intro { font-size: 0.92rem; line-height: 1.55; margin: 0 0 12px; }
.promo-spots { font-size: 0.9rem; margin: 0 0 12px; font-weight: 600; }
.promo-spots .sold-out { color: #b45309; }
.honor-cat-row { margin-bottom: 12px; }
.promo-active {
  padding: 12px 14px; border-radius: 8px;
  background: rgba(4, 120, 87, 0.08); border: 1px solid rgba(4, 120, 87, 0.25);
  color: #047857; font-size: 0.95rem; margin: 0;
}
.promo-panel--honors .promo-active {
  background: rgba(37, 99, 235, 0.08); border-color: rgba(37, 99, 235, 0.25); color: #1d4ed8;
}
.promo-form { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.promo-form .input { flex: 1; min-width: 180px; max-width: 280px; text-transform: uppercase; }
.promo-signin { font-size: 0.88rem; margin-top: 10px; }
.promo-msg { margin-top: 12px; font-size: 0.9rem; font-weight: 600; padding: 10px 12px; border-radius: 8px; }
.promo-msg.ok { color: #047857; background: #ecfdf5; border: 1px solid #a7f3d0; }
.promo-msg.err { color: #7f1d1d; background: #fef2f2; border: 1px solid #fecaca; }
</style>