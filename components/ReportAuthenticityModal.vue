<template>
  <div v-if="open" class="report-modal-backdrop" @click.self="$emit('close')">
    <div class="report-modal" role="dialog" aria-labelledby="report-modal-title">
      <h2 id="report-modal-title">Report authenticity concern</h2>
      <p class="text-muted small">
        Suspected fake, wrong photos, or stolen COA? We investigate. Proven counterfeits: permanent seller ban + buyer refund path.
      </p>

      <form @submit.prevent="submit">
        <div class="form-group">
          <label class="label">Reason</label>
          <select v-model="reason" class="select" required>
            <option v-for="r in REPORT_REASONS" :key="r.value" :value="r.value">{{ r.label }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="label">Details (required)</label>
          <textarea v-model="details" class="input" rows="4" required minlength="10" placeholder="What looks wrong? Cert numbers, photos, seller claims…" />
        </div>
        <div v-if="!isLoggedIn" class="form-group">
          <label class="label">Your email (optional)</label>
          <input v-model="email" type="email" class="input" placeholder="For follow-up" />
        </div>
        <p v-if="error" class="error-text">{{ error }}</p>
        <p v-if="success" class="success-text">Report received. Our team will review this listing.</p>
        <div class="report-actions">
          <button type="button" class="btn btn-outline btn-sm" @click="$emit('close')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm" :disabled="submitting">{{ submitting ? 'Sending…' : 'Submit report' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { REPORT_REASONS } from '~/utils/authenticityScan.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  listingId: { type: String, required: true },
})

defineEmits(['close'])

const supabase = useSupabaseClient()
const config = useRuntimeConfig()

const reason = ref('suspected_counterfeit')
const details = ref('')
const email = ref('')
const submitting = ref(false)
const error = ref('')
const success = ref(false)
const isLoggedIn = ref(false)

watch(() => props.open, async (v) => {
  if (!v) return
  error.value = ''
  success.value = false
  const { data: { user } } = await supabase.auth.getUser()
  isLoggedIn.value = !!user
})

async function submit () {
  submitting.value = true
  error.value = ''
  success.value = false
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const headers = { 'Content-Type': 'application/json' }
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`
    }
    const base = String(config.public.supabaseUrl || '').replace(/\/+$/, '')
    const res = await fetch(`${base}/functions/v1/submit-authenticity-report`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        listing_id: props.listingId,
        reason: reason.value,
        details: details.value.trim(),
        reporter_email: email.value.trim() || undefined,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      error.value = data.error || data.message || 'Could not submit report.'
      return
    }
    success.value = true
    details.value = ''
  } catch (e) {
    error.value = e?.message || String(e)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.report-modal-backdrop {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(15, 23, 42, 0.55);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.report-modal {
  background: #fff; border-radius: 12px; padding: 24px; max-width: 440px; width: 100%;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
}
.report-modal h2 { font-size: 1.15rem; margin: 0 0 8px; }
.report-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px; }
.error-text { color: #b91c1c; font-size: 0.88rem; font-weight: 600; }
.success-text { color: #047857; font-size: 0.88rem; font-weight: 600; }
</style>
