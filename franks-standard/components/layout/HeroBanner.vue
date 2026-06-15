<template>
  <section class="max-w-6xl mx-auto px-4 py-10">
    <div class="grid md:grid-cols-2 gap-8 items-center">
      <div>
        <h1 class="text-3xl md:text-4xl font-bold mb-4">
          The Franks Standard
        </h1>
        <p class="text-textMuted mb-4">
          The authenticity-first collectibles marketplace. Every listing backed by a Certificate of Authenticity or signed in-platform guarantee — not hype, not fakes.
        </p>
        <div class="flex gap-3">
          <NuxtLink
            to="/browse"
            class="inline-flex items-center px-4 py-2 rounded-md bg-primary text-bg text-sm font-medium hover:bg-primary/90 transition"
          >
            Browse marketplace
          </NuxtLink>
          <button
            class="inline-flex items-center px-4 py-2 rounded-md border border-border text-sm text-textMuted hover:border-primary hover:text-primary transition"
          >
            Learn how it works
          </button>
        </div>
      </div>
      <div class="bg-surface2 rounded-xl border border-border overflow-hidden">
        <img
          src="/img/franks-pavilion.png"
          alt="The Franks Standard marketplace pavilion"
          class="w-full h-56 md:h-72 object-cover"
          width="640"
          height="480"
          decoding="async"
        >
        <div class="p-6">
          <p class="text-xs uppercase tracking-wide text-textMuted mb-2">
            Why The Franks Standard?
          </p>
          <ul class="list-disc list-inside space-y-2 text-sm text-textMuted">
            <li>Every item tied to a documented COA.</li>
            <li>No wholesale pricing, no race to the bottom.</li>
            <li>Owner-level logging of transactions and tax events.</li>
            <li>Built for serious buyers and sellers, not impulse scroll.</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
