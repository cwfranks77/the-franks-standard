<template>
  <div class="edit-listing-page">
    <div class="container narrow">
      <header class="edit-head">
        <p class="eyebrow">Seller dashboard</p>
        <h1>Edit listing</h1>
        <p class="text-muted">
          Update the listing basics or remove it from the public marketplace. Archived listings stay saved in your account.
        </p>
      </header>

      <section v-if="loading" class="card">
        <p class="text-muted">Loading listing...</p>
      </section>

      <section v-else-if="loadError" class="card">
        <h2>Cannot edit this listing</h2>
        <p class="form-err">{{ loadError }}</p>
        <div class="actions mt-1">
          <NuxtLink to="/dashboard" class="btn btn-outline">Back to dashboard</NuxtLink>
          <NuxtLink to="/auth/login?redirect=/dashboard" class="btn btn-primary">Sign in</NuxtLink>
        </div>
      </section>

      <template v-else>
        <section class="card status-card">
          <div>
            <h2>Status: {{ form.status }}</h2>
            <p class="text-muted small">
              Published listings are visible to buyers. Archived listings are removed from browse and direct public listing pages.
            </p>
          </div>
          <div class="actions">
            <NuxtLink v-if="form.status === 'published'" :to="`/listing/${listingId}`" class="btn btn-outline btn-sm">View live listing</NuxtLink>
            <button
              v-if="form.status === 'published'"
              type="button"
              class="btn btn-outline btn-sm"
              :disabled="saving"
              @click="archiveListing"
            >
              Remove from marketplace
            </button>
            <button
              v-else
              type="button"
              class="btn btn-primary btn-sm"
              :disabled="saving"
              @click="publishListing"
            >
              Publish listing
            </button>
          </div>
        </section>

        <section class="card">
          <h2>Listing details</h2>
          <div class="form-grid">
            <label class="label" for="title">Title</label>
            <input id="title" v-model="form.title" class="input" type="text" maxlength="180" />

            <label class="label" for="price">Price</label>
            <input id="price" v-model.number="form.price" class="input" type="number" min="0.01" step="0.01" />

            <label class="label" for="category">Category</label>
            <select id="category" v-model="form.category" class="input">
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>

            <label class="label" for="condition">Condition</label>
            <select id="condition" v-model="form.condition" class="input">
              <option value="new">New / Sealed</option>
              <option value="like-new">Like New</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>

            <label class="label" for="description">Description</label>
            <textarea id="description" v-model="form.description" class="input area" rows="8" />
          </div>

          <p v-if="message" class="status-msg" :class="{ error: !!errorMessage }">{{ message }}</p>

          <div class="actions mt-1">
            <button type="button" class="btn btn-primary" :disabled="saving" @click="saveListing">
              {{ saving ? 'Saving...' : 'Save changes' }}
            </button>
            <NuxtLink to="/dashboard" class="btn btn-outline">Back to dashboard</NuxtLink>
          </div>
        </section>

        <section class="card danger-card">
          <h2>Remove from marketplace</h2>
          <p class="text-muted small">
            Use this to hide a test item or sold/unavailable item. It archives the row instead of permanently deleting it.
          </p>
          <button type="button" class="btn btn-outline" :disabled="saving || form.status === 'archived'" @click="archiveListing">
            {{ form.status === 'archived' ? 'Already removed' : 'Archive listing' }}
          </button>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { LISTING_CATEGORIES } from '~/utils/marketplaceCategories'

definePageMeta({ layout: 'default', middleware: 'requires-auth' })
useSeoMeta({ title: 'Edit listing - The Franks Standard', robots: 'noindex, nofollow' })

const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const listingId = computed(() => String(route.params.id || ''))
const categories = LISTING_CATEGORIES
const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const message = ref('')
const errorMessage = ref('')

const form = reactive({
  title: '',
  description: '',
  category: 'General Merchandise',
  price: 0,
  condition: 'good',
  status: 'draft',
})

function setMessage (text, isError = false) {
  message.value = text
  errorMessage.value = isError ? text : ''
}

function validateForm () {
  if (!form.title.trim()) return 'Title is required.'
  if (!form.description.trim()) return 'Description is required.'
  if (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0) return 'Price must be greater than zero.'
  if (!categories.includes(form.category)) return 'Choose a valid category.'
  if (!form.condition) return 'Choose a condition.'
  return ''
}

async function loadListing () {
  loading.value = true
  loadError.value = ''
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) {
    loadError.value = 'Sign in with the seller account that owns this listing.'
    loading.value = false
    return
  }

  const { data, error } = await supabase
    .from('listings')
    .select('id, seller_id, title, description, category, price, condition, status')
    .eq('id', listingId.value)
    .maybeSingle()

  if (error || !data) {
    loadError.value = error?.message || 'Listing not found.'
    loading.value = false
    return
  }
  if (data.seller_id !== currentUser.id) {
    loadError.value = 'Only the seller who created this listing can edit it.'
    loading.value = false
    return
  }

  form.title = data.title || ''
  form.description = data.description || ''
  form.category = categories.includes(data.category) ? data.category : 'General Merchandise'
  form.price = Number(data.price || 0)
  form.condition = data.condition || 'good'
  form.status = data.status || 'draft'
  loading.value = false
}

async function saveListing () {
  const validation = validateForm()
  if (validation) {
    setMessage(validation, true)
    return
  }
  saving.value = true
  setMessage('')
  const { error } = await supabase
    .from('listings')
    .update({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      price: Number(form.price),
      condition: form.condition,
    })
    .eq('id', listingId.value)

  saving.value = false
  if (error) {
    setMessage(error.message || 'Could not save listing.', true)
    return
  }
  setMessage('Listing changes saved.')
}

async function updateStatus (status) {
  saving.value = true
  setMessage('')
  const { error } = await supabase
    .from('listings')
    .update({ status })
    .eq('id', listingId.value)
  saving.value = false
  if (error) {
    setMessage(error.message || 'Could not update listing status.', true)
    return
  }
  form.status = status
  setMessage(status === 'published' ? 'Listing published.' : 'Listing removed from the marketplace.')
}

async function archiveListing () {
  await updateStatus('archived')
}

async function publishListing () {
  const validation = validateForm()
  if (validation) {
    setMessage(validation, true)
    return
  }
  await saveListing()
  if (!errorMessage.value) {
    await updateStatus('published')
  }
}

onMounted(loadListing)
</script>

<style scoped>
.edit-listing-page { padding: 2rem 0 3rem; }
.narrow { max-width: 860px; }
.edit-head { margin-bottom: 1.5rem; }
.card { margin-bottom: 1rem; padding: 1.25rem; }
.status-card { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; align-items: flex-start; }
.form-grid { display: grid; gap: 0.75rem; }
.label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--stone-500); }
.area { min-height: 150px; resize: vertical; }
.actions { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; }
.mt-1 { margin-top: 1rem; }
.status-msg { margin-top: 0.75rem; color: var(--trust-green); font-weight: 700; }
.status-msg.error,
.form-err { color: #7f1d1d; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 0.75rem; }
.danger-card { border-color: rgba(127, 29, 29, 0.25); }
</style>
