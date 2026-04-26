<template>
  <div class="page">
    <div class="container narrow">
      <h1>Contact</h1>
      <p class="text-muted lead">
        Questions from buyers and sellers, press, or partnerships: reach the team at the address below. We read every message.
      </p>

      <div class="card contact-card">
        <p class="label">Email</p>
        <p class="email">
          <a href="mailto:info@thefranksstandard.com">info@thefranksstandard.com</a>
        </p>
        <p class="text-muted small">
          This inbox is the official channel for The Franks Standard. If you use email forwarding in Namecheap, you can read
          and reply from your own mailbox (for example your Gmail) while the public still sees a professional
          <strong>thefranksstandard.com</strong> address.
        </p>
      </div>

      <p class="mt-3 text-muted">Ready to sell with proof? It is free to join.</p>
      <NuxtLink to="/auth/register" class="btn btn-primary btn-lg mt-2">Create a seller account</NuxtLink>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Contact - The Franks Standard',
  description: 'Contact The Franks Standard: info@thefranksstandard.com for buyers, sellers, and press.',
})
</script>

<style scoped>
.page { padding: 64px 0 100px; }
.narrow { max-width: 640px; }
.lead { font-size: 1.05rem; line-height: 1.6; margin-bottom: 24px; }
h1 { font-size: 2rem; margin-bottom: 12px; }
.label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gold); margin-bottom: 6px; }
.email a { font-size: 1.2rem; font-weight: 600; }
.contact-card { padding: 24px; margin-top: 20px; }
.small { font-size: 0.9rem; line-height: 1.55; margin-top: 16px; }
</style>
