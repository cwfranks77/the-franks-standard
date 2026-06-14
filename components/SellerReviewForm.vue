<template>
  <div v-if="orderId" class="review-form card">
    <h2>Rate your seller</h2>
    <p class="text-muted small">
      Honest feedback helps great sellers earn
      <NuxtLink to="/top-sellers">Seller Excellence</NuxtLink>
      rewards.
    </p>
    <p v-if="existingReview" class="review-done text-muted">
      Thanks — you rated this order {{ existingReview.rating }}★.
    </p>
    <form v-else @submit.prevent="submit">
      <div class="stars" role="group" aria-label="Star rating">
        <button
          v-for="n in 5"
          :key="n"
          type="button"
          class="star-btn"
          :class="{ on: rating >= n }"
          :aria-pressed="rating >= n"
          @click="rating = n"
        >
          ★
        </button>
      </div>
      <label class="field-label" for="review-comment">Comment (optional)</label>
      <textarea
        id="review-comment"
        v-model="comment"
        rows="3"
        maxlength="2000"
        placeholder="What went well? Would you buy from this seller again?"
      />
      <p v-if="error" class="error-msg">{{ error }}</p>
      <button type="submit" class="btn btn-primary btn-sm" :disabled="!rating || saving">
        {{ saving ? 'Saving…' : 'Submit review' }}
      </button>
    </form>
  </div>
</template>

<script setup>
const props = defineProps({
  orderId: { type: String, required: true },
  sellerId: { type: String, required: true },
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const rating = ref(0)
const comment = ref('')
const saving = ref(false)
const error = ref('')
const existingReview = ref(null)

onMounted(async () => {
  if (!props.orderId) return
  const { data } = await supabase
    .from('seller_reviews')
    .select('rating, comment')
    .eq('order_id', props.orderId)
    .maybeSingle()
  if (data) existingReview.value = data
})

async function submit () {
  error.value = ''
  if (!user.value?.id || !rating.value) return
  saving.value = true
  try {
    const { error: insErr } = await supabase.from('seller_reviews').insert({
      order_id: props.orderId,
      seller_id: props.sellerId,
      buyer_id: user.value.id,
      rating: rating.value,
      comment: comment.value.trim() || null,
    })
    if (insErr) throw insErr
    existingReview.value = { rating: rating.value, comment: comment.value }
  } catch (e) {
    error.value = e?.message || 'Could not save review'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.review-form { padding: 1.25rem; margin-top: 1.5rem; }
.review-form h2 { font-size: 1.1rem; margin-bottom: 0.35rem; color: var(--gold, #f7ca00); }
.stars { display: flex; gap: 4px; margin: 12px 0; }
.star-btn {
  background: none;
  border: none;
  font-size: 1.75rem;
  color: #4b5563;
  cursor: pointer;
  padding: 0 2px;
}
.star-btn.on { color: var(--gold, #f7ca00); }
.field-label { display: block; font-size: 0.85rem; margin-bottom: 6px; color: #9ca3af; }
textarea {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #374151;
  background: #111827;
  color: #e5e7eb;
  padding: 10px;
  margin-bottom: 12px;
  font-family: inherit;
}
.error-msg { color: #f87171; font-size: 0.88rem; margin-bottom: 8px; }
.review-done { margin-top: 8px; }
</style>
