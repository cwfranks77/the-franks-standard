<template>
  <div class="ops-tool-page">
    <div class="container narrow">
      <header class="tool-head">
        <p class="eyebrow">Seller migration</p>
        <h1>Import eBay CSV listings</h1>
        <p class="text-muted">
          Upload an eBay export file and turn it into draft Franks Standard listings for the signed-in seller account.
          Drafts keep the migration safe until photos, COA proof, and final descriptions are reviewed.
        </p>
      </header>

      <section class="card">
        <h2>Before you import</h2>
        <ul class="checklist">
          <li>Unlock owner mode to access this room.</li>
          <li>Sign in with the Supabase seller account that should own the imported drafts.</li>
          <li>Imported image URLs are preserved in the draft description; upload final photos before publishing.</li>
          <li>COA/guarantee is left unsigned so the COA monitor can catch anything published too early.</li>
        </ul>
        <p v-if="user" class="signed-in">Signed in as {{ user.email }}</p>
        <NuxtLink v-else to="/auth/login?redirect=/ops/ebay-import" class="btn btn-primary mt-1">Sign in to import</NuxtLink>
      </section>

      <section class="card">
        <h2>CSV upload</h2>
        <div class="form-grid">
          <label class="label" for="csv-file">eBay CSV file</label>
          <input id="csv-file" class="input" type="file" accept=".csv,text/csv" @change="onFileChange" />

          <p class="small text-muted">
            Imports always create drafts. Publish each listing only after the photos, COA/proof, and final seller guarantee are reviewed.
          </p>
        </div>

        <button type="button" class="btn btn-primary mt-1" :disabled="!canImport || loading" @click="importCsv">
          {{ loading ? 'Importing...' : 'Import CSV' }}
        </button>
        <p v-if="message" class="status-msg" :class="{ error: !!error }">{{ message }}</p>
      </section>

      <section v-if="result" class="card">
        <h2>Import result</h2>
        <div class="result-grid">
          <div><strong>{{ result.total_rows }}</strong><span>Total rows</span></div>
          <div><strong>{{ result.inserted_count }}</strong><span>Drafts created</span></div>
          <div><strong>{{ result.skipped_count }}</strong><span>Skipped rows</span></div>
        </div>

        <div v-if="result.listings?.length" class="mt-1">
          <h3>Created listings</h3>
          <ul class="link-list">
            <li v-for="listing in result.listings" :key="listing.id">
              <NuxtLink :to="`/listing/${listing.id}/edit`">{{ listing.title }}</NuxtLink>
              <span class="small text-muted"> - {{ listing.category }} - ${{ listing.price }}</span>
            </li>
          </ul>
        </div>

        <div v-if="result.errors?.length" class="mt-1">
          <h3>Rows needing attention</h3>
          <ul class="checklist">
            <li v-for="rowError in result.errors" :key="`${rowError.row}-${rowError.error}`">
              Row {{ rowError.row }}: {{ rowError.error }} <span v-if="rowError.title">({{ rowError.title }})</span>
            </li>
          </ul>
        </div>
      </section>

      <div class="actions">
        <NuxtLink to="/ops/panel" class="btn btn-outline">Back to operator console</NuxtLink>
        <NuxtLink to="/dashboard" class="btn btn-outline">Review dashboard drafts</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default', middleware: 'ops-auth' })
useSeoMeta({ title: 'eBay CSV importer - The Franks Standard', robots: 'noindex, nofollow' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const file = ref(null)
const loading = ref(false)
const message = ref('')
const error = ref('')
const result = ref(null)

const canImport = computed(() => !!user.value && !!file.value)

function onFileChange(event) {
  const target = event.target
  file.value = target?.files?.[0] || null
  message.value = ''
  error.value = ''
  result.value = null
}

function readFileAsText(fileToRead) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('Unable to read CSV file.'))
    reader.readAsText(fileToRead)
  })
}

async function importCsv() {
  if (!file.value || !user.value) return
  loading.value = true
  message.value = ''
  error.value = ''
  result.value = null

  try {
    const csvText = await readFileAsText(file.value)
    const { data, error: invokeError } = await supabase.functions.invoke('import-ebay-csv', {
      body: {
        csvText,
        fileName: file.value.name,
      },
    })

    if (invokeError || data?.error) {
      throw new Error(data?.detail || data?.error || invokeError?.message || 'Import failed.')
    }

    result.value = data
    message.value = `Created ${data.inserted_count} listing draft${data.inserted_count === 1 ? '' : 's'}.`
    if (data.skipped_count) {
      message.value += ` ${data.skipped_count} row${data.skipped_count === 1 ? '' : 's'} need attention.`
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Import failed.'
    message.value = error.value
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.ops-tool-page { padding: 2rem 0 3rem; }
.narrow { max-width: 860px; }
.tool-head { margin-bottom: 1.5rem; }
.card { margin-bottom: 1rem; padding: 1.25rem; }
.form-grid { display: grid; gap: 0.75rem; max-width: 620px; }
.label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--stone-500); }
.checklist { margin: 0.5rem 0 0; padding-left: 1.2rem; }
.checklist li { margin-bottom: 0.4rem; }
.signed-in { margin-top: 0.75rem; color: var(--trust-green); font-weight: 700; }
.mt-1 { margin-top: 1rem; }
.status-msg { margin-top: 0.75rem; color: var(--trust-green); font-weight: 700; }
.status-msg.error { color: var(--alert-red); }
.result-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem; }
.result-grid div { padding: 0.9rem; border: 1px solid #d7dde6; border-radius: 10px; background: #fff; }
.result-grid strong { display: block; font-size: 1.5rem; color: #111827; }
.result-grid span { color: #4b5563; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em; }
.link-list { list-style: none; padding: 0; margin: 0; }
.link-list li { margin-bottom: 0.4rem; }
.actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.5rem; }
</style>
