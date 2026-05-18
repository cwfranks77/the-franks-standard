<template>
  <div class="page">
    <div class="container legal">
      <h1>Privacy Policy</h1>
      <p class="updated">Last updated: April 26, 2026.</p>

      <h2>1. What we collect</h2>
      <p>
        We collect information you provide (name, email, account details), technical data (IP, device, browser), and usage
        of the site. If you use payments, our payment partners process card data under their own policies; we do not store
        full card numbers on our site.
      </p>

      <h2>2. How we use information</h2>
      <p>
        To run the marketplace, process transactions, prevent fraud, communicate about your account, improve the service,
        and meet legal obligations.
      </p>

      <h2>3. Sharing</h2>
      <p>
        We may share data with service providers (hosting, email, payment, analytics) that help us operate the site, and when
        required by law. We do not sell your personal information to data brokers.
      </p>

      <h2>4. Your choices</h2>
      <p>
        You can access or update some information in your account settings. You may request deletion of your account subject
        to our need to retain certain records for law or disputes.
      </p>

      <h2>5. Contact</h2>
      <p>
        Questions: <NuxtLink to="/contact">Contact</NuxtLink> or
        <a href="mailto:info@thefranksstandard.com">info@thefranksstandard.com</a>
      </p>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Privacy Policy - The Franks Standard',
  description: 'Privacy Policy for The Franks Standard.',
})
</script>

<style scoped>
.page { padding: 64px 0 100px; }
.legal { max-width: 800px; }
.legal h1 { font-size: 2rem; margin-bottom: 8px; }
.legal h2 { font-size: 1.15rem; color: var(--gold); margin: 28px 0 10px; }
.legal p { color: #374151; line-height: 1.7; font-size: 0.95rem; }
.updated { color: var(--stone-500); font-size: 0.86rem; margin-bottom: 24px; }
</style>
