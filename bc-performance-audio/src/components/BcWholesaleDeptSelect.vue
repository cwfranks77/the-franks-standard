<script setup>
import { BC_AUDIO_DEPARTMENTS } from '~/utils/bcAudioOnlyCatalog.js'
import { isBcPowerAudioPrimarySite } from '~/utils/bcPrimarySite.js'

const route = useRoute()
const config = useRuntimeConfig()
const bcPrimarySite = computed(() => isBcPowerAudioPrimarySite(config.public.siteUrl))
const storeHomePath = computed(() => (bcPrimarySite.value ? '/' : '/bc-audio'))

const departments = [
  { key: 'showroom', label: 'All audio departments', category: '' },
  ...BC_AUDIO_DEPARTMENTS.filter((d) => d.key !== 'all').map((d) => ({
    key: d.query,
    label: d.label.replace(/^[^\s]+\s/, ''),
    category: departmentCategory(d.key),
  })),
]

function departmentCategory (key) {
  // Must match bcProductShelfCategory labels used by the catalog grid.
  if (key === 'home') return 'Receivers & Home Theater'
  if (key === 'car') return 'Car Audio'
  if (key === 'powersports') return 'Marine & Powersports Audio'
  if (key === 'bluetooth') return 'Bluetooth & Portable'
  return ''
}

const selected = computed({
  get () {
    const dept = String(route.query.dept || 'showroom')
    return departments.some((d) => d.key === dept) ? dept : 'showroom'
  },
  set (key) {
    if (!key || key === 'showroom') {
      navigateTo({ path: storeHomePath.value, query: {} })
      return
    }
    const homePaths = new Set([storeHomePath.value, '/bc-audio', '/bc-audio/'])
    if (homePaths.has(route.path)) {
      navigateTo({ path: storeHomePath.value, query: { dept: key } })
      return
    }
    const dept = departments.find((d) => d.key === key)
    if (dept?.category) {
      navigateTo(`/bc-audio/catalog?category=${encodeURIComponent(dept.category)}`)
    }
  },
})

function onPick (event) {
  selected.value = event.target.value
}
</script>

<template>
  <label class="bc-dept">
    <span class="bc-dept__sr">Audio department</span>
    <select
      :value="selected"
      class="bc-dept__select"
      @change="onPick"
    >
      <option
        v-for="dept in departments"
        :key="dept.key"
        :value="dept.key"
      >
        {{ dept.label }}
      </option>
    </select>
  </label>
</template>

<style scoped>
.bc-dept { display: block; }
.bc-dept__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}
.bc-dept__select {
  max-width: 13rem;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #121216;
  color: #f5f5f7;
  font: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
}
.bc-dept__select:focus {
  outline: none;
  border-color: rgba(211, 47, 47, 0.55);
}
@media (max-width: 480px) {
  .bc-dept__select { max-width: 100%; font-size: 0.68rem; }
}
</style>
