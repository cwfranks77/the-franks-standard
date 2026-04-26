<template>
  <div class="page narrow">
    <h1>Contact</h1>
    <p class="text-muted lead">
      Questions from buyers and sellers, press, and partnerships: reach the team at the address below.
      For step-by-step help and tech issues, start at
      <NuxtLink to="/support">Support &amp; tech</NuxtLink>
      or use the <strong>Help</strong> button on any page.
    </p>
    <div class="card contact-card">
      <p class="label">Email</p>
      <p class="email">
        <a href="mailto:info@thefranksstandard.com">info@thefranksstandard.com</a>
      </p>
      <p class="text-muted small">
        This inbox is the official channel for The Franks Standard. If you forward from another mailbox,
        reply from the same thread so we can match your case. For urgent order problems, include order ID
        and photos in your first message.
      </p>
      <p class="text-muted mt-3 small">
        Public site: <strong>thefranksstandard.com</strong>
      </p>
    </div>
    <p class="text-muted mt-3">
      Ready to sell with proof?
      <NuxtLink to="/auth/register">Create a free account</NuxtLink>.
    </p>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Contact — The Franks Standard',
  description: 'Contact The Franks Standard: info@thefranksstandard.com for buyers, sellers, and press.',
})
</script>

<style scoped>
.page { padding: 48px 16px 100px; max-width: 640px; margin: 0 auto; }
.lead { font-size: 1.05rem; line-height: 1.6; margin-bottom: 24px; }
.label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--gold); margin-bottom: 6px; }
.email a { font-size: 1.1rem; font-weight: 600; }
.contact-card { padding: 24px; margin-top: 8px; }
.small { font-size: 0.9rem; line-height: 1.5; }
.mt-3 { margin-top: 1rem; }
</style>
