<template>
  <div class="pay-links-panel">
    <p v-if="intro" class="pay-links-intro">{{ intro }}</p>
    <div class="grid grid-2 pay-links-grid">
      <article
        v-for="item in visibleLinks"
        :key="item.key"
        class="card pay-link-card"
      >
        <div class="card-body">
          <span class="badge badge-gold">{{ item.badge }}</span>
          <h3>{{ item.title }}</h3>
          <p class="pay-link-desc">{{ item.body }}</p>
          <p v-if="item.amountHint" class="pay-link-hint">{{ item.amountHint }}</p>
          <a
            v-if="item.url"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-primary btn-sm pay-link-btn"
          >
            Pay in Stripe →
          </a>
          <p v-else class="pay-link-missing" role="status">
            Link not configured. Set <code>{{ item.envName }}</code> in site settings.
          </p>
        </div>
      </article>
    </div>
    <p v-if="showStatus" class="pay-links-status" :class="{ ok: allConfigured }" role="status">
      {{ allConfigured ? 'All payment links are active and open Stripe checkout.' : `${configuredCount} of 4 payment links configured.` }}
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  intro: { type: String, default: '' },
  showStatus: { type: Boolean, default: true },
  hideKeys: { type: Array, default: () => [] },
})

const { links, allConfigured, configuredCount } = usePaymentLinks()

const visibleLinks = computed(() => {
  const hide = new Set(props.hideKeys || [])
  return links.value.filter((l) => !hide.has(l.key))
})
</script>

<style scoped>
.pay-links-intro { font-size: 0.95rem; color: #374151; line-height: 1.55; margin-bottom: 16px; font-weight: 600; }
.pay-links-grid { gap: 16px; }
.pay-link-card h3 { font-size: 1.05rem; margin: 8px 0 6px; color: #111827; }
.pay-link-desc { font-size: 0.9rem; color: #374151; line-height: 1.5; margin: 0; }
.pay-link-hint { font-size: 0.78rem; color: #6b7280; margin: 6px 0 10px; font-weight: 600; }
.pay-link-btn { margin-top: 4px; }
.pay-link-missing {
  font-size: 0.82rem; margin-top: 10px; padding: 8px 10px;
  background: rgba(255, 61, 92, 0.08); border: 1px solid rgba(255, 61, 92, 0.25);
  border-radius: 8px; color: #7f1d1d;
}
.pay-link-missing code { font-size: 0.78rem; }
.pay-links-status { margin-top: 14px; font-size: 0.88rem; font-weight: 700; color: #b45309; text-align: center; }
.pay-links-status.ok { color: #047857; }
</style>
