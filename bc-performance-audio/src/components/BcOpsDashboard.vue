<script setup>
import { getBcStorefrontPath } from '~/utils/bcSupport.js'

const emit = defineEmits(['go'])

const props = defineProps({
  pendingAccounts: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
})

const storefrontPath = computed(() => getBcStorefrontPath())

const tools = [
  { id: 'website', icon: '🌐', title: 'Edit website', desc: 'Headline, ribbon, header text, colors, Google preview' },
  { id: 'homepage', icon: '📝', title: 'Homepage text', desc: 'Ribbon, main headline, intro paragraph' },
  { id: 'seo', icon: '🔍', title: 'SEO & social', desc: 'Google title, description, share image' },
  { id: 'theme', icon: '🎨', title: 'Colors & theme', desc: 'Red accents, background, publish for all visitors' },
  { id: 'inventory', icon: '📦', title: 'Inventory & pricing', desc: 'Petra wholesale catalog and retail prices' },
  { id: 'store', icon: '➕', title: 'Manual products', desc: 'Extra products you add by hand' },
  { id: 'catalog', icon: '👁', title: 'Hide catalog items', desc: 'Remove items from the live website' },
  { id: 'accounts', icon: '👤', title: 'Customer accounts', desc: 'Approve shoppers before they can checkout' },
  { id: 'activity', icon: '💰', title: 'Sales & activity', desc: 'Order totals, tax reserve, Stripe links' },
  { id: 'orders', icon: '🧾', title: 'Recent orders', desc: 'Dropship orders and tracking' },
  { id: 'ledger', icon: '🏦', title: 'Transactions & tax', desc: '25% LA tax reserve, Mercury, Stripe revenue' },
  { id: 'monitor', icon: '📊', title: 'Traffic & activity', desc: 'Errors, orders, signups, audit log' },
  { id: 'disputes', icon: '⚖️', title: 'Disputes', desc: 'Buyer protection and refunds' },
  { id: 'auctions', icon: '🔨', title: 'Auctions', desc: 'Competition gear auctions' },
  { id: 'payouts', icon: '💳', title: 'Seller payouts', desc: 'Stripe Connect transfers' },
  { id: 'app', icon: '📱', title: 'B&C app', desc: 'Android and Windows download links' },
  { id: 'tools', icon: '🔧', title: 'Fix problems', desc: 'Cache, sign-out, quick links' },
]

function open (id) {
  emit('go', id)
}
</script>

<template>
  <div class="bc-dash">
    <div class="bc-dash__stats">
      <div class="bc-dash__stat">
        <span class="bc-dash__label">Orders loaded</span>
        <strong>{{ orderCount }}</strong>
      </div>
      <div class="bc-dash__stat">
        <span class="bc-dash__label">Accounts waiting approval</span>
        <strong :class="{ warn: pendingAccounts > 0 }">{{ pendingAccounts }}</strong>
      </div>
    </div>

    <p class="bc-dash__intro">Every owner tool is listed below. Tap a card to open that section.</p>

    <div class="bc-dash__grid">
      <button
        v-for="t in tools"
        :key="t.id"
        type="button"
        class="bc-dash__card"
        @click.stop.prevent="open(t.id)"
      >
        <span class="bc-dash__icon">{{ t.icon }}</span>
        <strong>{{ t.title }}</strong>
        <span class="bc-dash__desc">{{ t.desc }}</span>
      </button>
    </div>

    <div class="bc-dash__links">
      <NuxtLink to="/bc-audio/ops/marketing-automation" class="btn btn-primary btn-sm">Marketing automation ↗</NuxtLink>
      <NuxtLink :to="storefrontPath" class="btn btn-outline btn-sm" target="_blank">Preview storefront ↗</NuxtLink>
      <NuxtLink to="/bc-audio/account" class="btn btn-outline btn-sm" target="_blank">Customer account page ↗</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.bc-dash__stats { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 1rem; }
.bc-dash__stat {
  padding: 12px 16px; border-radius: 10px; border: 1px solid rgba(211,47,47,0.25);
  background: rgba(211,47,47,0.08); min-width: 140px;
}
.bc-dash__label { display: block; font-size: 0.68rem; text-transform: uppercase; color: #9ca3af; margin-bottom: 4px; }
.bc-dash__stat strong { font-size: 1.4rem; color: #ff5252; }
.bc-dash__stat strong.warn { color: #ffd814; }
.bc-dash__intro { color: #b8bcc6; font-size: 0.9rem; margin: 0 0 14px; line-height: 1.5; }
.bc-dash__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 1rem;
}
.bc-dash__card {
  text-align: left;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  background: #121216;
  color: #f5f5f7;
  cursor: pointer;
  touch-action: manipulation;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 110px;
}
.bc-dash__card:hover { border-color: #ff5252; background: rgba(211,47,47,0.08); }
.bc-dash__icon { font-size: 1.2rem; }
.bc-dash__card strong { font-size: 0.88rem; color: #ff5252; }
.bc-dash__desc { font-size: 0.75rem; color: #9ca3af; line-height: 1.4; }
.bc-dash__links { display: flex; flex-wrap: wrap; gap: 8px; }
</style>
