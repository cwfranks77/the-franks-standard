<template>
  <div class="page narrow">
    <h1>Contact</h1>
    <p class="text-muted lead">
      Questions from buyers and sellers, press, and partnerships. Use the form below — it reaches the team even while
      the <strong>info@</strong> inbox is being restored on Namecheap.
    </p>

    <div v-if="formSuccess" class="card success-card" role="status">
      <p><strong>Message received.</strong> We will reply to the email you entered. For urgent issues, call
        <a href="tel:+18778370527">(877) 837-0527</a> or use the <strong>Help</strong> chat on any page.</p>
    </div>

    <form v-else class="card contact-form" @submit.prevent="submitForm">
      <p class="form-note text-muted small">
        Prefer email later? <strong>info@thefranksstandard.com</strong> will work again after mailbox reset.
        Right now this form + phone + Help chat are the fastest paths.
      </p>
      <div class="form-group">
        <label class="label">Your name</label>
        <input v-model="form.name" class="input" type="text" autocomplete="name" />
      </div>
      <div class="form-group">
        <label class="label">Your email (required)</label>
        <input v-model="form.email" class="input" type="email" required autocomplete="email" />
      </div>
      <div class="form-group">
        <label class="label">Subject</label>
        <input v-model="form.subject" class="input" type="text" placeholder="Order question, seller apply, press…" />
      </div>
      <div class="form-group">
        <label class="label">Message (required)</label>
        <textarea v-model="form.message" class="input" rows="5" required placeholder="Include order ID if you have one." />
      </div>
      <input v-model="form.website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
      <p v-if="formError" class="form-error">{{ formError }}</p>
      <button type="submit" class="btn btn-primary btn-lg" style="width:100%" :disabled="sending">
        {{ sending ? 'Sending…' : 'Send message' }}
      </button>
    </form>

    <div class="card contact-card mt-3">
      <div class="contact-method">
        <p class="label">Phone</p>
        <p class="phone-big">
          <a href="tel:+18778370527">(877) 837-0527</a>
        </p>
      </div>
      <hr class="contact-divider" />
      <div class="contact-method">
        <p class="label">Help chat</p>
        <p class="text-muted small">Click <strong>Help</strong> (bottom-right) on any page.</p>
      </div>
      <hr class="contact-divider" />
      <div class="contact-method">
        <p class="label">Stores and volume sellers</p>
        <p class="text-muted small">
          <NuxtLink to="/sellers">For sellers</NuxtLink> ·
          <NuxtLink to="/support">Support &amp; tech</NuxtLink>
        </p>
      </div>
    </div>

    <p class="text-muted mt-3">
      <NuxtLink to="/auth/register">Create a free account</NuxtLink>
    </p>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Contact — The Franks Standard',
  description: 'Contact The Franks Standard: form, phone, and Help chat. info@ inbox being restored.',
})

const supabase = useSupabaseClient()
const form = reactive({
  name: '',
  email: '',
  subject: 'Contact form',
  message: '',
  website: '',
})
const sending = ref(false)
const formError = ref('')
const formSuccess = ref(false)

async function submitForm () {
  formError.value = ''
  sending.value = true
  try {
    const { data, error } = await supabase.functions.invoke('submit-contact', {
      body: {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        website: form.website,
      },
    })
    if (error) throw new Error(error.message || 'Send failed')
    if (data?.error) throw new Error(data.error)
    formSuccess.value = true
  } catch (e) {
    formError.value = e.message || 'Could not send. Try phone (877) 837-0527 or Help chat.'
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
.page { padding: 48px 16px 100px; max-width: 640px; margin: 0 auto; }
.lead { font-size: 1.05rem; line-height: 1.6; margin-bottom: 24px; font-weight: 700; color: #111827; }
.label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.12em; color: #374151; margin-bottom: 6px; font-weight: 800; }
.phone-big a { font-size: 1.4rem; font-weight: 800; color: var(--trust-green); font-family: 'Cinzel', serif; text-decoration: none; }
.contact-card, .contact-form, .success-card { padding: 28px; margin-top: 8px; }
.contact-divider { border: none; border-top: 1px solid var(--stone-800); margin: 16px 0; }
.form-group { margin-bottom: 1rem; }
.form-note { margin-bottom: 1rem; line-height: 1.5; }
.form-error { color: #f87171; margin-bottom: 0.75rem; }
.success-card { border-color: var(--trust-green); }
.hp { position: absolute; left: -9999px; opacity: 0; height: 0; width: 0; }
.mt-3 { margin-top: 1rem; }
.small { font-size: 0.9rem; }
</style>
