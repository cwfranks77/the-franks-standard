<script setup>
import { BC_BRAND } from '~/utils/bcBrand.js'
import { getBcSupport } from '~/utils/bcSupport.js'

definePageMeta({ layout: 'bc-audio' })

const config = useRuntimeConfig()
const support = computed(() => getBcSupport(config))

useSeoMeta({
  title: `SMS Consent — ${BC_BRAND.full}`,
  description: 'How B&C Performance Audio obtains consent before sending text messages about orders and support.',
})
</script>

<template>
  <div class="bc-sms">
    <div class="bc-sms__inner">
      <p class="bc-sms__eyebrow">SMS &amp; Text Messaging</p>
      <h1>How we ask permission before texting you</h1>
      <p class="bc-sms__lead">
        {{ BC_BRAND.full }} (a division of The Franks Standard LLC) may send text messages about your
        <strong>order status</strong>, <strong>shipping updates</strong>, and <strong>support requests</strong>
        only after you give permission on a phone call.
      </p>

      <section class="bc-sms__card">
        <h2>Verbal opt-in (phone)</h2>
        <p>
          When you call our toll-free support line at
          <a :href="`tel:${support.phoneTel}`">{{ support.phoneDisplay }}</a>,
          our agent may ask:
        </p>
        <blockquote class="bc-sms__script">
          “May we send text messages to this mobile number about your order or support request?
          Message and data rates may apply. Reply STOP to opt out and HELP for help.”
        </blockquote>
        <p>
          <strong>We only send SMS after you clearly say yes.</strong>
          We do not send marketing or promotional texts without separate written consent.
        </p>
      </section>

      <section class="bc-sms__card">
        <h2>Message details</h2>
        <ul>
          <li><strong>Brand:</strong> B&amp;C Performance Audio (The Franks Standard LLC)</li>
          <li><strong>Frequency:</strong> A few messages per order or support case — not recurring marketing blasts.</li>
          <li><strong>Cost:</strong> Message and data rates may apply.</li>
          <li><strong>Opt out:</strong> Reply <strong>STOP</strong> to any message to unsubscribe.</li>
          <li><strong>Help:</strong> Reply <strong>HELP</strong> or call {{ support.phoneDisplay }}.</li>
        </ul>
      </section>

      <section class="bc-sms__card">
        <h2>Privacy</h2>
        <p>
          Mobile phone numbers collected for order and support texts are used only to communicate about your
          request. We do not sell or share mobile information with third parties for their marketing purposes.
          See our <NuxtLink to="/privacy">Privacy Policy</NuxtLink> and
          <NuxtLink to="/terms">Terms of Service</NuxtLink>.
        </p>
      </section>

      <p class="bc-sms__back">
        <NuxtLink to="/bc-audio">← Back to B&amp;C storefront</NuxtLink>
        · <NuxtLink to="/bc-audio/open-door">Open Door</NuxtLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.bc-sms { padding: 2.5rem 1.25rem 4rem; color: #e8e8e8; }
.bc-sms__inner { max-width: 720px; margin: 0 auto; }
.bc-sms__eyebrow {
  font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase;
  color: #ff5252; margin: 0 0 0.5rem;
}
.bc-sms h1 { font-size: 1.75rem; margin: 0 0 1rem; color: #fff; }
.bc-sms__lead { line-height: 1.65; color: #b0b0b0; margin-bottom: 1.5rem; }
.bc-sms__card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 82, 82, 0.25);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1rem;
}
.bc-sms__card h2 { font-size: 1.1rem; color: #ff5252; margin: 0 0 0.75rem; }
.bc-sms__card p, .bc-sms__card li { line-height: 1.6; color: #c8c8c8; font-size: 0.95rem; }
.bc-sms__card ul { margin: 0; padding-left: 1.25rem; }
.bc-sms__card a { color: #ff5252; }
.bc-sms__script {
  margin: 1rem 0;
  padding: 1rem 1.25rem;
  border-left: 3px solid #d32f2f;
  background: rgba(0, 0, 0, 0.35);
  color: #f5f5f5;
  font-style: italic;
  line-height: 1.55;
}
.bc-sms__back { margin-top: 1.5rem; font-size: 0.9rem; }
.bc-sms__back a { color: #ff5252; }
</style>
