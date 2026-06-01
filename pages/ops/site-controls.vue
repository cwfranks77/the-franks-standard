<template>
  <div class="ops-control-page">
    <div class="container narrow">
      <header class="tool-head">
        <p class="eyebrow">Owner controls</p>
        <h1>Site UI controls</h1>
        <p class="text-muted">
          Tune the site presentation from the owner room. These controls are browser-level so you can preview and operate the site quickly without redeploying.
        </p>
      </header>

      <section class="card">
        <h2>Look and feel</h2>
        <div class="form-grid">
          <label class="label" for="theme">Theme</label>
          <select id="theme" v-model="controls.theme" class="input" @change="save">
            <option value="standard">Standard</option>
            <option value="high-contrast">High contrast</option>
            <option value="black-gold">Black and gold</option>
          </select>

          <label class="label" for="density">Density</label>
          <select id="density" v-model="controls.density" class="input" @change="save">
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>

          <label class="label" for="textSize">Text size</label>
          <select id="textSize" v-model="controls.textSize" class="input" @change="save">
            <option value="normal">Normal</option>
            <option value="large">Large</option>
          </select>
        </div>
      </section>

      <section class="card">
        <h2>Homepage sections</h2>
        <p class="text-muted small">Hide noisy homepage sections while you review or demo the site.</p>
        <div class="toggle-list">
          <label v-for="toggle in toggles" :key="toggle.key" class="toggle-row">
            <input v-model="controls[toggle.key]" type="checkbox" @change="save" />
            <span>
              <strong>{{ toggle.label }}</strong>
              <small>{{ toggle.help }}</small>
            </span>
          </label>
        </div>
      </section>

      <section class="card">
        <h2>Operations</h2>
        <div class="actions">
          <button type="button" class="btn btn-outline" @click="reset">Reset controls</button>
          <button type="button" class="btn btn-outline" @click="copyConfig">Copy config JSON</button>
          <NuxtLink to="/" class="btn btn-primary">Preview homepage</NuxtLink>
          <NuxtLink to="/ops/site-qa" class="btn btn-outline">Run route QA</NuxtLink>
        </div>
        <p v-if="copied" class="status-ok">{{ copied }}</p>
      </section>

      <div class="actions footer-actions">
        <NuxtLink to="/ops/panel" class="btn btn-outline">Back to operator console</NuxtLink>
        <NuxtLink to="/dashboard" class="btn btn-outline">Dashboard</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default', middleware: 'ops-auth' })
useSeoMeta({ title: 'Site UI controls - The Franks Standard', robots: 'noindex, nofollow' })

const STORAGE_KEY = 'tfs_site_controls_v1'
const defaults = {
  theme: 'standard',
  density: 'comfortable',
  textSize: 'normal',
  reduceMotion: false,
  hideFounderBar: false,
  hideActivityTicker: false,
  hideAppPromo: false,
  hideLiveNow: false,
  hideProofStrip: false,
}

const toggles = [
  { key: 'reduceMotion', label: 'Reduce animation', help: 'Turns down motion for demos or accessibility.' },
  { key: 'hideFounderBar', label: 'Hide founder bar', help: 'Temporarily removes the open-door banner.' },
  { key: 'hideActivityTicker', label: 'Hide activity ticker', help: 'Removes the scrolling promise strip.' },
  { key: 'hideAppPromo', label: 'Hide app download promo', help: 'Useful if app links are not ready.' },
  { key: 'hideLiveNow', label: 'Hide live-now feature grid', help: 'Simplifies the homepage.' },
  { key: 'hideProofStrip', label: 'Hide proof CTA strip', help: 'Shortens the homepage.' },
]

const controls = reactive({ ...defaults })
const copied = ref('')

onMounted(() => {
  if (!import.meta.client) return
  try {
    Object.assign(controls, defaults, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'))
  } catch {
    Object.assign(controls, defaults)
  }
  save()
})

function save () {
  if (!import.meta.client) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...controls }))
  window.dispatchEvent(new CustomEvent('tfs-site-controls-updated'))
}

function reset () {
  Object.assign(controls, defaults)
  save()
  copied.value = 'Controls reset.'
}

async function copyConfig () {
  const text = JSON.stringify({ ...controls }, null, 2)
  try {
    await navigator.clipboard.writeText(text)
    copied.value = 'Config copied.'
  } catch {
    copied.value = text
  }
}
</script>

<style scoped>
.ops-control-page { padding: 2rem 0 3rem; }
.narrow { max-width: 840px; }
.tool-head { margin-bottom: 1.5rem; }
.card { margin-bottom: 1rem; padding: 1.25rem; }
.form-grid { display: grid; gap: 0.75rem; max-width: 560px; }
.label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--stone-500); }
.toggle-list { display: grid; gap: 0.75rem; margin-top: 1rem; }
.toggle-row { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.8rem; border: 1px solid #d7dde6; border-radius: 10px; background: #fff; }
.toggle-row input { margin-top: 0.2rem; }
.toggle-row span { display: flex; flex-direction: column; gap: 0.2rem; }
.toggle-row small { color: #4b5563; }
.actions { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.footer-actions { margin-top: 1.5rem; }
.status-ok { margin-top: 0.75rem; color: var(--trust-green); font-weight: 700; }
</style>
