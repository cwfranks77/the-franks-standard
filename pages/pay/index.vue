<template>
  <div class="container pay-page">
    <div class="pay-hero">
      <h1>Pay &amp; fees</h1>
      <p class="lede text-muted">
        All payments run through <strong>Stripe</strong> — secure checkout with major cards, Apple Pay, and Google Pay.
        Each button below opens a live Stripe Payment Link.
      </p>
      <div class="pay-quick-links">
        <NuxtLink to="/pricing" class="btn btn-outline btn-sm">See pricing plans</NuxtLink>
        <NuxtLink to="/launch-offer" class="btn btn-outline btn-sm">Launch offer</NuxtLink>
        <NuxtLink to="/join/founders10" class="btn btn-outline btn-sm">Founding sellers</NuxtLink>
        <NuxtLink to="/honor" class="btn btn-outline btn-sm">Honor program</NuxtLink>
        <a href="https://dashboard.stripe.com/" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Stripe Dashboard</a>
      </div>
    </div>

    <TransactionReadinessBanner :show-owner-link="isOwner" />

    <PromoCodePanel v-if="!isOwner" program="honors" />
    <PromoCodePanel v-if="!isOwner" program="founding" />

    <div v-if="isOwner" class="pay-owner-banner">
      <span class="pay-owner-badge">Owner mode</span>
      <div>
        <p><strong>All fees are waived for you.</strong> These links are for buyers and regular sellers.</p>
      </div>
    </div>

    <p v-if="proWaived" class="pro-waived-banner" role="status">
      <strong>{{ profileLabel }}:</strong> your Pro plan is covered until {{ proWaivedUntil }}.
      You do not need to pay the monthly Pro subscription during this period.
    </p>

    <PaymentLinksPanel
      intro="Click any button to pay — you will be taken to Stripe checkout. Links are tested and active."
      :show-status="true"
      :hide-keys="proWaived ? ['pro'] : []"
    />

    <p class="text-muted fine text-center">
      We never store your full card number. Escrow rules are in
      <NuxtLink to="/how-it-works">How it works</NuxtLink>.
      Questions? Call <a href="tel:+18778370527">(877) 837-0527</a>.
    </p>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })
useSeoMeta({
  title: 'Pay and fees - The Franks Standard',
  description: 'Pay listing fees, Pro seller plan, order deposits, and dispute fees via secure Stripe checkout.',
})

const { isOwner } = useOwnerMode()
const supabase = useSupabaseClient()
const proWaived = ref(false)
const proWaivedUntil = ref('')
const profileLabel = ref('Pro member')

function formatDate (iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}

onMounted(async () => {
  if (isOwner.value) return
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { data: profile } = await supabase
    .from('profiles')
    .select('founding_seller, honors_member, pro_free_until')
    .eq('id', user.id)
    .maybeSingle()
  if ((profile?.founding_seller || profile?.honors_member) && profile?.pro_free_until) {
    const until = new Date(profile.pro_free_until)
    if (until > new Date()) {
      proWaived.value = true
      proWaivedUntil.value = formatDate(profile.pro_free_until)
      profileLabel.value = profile.honors_member ? 'Honors member' : 'Founding seller'
    }
  }
})
</script>

<style scoped>
.pay-page { padding: 2.5rem 0 3.5rem; }
.pay-hero { max-width: 720px; margin-bottom: 2rem; }
.pay-hero h1 { font-size: 1.85rem; margin-bottom: 0.5rem; color: #111827; }
.pay-quick-links { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.lede { font-size: 1.02rem; line-height: 1.7; }
.lede strong { color: #111827; }
.fine { font-size: 0.85rem; margin-top: 2rem; }
.fine a { color: var(--gold); font-weight: 600; }
.pay-owner-banner {
  display: flex; flex-wrap: wrap; align-items: flex-start; gap: 12px;
  margin-bottom: 1.5rem; padding: 18px 20px;
  border-radius: var(--radius-lg, 12px);
  border: 2px solid rgba(0, 245, 160, 0.35);
  background: linear-gradient(135deg, rgba(0, 245, 160, 0.08), rgba(201, 168, 76, 0.06));
  color: #111827; line-height: 1.6;
}
.pro-waived-banner {
  margin-bottom: 1.25rem;
  padding: 14px 18px;
  border-radius: var(--radius-lg, 12px);
  border: 1px solid rgba(4, 120, 87, 0.35);
  background: rgba(4, 120, 87, 0.08);
  color: #047857;
  font-size: 0.95rem;
  line-height: 1.55;
}
.pay-owner-badge {
  display: inline-flex; align-items: center;
  padding: 4px 12px; border-radius: 999px;
  font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;
  background: rgba(201, 168, 76, 0.18); color: var(--gold); border: 1px solid rgba(201, 168, 76, 0.4);
  white-space: nowrap;
}
</style>
