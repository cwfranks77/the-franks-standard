<template>
  <section class="max-w-6xl mx-auto px-4 py-6 md:py-8">
    <div class="rounded-xl border border-gold/25 bg-surface2 p-6 md:p-8">
      <p class="text-xs uppercase tracking-widest text-gold font-semibold mb-2">
        Authenticity-first marketplace
      </p>
      <h1 class="text-2xl md:text-3xl font-bold mb-3 text-white">
        Browse verified collectibles — every listing needs proof
      </h1>
      <p class="text-white/85 mb-5 max-w-2xl">
        Sports cards, watches, coins, estate finds, and more. Sellers upload a COA or sign our in-platform guarantee before anything goes live.
      </p>
      <div class="flex flex-wrap gap-3 mb-6">
        <NuxtLink
          to="/browse"
          class="tfs-cta inline-flex items-center px-4 py-2 rounded-md text-sm font-bold transition"
        >
          Browse marketplace
        </NuxtLink>
        <NuxtLink
          to="/sell/start"
          class="tfs-cta-secondary inline-flex items-center px-4 py-2 rounded-md border text-sm transition"
        >
          Start selling
        </NuxtLink>
        <NuxtLink
          to="/collections"
          class="tfs-cta-outline inline-flex items-center px-4 py-2 rounded-md border text-sm transition"
        >
          Featured collections
        </NuxtLink>
      </div>
      <div class="grid sm:grid-cols-3 gap-3">
        <div class="rounded-lg border border-border bg-bg/60 p-4">
          <p class="text-gold text-sm font-bold mb-1">COA on file</p>
          <p class="text-xs text-white/80 leading-relaxed">Upload or Franks serial — no proof, no publish.</p>
        </div>
        <div class="rounded-lg border border-border bg-bg/60 p-4">
          <p class="text-gold text-sm font-bold mb-1">Escrow checkout</p>
          <p class="text-xs text-white/80 leading-relaxed">Buyers pay on-platform; sellers ship after funds clear.</p>
        </div>
        <div class="rounded-lg border border-border bg-bg/60 p-4">
          <p class="text-gold text-sm font-bold mb-1">Fair seller fees</p>
          <p class="text-xs text-white/80 leading-relaxed">No race to the bottom — built for serious dealers.</p>
        </div>
      </div>
    </div>
  </section>
</template>
