<template>
  <div class="auth-page">
    <div class="auth-card">
      <img src="/img/TFS-logo.png?v=20260724d" alt="" class="auth-logo" role="presentation" @error="onAuthLogoError" />
      <template v-if="registeredPending">
        <h1>Check your inbox</h1>
        <p class="text-muted">
          We sent a confirmation link to <strong>{{ email }}</strong>. Open it on this device to finish setting up your account.
        </p>
        <p class="text-muted fine">
          Check spam and All Mail. Confirmation mail comes from <strong>info@thefranksstandard.com</strong>.
          Still nothing after 10 minutes?
          <a href="mailto:info@thefranksstandard.com?subject=Signup%20confirmation%20help">Email support</a> or call <a href="tel:+18778370527">(877) 837-0527</a>.
        </p>
        <p v-if="emailHint" class="form-err email-hint" role="status">{{ emailHint }}</p>
        <NuxtLink to="/auth/login" class="btn btn-primary mt-2" style="width: 100%;">Go to sign in</NuxtLink>
      </template>
      <template v-else>
      <h1>Join The Franks Standard</h1>
      <p class="text-muted">Create your free account to buy and sell</p>

      <div v-if="promoBanner" class="promo-banner" role="status">
        <strong>Founding seller offer:</strong> first 10 sellers get 3 months Pro free.
        <span v-if="spotsRemaining !== null"> — <strong>{{ spotsRemaining }}</strong> spots left.</span>
      </div>
      <div v-if="honorBanner" class="promo-banner honor-banner" role="status">
        <strong>Honors program:</strong> thank you for your service — 6 months of Pro free when you sell on our marketplace.
      </div>

      <p v-if="formError" class="form-err" role="alert">{{ formError }}</p>

      <form @submit.prevent="handleRegister" class="mt-3">
        <div class="form-group">
          <label class="label">Full Name</label>
          <input class="input" v-model="fullName" placeholder="Charles Franks" autocomplete="name" required />
        </div>
        <div class="form-group">
          <label class="label">Email</label>
          <input class="input" type="email" v-model="email" placeholder="you@example.com" autocomplete="email" required />
        </div>
        <div class="form-group">
          <label class="label">Password</label>
          <input class="input" type="password" v-model="password" placeholder="At least 8 characters" autocomplete="new-password" minlength="8" required />
        </div>
        <div class="form-group">
          <label class="label">Promo code <span class="optional">(optional)</span></label>
          <input class="input" v-model="promoCode" :placeholder="promoPlaceholder" autocomplete="off" />
          <p v-if="promoBanner" class="promo-hint text-muted">Limited to 10 redemptions — one per person.</p>
        </div>
        <div v-if="honorBanner" class="form-group">
          <label class="label">I serve as</label>
          <select v-model="serviceCategory" class="select" required>
            <option value="">Select your service</option>
            <option v-for="c in SERVICE_CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="label">I want to...</label>
          <select class="select" v-model="accountType" required>
            <option value="">Select account type</option>
            <option value="buyer">Buy items</option>
            <option value="sell">Sell items</option>
            <option value="both">Buy &amp; sell items</option>
          </select>
        </div>

        <label class="terms-check">
          <input type="checkbox" v-model="agreeTerms" required />
          <span>I agree to the <NuxtLink to="/terms">Terms of Service</NuxtLink>, <NuxtLink to="/marketplace-policy">Marketplace Policies</NuxtLink>, and <NuxtLink to="/privacy">Privacy Policy</NuxtLink></span>
        </label>

        <p v-if="accountType === 'sell' || accountType === 'both'" class="seller-policy-note text-muted small">
          Sellers: after sign-in you must complete a <strong>digital signature</strong> (full legal name) for all seller policies on
          <NuxtLink to="/sell/start">Sell</NuxtLink> before your first listing, import, or dropship publish.
        </p>

        <button type="submit" class="btn btn-primary mt-2" style="width: 100%;" :disabled="loading">
          {{ loading ? 'Creating Account...' : 'Create Free Account' }}
        </button>
      </form>

      <p class="auth-help text-muted">
        Trouble creating your account?
        <a href="mailto:info@thefranksstandard.com?subject=Account%20signup%20help">Email support</a>
        or call <a href="tel:+18778370527">(877) 837-0527</a>.
      </p>

      <p class="auth-footer text-muted mt-3">
        Already have an account? <NuxtLink to="/auth/login">Sign In</NuxtLink>
      </p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { FOUNDING_PROMO_CODE } from '~/utils/foundingPromo.js'
