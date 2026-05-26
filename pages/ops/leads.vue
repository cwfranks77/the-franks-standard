<template>
  <div class="ops-tool-page">
    <div class="container narrow">
      <header class="tool-head">
        <p class="eyebrow">Prospect pipeline</p>
        <h1>Log seller leads</h1>
        <p class="text-muted">
          Track vetted stores and sellers that may be ready to move inventory to The Franks Standard.
          This page calls a Supabase Edge Function and requires an admin-approved Supabase account.
        </p>
      </header>

      <section class="card">
        <h2>Admin access</h2>
        <p v-if="user" class="signed-in">Signed in as {{ user.email }}</p>
        <div v-else>
          <p class="text-muted">Sign in with the admin account configured in Supabase function secrets.</p>
          <NuxtLink to="/auth/login?redirect=/ops/leads" class="btn btn-primary">Sign in</NuxtLink>
        </div>
        <p v-if="accessError" class="status-msg error">{{ accessError }}</p>
      </section>

      <section class="card">
        <h2>New lead</h2>
        <div class="form-grid">
          <label class="label" for="store-name">Store name</label>
          <input id="store-name" v-model="form.storeName" class="input" type="text" placeholder="Example Collectibles" />

          <label class="label" for="contact-email">Contact email</label>
          <input id="contact-email" v-model="form.contactEmail" class="input" type="email" placeholder="owner@example.com" />

          <label class="label" for="category">Category</label>
          <input id="category" v-model="form.category" class="input" type="text" placeholder="Cards, watches, photo gear..." />

          <label class="label" for="priority">Priority</label>
          <select id="priority" v-model="form.priority" class="input">
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <label class="label" for="notes">Notes</label>
          <textarea id="notes" v-model="form.notes" class="input area" rows="4" placeholder="Why they are a fit, inventory notes, last contact..." />
        </div>

        <button type="button" class="btn btn-primary mt-1" :disabled="!canSubmit || saving" @click="saveLead">
          {{ saving ? 'Saving...' : 'Log lead' }}
        </button>
        <p v-if="message" class="status-msg" :class="{ error: !!error }">{{ message }}</p>
      </section>

      <section class="card">
        <div class="section-head">
          <h2>Recent leads</h2>
          <button type="button" class="btn btn-outline btn-sm" :disabled="loadingLeads || !user" @click="loadLeads">
            {{ loadingLeads ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>

        <p v-if="!leads.length && !loadingLeads" class="text-muted small">No leads loaded yet.</p>
        <div v-else class="lead-list">
          <article v-for="lead in leads" :key="lead.id" class="lead-card">
            <div>
              <h3>{{ lead.store_name }}</h3>
              <p class="small text-muted">{{ lead.contact_email }}</p>
              <p v-if="lead.category" class="small">{{ lead.category }}</p>
              <p v-if="lead.notes" class="small text-muted">{{ lead.notes }}</p>
            </div>
            <div class="lead-meta">
              <span class="pill">{{ lead.priority }}</span>
              <span class="pill">{{ lead.status }}</span>
              <time class="small text-muted">{{ formatDate(lead.created_at) }}</time>
            </div>
          </article>
        </div>
      </section>

      <div class="actions">
        <NuxtLink to="/ops/panel" class="btn btn-outline">Back to operator console</NuxtLink>
        <NuxtLink to="/ops/ebay-import" class="btn btn-outline">Import eBay inventory</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default', middleware: 'ops-auth' })
useSeoMeta({ title: 'Seller lead logger - The Franks Standard', robots: 'noindex, nofollow' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const form = reactive({
  storeName: '',
  contactEmail: '',
  category: '',
  priority: 'normal',
  notes: '',
})

const saving = ref(false)
const loadingLeads = ref(false)
const message = ref('')
const error = ref('')
const accessError = ref('')
const leads = ref([])

const canSubmit = computed(() => {
  return !!user.value && form.storeName.trim().length > 1 && /[^\s@]+@[^\s@]+\.[^\s@]+/.test(form.contactEmail.trim())
})

onMounted(() => {
  if (user.value) {
    loadLeads()
  }
})

async function callLeadFunction(body) {
  const { data, error: invokeError } = await supabase.functions.invoke('log-admin-lead', { body })
  if (invokeError || data?.error) {
    throw new Error(data?.detail || data?.error || invokeError?.message || 'Lead request failed.')
  }
  return data
}

async function loadLeads() {
  if (!user.value) return
  loadingLeads.value = true
  accessError.value = ''
  try {
    const data = await callLeadFunction({ action: 'list' })
    leads.value = data.leads || []
  } catch (err) {
    accessError.value = err instanceof Error ? err.message : 'Unable to load leads.'
  } finally {
    loadingLeads.value = false
  }
}

async function saveLead() {
  if (!canSubmit.value) return
  saving.value = true
  message.value = ''
  error.value = ''
  accessError.value = ''
  try {
    const data = await callLeadFunction({
      action: 'create',
      storeName: form.storeName,
      contactEmail: form.contactEmail,
      category: form.category,
      priority: form.priority,
      notes: form.notes,
    })
    leads.value = [data.lead, ...leads.value]
    form.storeName = ''
    form.contactEmail = ''
    form.category = ''
    form.priority = 'normal'
    form.notes = ''
    message.value = 'Prospect logged successfully.'
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to save lead.'
    message.value = error.value
  } finally {
    saving.value = false
  }
}

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString()
}
</script>

<style scoped>
.ops-tool-page { padding: 2rem 0 3rem; }
.narrow { max-width: 860px; }
.tool-head { margin-bottom: 1.5rem; }
.card { margin-bottom: 1rem; padding: 1.25rem; }
.form-grid { display: grid; gap: 0.75rem; max-width: 620px; }
.label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--stone-500); }
.area { min-height: 96px; resize: vertical; }
.signed-in { margin-top: 0.5rem; color: var(--trust-green); font-weight: 700; }
.mt-1 { margin-top: 1rem; }
.small { font-size: 0.85rem; line-height: 1.45; }
.status-msg { margin-top: 0.75rem; color: var(--trust-green); font-weight: 700; }
.status-msg.error { color: var(--alert-red); }
.section-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.lead-list { display: grid; gap: 0.75rem; }
.lead-card { display: flex; justify-content: space-between; gap: 1rem; padding: 1rem; border: 1px solid #d7dde6; border-radius: 10px; background: #fff; }
.lead-card h3 { margin: 0 0 0.25rem; color: #111827; }
.lead-card p { margin: 0.15rem 0; }
.lead-meta { display: flex; flex-direction: column; gap: 0.35rem; align-items: flex-end; min-width: 120px; }
.pill { display: inline-flex; justify-content: center; border-radius: 999px; padding: 0.2rem 0.6rem; background: rgba(201, 168, 76, 0.12); color: #111827; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
.actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.5rem; }
@media (max-width: 640px) {
  .lead-card { flex-direction: column; }
  .lead-meta { align-items: flex-start; }
}
</style>
