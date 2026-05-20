<template>
  <div class="dl-page">
    <div class="container narrow">
      <div class="dl-hero text-center">
        <h1>Download The Franks Standard</h1>
        <p class="text-muted lead">
          Install the real app on Android or Windows. Browse, buy, sell, and get notifications — same account as the website.
        </p>
      </div>

      <AppDownloadCards />

      <div class="dl-cta text-center">
        <NuxtLink to="/auth/register" class="btn btn-primary btn-lg">Create your free account</NuxtLink>
        <p class="text-muted dl-help">
          Download not working? Email
          <a href="mailto:info@thefranksstandard.com?subject=App%20download%20help">info@thefranksstandard.com</a>
          or call <a href="tel:+18778370527">(877) 837-0527</a>.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Download app - The Franks Standard',
  description: 'Download The Franks Standard for Android (APK) and Windows.',
})
</script>

<style scoped>
.dl-page { padding: 48px 0 80px; color: #111827; }
.dl-page .text-muted { color: #1f2937 !important; font-weight: 700; }
.narrow { max-width: 900px; margin: 0 auto; }
.dl-hero { margin-bottom: 28px; }
h1 { font-size: 2rem; margin-bottom: 10px; color: #111827; }
.lead { font-size: 1.05rem; max-width: 600px; margin: 0 auto 20px; }
.dl-cta { margin-top: 40px; }
.dl-help {
  margin-top: 12px;
  font-size: 0.88rem;
}
.dl-help a { color: var(--gold); font-weight: 600; }
</style>
