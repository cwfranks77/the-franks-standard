<template>
  <section class="trust-mission section" aria-labelledby="trust-mission-heading">
    <div class="container trust-mission-grid">
      <div class="trust-mission-copy">
        <p class="eyebrow">Why we exist</p>
        <h2 id="trust-mission-heading">Counterfeits are the oldest scam in collectibles. We built the antidote.</h2>
        <p class="text-muted lede">
          Trust and authenticity come first — then affordability, then our Seller Excellence program.
          When sellers succeed with honest service, we succeed together.
        </p>
        <ul class="trust-pillars">
          <li><strong>Security you can see</strong> — COA or signed guarantee on every listing; serial verification; integrity holds for bad actors.</li>
          <li><strong>Owner-accessible</strong> — Charles Franks reads Open Door feedback personally. Call <a href="tel:+18778370527">(877) 837-0527</a> or use Help chat.</li>
          <li><strong>Affordable fees</strong> — 4–5% for most sellers; founding sellers get 3 months Pro free.</li>
          <li><strong>Seller Excellence tokens</strong> — top-rated sellers earn waived or reduced fees, homepage spotlight, and appreciation badges each cycle.</li>
        </ul>
        <div class="trust-mission-cta">
          <NuxtLink to="/how-it-works" class="btn btn-outline btn-sm">How protection works</NuxtLink>
          <NuxtLink to="/top-sellers" class="btn btn-primary btn-sm">Seller Excellence</NuxtLink>
          <NuxtLink to="/open-door" class="btn btn-outline btn-sm">Open Door</NuxtLink>
        </div>
      </div>
      <div class="trust-mission-card card">
        <p class="trust-quote">“If it is here, it is real — or we enforce until the buyer is made whole.”</p>
        <p class="text-muted small">Escrow · buyer confirms delivery · bans for fraud · forced refunds when authenticity fails.</p>
        <NuxtLink to="/protection" class="btn btn-primary btn-sm mt-2">Protection overview</NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.trust-mission-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 28px;
  align-items: start;
}
@media (max-width: 900px) {
  .trust-mission-grid { grid-template-columns: 1fr; }
}
.trust-mission-copy h2 { margin: 8px 0 12px; max-width: 36rem; }
.lede { max-width: 40rem; line-height: 1.6; }
.trust-pillars {
  margin: 16px 0 20px;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.trust-pillars li {
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--stone-200);
  padding-left: 14px;
  border-left: 3px solid rgba(201, 168, 76, 0.45);
}
.trust-pillars a { color: var(--gold); }
.trust-mission-cta { display: flex; flex-wrap: wrap; gap: 10px; }
.trust-mission-card { padding: 22px; border-color: rgba(0, 245, 160, 0.25); }
.trust-quote {
  font-family: 'Cinzel', serif;
  font-size: 1.05rem;
  color: var(--gold);
  line-height: 1.5;
  margin: 0 0 10px;
}
</style>