import {
  HONOR_PROMO_CODE,
  SERVICE_CATEGORIES,
  getPendingHonorCategory,
  savePendingHonorCategory,
} from '~/utils/honorPromo.js'
import { syncSignupAttributionToProfile } from '~/utils/syncSignupAttribution.js'

const route = useRoute()
const { savePendingPromo, fetchAvailability, redeemCode } = usePromoCode()
const { captureFromRoute, getSignupMetadataFields } = useOutreachAttribution()

import { LIST_ITEM_START_PATH } from '~/utils/listItemRoutes.js'

function postRegisterPath (type) {
  if (type === 'sell' || type === 'seller') return LIST_ITEM_START_PATH
  if (type === 'both') return '/dashboard'
  return '/dashboard'
}

const promoCode = ref('')
const promoBanner = ref(false)
const honorBanner = ref(false)
const spotsRemaining = ref(null)
const serviceCategory = ref('')
const promoPlaceholder = computed(() =>
  honorBanner.value ? HONOR_PROMO_CODE : 'FOUNDERS10, HONOR26, or CREATOR'
)

onMounted(async () => {
  useGuestOnly()
  captureFromRoute(route)
  const qPromo = String(route.query.promo || '').trim().toUpperCase()
  const qAccount = String(route.query.account || '').trim().toLowerCase()
  const qHonor = String(route.query.honor || getPendingHonorCategory() || '').trim().toLowerCase()
  if (qPromo) {
    promoCode.value = qPromo
    savePendingPromo(qPromo)
    promoBanner.value = qPromo === FOUNDING_PROMO_CODE
    honorBanner.value = qPromo === HONOR_PROMO_CODE
  }
  if (qAccount === 'sell') accountType.value = 'sell'
  if (honorBanner.value && qHonor && SERVICE_CATEGORIES.some((c) => c.value === qHonor)) {
    serviceCategory.value = qHonor
    savePendingHonorCategory(qHonor)
  }
  if (promoBanner.value) {
    const avail = await fetchAvailability('founders10')
    if (avail) spotsRemaining.value = avail.remaining
  }
})

function onAuthLogoError (e) {
  const el = e?.target
  if (el && !el.dataset?.logoFallback) {
    el.dataset.logoFallback = '1'
    el.src = '/logo.svg'
  }
}

function authSiteUrl () {
  if (import.meta.client && typeof window !== 'undefined') {
    const { hostname, protocol, host } = window.location
    if (hostname && !/localhost|127\.0\.0\.1/i.test(hostname)) {
      return protocol + '//' + host
    }
  }
  const cfg = String(useRuntimeConfig().public?.siteUrl || '').trim().replace(/\/$/, '')
  if (cfg && !/localhost|127\.0\.0\.1/i.test(cfg)) return cfg
  return 'https://thefranksstandard.com'
}

const fullName = ref('')
const email = ref('')
const password = ref('')
const accountType = ref('')
const agreeTerms = ref(false)
const loading = ref(false)
const formError = ref('')
const registeredPending = ref(false)
const emailHint = ref('')

