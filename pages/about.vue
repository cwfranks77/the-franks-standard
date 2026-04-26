<template>
  <div class="page">
    <div class="container narrow">
      <h1>About The Franks Standard</h1>
      <p class="text-muted lead">
        A marketplace for collectibles, gear, and high-trust items where <strong>authenticity is the product</strong>.
        The Franks Standard was founded to fix what is broken in broad list-everything platforms: fakes, weak accountability,
        and fine print that favors volume over truth.
      </p>

      <h2>Our standard</h2>
      <p class="text-muted block">
        Every public listing is backed by a Certificate of Authenticity (COA) or a signed in-platform authenticity guarantee.
        We pair that with clear buyer protection and zero tolerance for counterfeit sellers, because reputation should mean something.
      </p>

      <h2>Founder</h2>
      <p class="text-muted block">Founded by <strong>Charles Franks</strong>. The name on the site is the standard we hold ourselves to.</p>

      <div class="row-btns">
        <NuxtLink to="/compare" class="btn btn-outline btn-lg">How we differ from eBay and Amazon</NuxtLink>
        <NuxtLink to="/auth/register" class="btn btn-primary btn-lg">Join free</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'About - The Franks Standard',
  description: 'The Franks Standard: an authenticity-first marketplace for collectibles and gear, founded by Charles Franks.',
})
</script>

<style scoped>
.page { padding: 64px 0 100px; }
.narrow { max-width: 720px; }
.lead { font-size: 1.1rem; line-height: 1.65; margin-bottom: 28px; }
h1 { font-size: 2rem; margin-bottom: 16px; }
h2 { font-size: 1.2rem; color: var(--gold); margin: 32px 0 10px; }
.block { line-height: 1.65; }
.row-btns { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
</style>
