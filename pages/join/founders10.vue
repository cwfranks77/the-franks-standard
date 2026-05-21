<template>
  <div class="min-h-screen bg-stone-50 text-stone-900">
    <div class="mx-auto max-w-lg px-4 py-12 sm:py-16">
      <p class="text-sm font-medium uppercase tracking-wide text-amber-800">
        Limited offer
      </p>
      <h1 class="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
        Founding seller program
      </h1>
      <p class="mt-4 text-lg text-stone-600">
        The first <strong>10 people</strong> who create a seller account get
        <strong>3 months of Pro free</strong> — no subscription fee during that period.
      </p>

      <div
        v-if="!loading"
        class="mt-8 rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
      >
        <p class="text-sm text-stone-500">
          Spots remaining
        </p>
        <p class="mt-1 text-4xl font-semibold tabular-nums" :class="soldOut ? 'text-stone-400' : 'text-emerald-700'">
          {{ soldOut ? '0' : remaining }}
          <span class="text-lg font-normal text-stone-500">/ 10</span>
        </p>
        <p v-if="soldOut" class="mt-3 text-sm text-amber-800">
          All founding spots are claimed. You can still sell on the marketplace with a free Starter account.
        </p>
        <p v-else class="mt-3 text-sm text-stone-600">
          Use promo code <code class="rounded bg-stone-100 px-2 py-0.5 font-mono text-sm">{{ FOUNDING_PROMO_CODE }}</code>
          when you register or at checkout.
        </p>
      </div>
      <div v-else class="mt-8 h-32 animate-pulse rounded-xl bg-stone-200" />

      <div class="mt-8 flex flex-col gap-3 sm:flex-row">
        <NuxtLink
          v-if="!soldOut"
          :to="registerHref"
          class="inline-flex items-center justify-center rounded-lg bg-stone-900 px-6 py-3 text-center font-medium text-white hover:bg-stone-800"
        >
          Claim your spot — sign up to sell
        </NuxtLink>
        <NuxtLink
          v-else
          to="/auth/register?account=sell"
          class="inline-flex items-center justify-center rounded-lg border border-stone-300 bg-white px-6 py-3 text-center font-medium hover:bg-stone-50"
        >
          Create seller account
        </NuxtLink>
        <NuxtLink
          to="/sell"
          class="inline-flex items-center justify-center rounded-lg border border-stone-300 px-6 py-3 text-center font-medium hover:bg-stone-100"
        >
          Learn about selling
        </NuxtLink>
      </div>

      <ul class="mt-10 space-y-2 text-sm text-stone-600">
        <li>One redemption per person — duplicate accounts won’t get extra free months.</li>
        <li>Link and code stop working after 10 successful redemptions.</li>
        <li>Pro features unlock immediately after you verify email and redeem.</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { FOUNDING_PROMO_CODE, foundingPromoRegisterPath } from '~/utils/foundingPromo.js'

const { fetchAvailability } = usePromoCode()
const availability = ref(null)
const loading = ref(true)

onMounted(async () => {
  availability.value = await fetchAvailability('founders10')
  loading.value = false
})

const remaining = computed(() => availability.value?.remaining ?? null)
const soldOut = computed(() => availability.value?.sold_out === true)
const registerHref = foundingPromoRegisterPath()

useSeoMeta({
  title: 'Founding sellers — 3 months Pro free | The Franks Standard',
  description: 'First 10 people to sign up and sell get 3 months of Pro free. Limited spots.',
})
</script>