async function handleRegister() {
  formError.value = ''
  loading.value = true
  try {
    const supabase = useSupabaseClient()
    const site = authSiteUrl()
    const emailTrimmed = email.value.trim().toLowerCase()
    const { data, error } = await supabase.auth.signUp({
      email: emailTrimmed,
      password: password.value,
      options: {
        emailRedirectTo: `${site}/auth/verify`,
        data: {
          full_name: fullName.value,
          account_type: accountType.value,
          pending_promo: promoCode.value ? promoCode.value.trim().toUpperCase() : null,
          service_category: serviceCategory.value || null,
          honor_category: serviceCategory.value || null,
          ...getSignupMetadataFields(),
        },
      },
    })
    if (error) {
      throw error
    }
    if (promoCode.value) savePendingPromo(promoCode.value)
    if (data.user && !data.session) {
      registeredPending.value = true
      const confirmed = data.user.email_confirmed_at || data.user.confirmed_at
      const identities = data.user.identities?.length ?? 0
      if (!confirmed && identities === 0) {
        emailHint.value =
          'If you do not receive mail within 10 minutes, check spam or contact info@thefranksstandard.com or (877) 837-0527.'
      }
      return
    }
    if (data.session) {
      const { data: { user: sessionUser } } = await supabase.auth.getUser()
      await syncSignupAttributionToProfile(supabase, sessionUser)
      if (promoCode.value) {
        const code = promoCode.value.trim().toUpperCase()
        const extra = honorBanner.value && serviceCategory.value
          ? { service_category: serviceCategory.value }
          : {}
        if (code !== 'STORE90' && code !== 'CREATOR') {
          await redeemCode(code, extra).catch(() => {})
        }
      }
    }
    await navigateTo(postRegisterPath(accountType.value))
  } catch (err) {
    const msg = err?.message || ''
    if (/already registered|already been registered|user already exists/i.test(msg)) {
      formError.value = 'That email already has an account. Sign in below, or use Resend confirmation on the sign-in page.'
    } else if (/rate limit|too many requests|email.*limit/i.test(msg)) {
      formError.value = 'Too many emails sent. Wait about an hour, then use Sign in → Resend confirmation email.'
    } else if (/not authorized|error sending confirmation/i.test(msg)) {
      formError.value =
        'Supabase cannot email this address until you set up custom SMTP (Authentication → SMTP) or add your Gmail to your Supabase organization team.'
    } else if (/network|fetch failed|failed to fetch|timed out/i.test(msg)) {
      formError.value = 'Network issue while creating your account. Check connection, then try again.'
    } else {
      formError.value = msg || 'Registration failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
}
.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  text-align: center;
}
.fine { font-size: 0.88rem; margin-top: 16px; }
.form-err {
  color: #7f1d1d;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 8px;
  text-align: left;
  line-height: 1.45;
}
.auth-logo { max-width: 220px; width: 100%; height: auto; max-height: 100px; object-fit: contain; margin-bottom: 20px; border-radius: 6px; }
.auth-card h1 {
  font-size: 1.5rem;
  margin-bottom: 4px;
  color: #111827;
  font-weight: 800;
}
.auth-card > p.text-muted {
  color: #374151 !important;
  font-weight: 600;
  font-size: 0.95rem;
}
.auth-footer {
  font-size: 0.9rem;
  color: #374151;
  font-weight: 600;
}
.auth-help {
  margin-top: 12px;
  font-size: 0.88rem;
  line-height: 1.5;
  text-align: left;
  color: #374151 !important;
  font-weight: 600;
}
.auth-help a {
  color: #b45309;
  font-weight: 700;
}
.terms-check {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 0.88rem;
  color: #1f2937;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  margin-bottom: 8px;
}
.terms-check input { margin-top: 3px; accent-color: var(--gold); }
.terms-check a {
  color: #146eb4;
  font-weight: 700;
}
.email-hint { margin-top: 12px; line-height: 1.5; color: #7f1d1d; font-weight: 600; }
.promo-banner {
  margin: 12px 0 0;
  padding: 12px 14px;
  text-align: left;
  font-size: 0.92rem;
  line-height: 1.55;
  font-weight: 600;
  background: rgba(201, 168, 76, 0.15);
  border: 1px solid rgba(201, 168, 76, 0.45);
  border-radius: 8px;
  color: #111827;
}
.promo-banner strong {
  color: #111827;
  font-weight: 800;
}
.promo-hint {
  font-size: 0.85rem;
  margin-top: 6px;
  text-align: left;
  color: #374151 !important;
  font-weight: 700;
}
.honor-banner {
  background: rgba(37, 99, 235, 0.12);
  border-color: rgba(37, 99, 235, 0.35);
  color: #111827;
}
.optional {
  font-weight: 600;
  color: #6b7280;
}
.fine {
  color: #374151 !important;
  font-weight: 600;
}
</style>
