<template>
  <div class="page seller-tools-page">
    <div class="container">
      <header class="page-head">
        <p class="eyebrow">Seller toolkit</p>
        <h1>Appraisal, grading &amp; comp research</h1>
        <p class="lead text-muted">
          Price and describe with confidence. These are live links to accredited appraiser directories,
          major grading houses, and sold-market research — the same tools serious dealers use before they list.
        </p>
        <div class="head-actions">
          <NuxtLink to="/sell" class="btn btn-primary btn-sm">List an item</NuxtLink>
          <NuxtLink to="/top-sellers" class="btn btn-outline btn-sm">Seller Excellence program</NuxtLink>
        </div>
      </header>

      <AppraisalResourcesPanel />
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })
useSeoMeta({
  title: 'Seller tools — appraisers, grading & comps | The Franks Standard',
  description:
    'Curated live links to ASA, ISA, AAA appraiser finders, PSA, Beckett, PCGS, eBay sold comps, and consignment houses for marketplace sellers.',
})
</script>

<style scoped>
.seller-tools-page { padding: 40px 16px 100px; }
.page-head { max-width: 720px; margin-bottom: 2rem; }
.eyebrow {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--gold, #f7ca00);
  font-weight: 700;
}
.lead { line-height: 1.6; margin: 0.75rem 0 1rem; }
.head-actions { display: flex; flex-wrap: wrap; gap: 10px; }
</style>
