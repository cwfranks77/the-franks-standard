<template>
  <div class="learn-page">
    <div class="container print-checklist" style="padding: 40px 16px 64px;">
      <p class="eyebrow no-print"><NuxtLink to="/learn/tools">Tools</NuxtLink></p>
      <div class="no-print" style="margin-bottom: 16px;">
        <button type="button" class="btn btn-primary btn-sm" @click="printPage">Print / Save as PDF</button>
      </div>
      <h1>Authenticity &amp; listing checklist</h1>
      <p class="text-muted">Staff checklist — collectible SKUs need seller COA or signed guarantee; general merchandise uses listing standards.</p>

      <section class="check-block">
        <h2>Before you photograph</h2>
        <ul class="check-list">
          <li><label><input type="checkbox" /> Cert number matches item (PSA, PCGS, etc.)</label></li>
          <li><label><input type="checkbox" /> COA on file or guarantee path selected</label></li>
          <li><label><input type="checkbox" /> No off-platform contact in title or description</label></li>
        </ul>
      </section>
      <section class="check-block">
        <h2>Photos (minimum 6)</h2>
        <ul class="check-list">
          <li><label><input type="checkbox" /> Front and back — sharp, no glare</label></li>
          <li><label><input type="checkbox" /> Corners and edges close-ups</label></li>
          <li><label><input type="checkbox" /> Cert slab / COA scan uploaded</label></li>
        </ul>
      </section>
      <section class="check-block">
        <h2>Publish</h2>
        <ul class="check-list">
          <li><label><input type="checkbox" /> Accurate condition &amp; grade in title</label></li>
          <li><label><input type="checkbox" /> Stripe Connect active</label></li>
          <li><label><input type="checkbox" /> Ship time realistic (dropship disclosed if applicable)</label></li>
        </ul>
      </section>
      <section class="check-block">
        <h2>High-value sales</h2>
        <ul class="check-list">
          <li><label><input type="checkbox" /> Offer video inspect link</label></li>
          <li><label><input type="checkbox" /> Buyer checks out on-platform only (escrow)</label></li>
        </ul>
      </section>

      <p class="no-print text-muted" style="font-weight: 600; margin-top: 24px;">
        Buying or selling coins?
        <NuxtLink to="/learn/tools/coin-study-guide">Coin authentication study guide</NuxtLink>
        (struck vs cast, counterfeit red flags).
      </p>
      <p class="footer-line">The Franks Standard · thefranksstandard.com · (877) 837-0527</p>
    </div>
  </div>
</template>

<script setup>
function printPage () {
  if (import.meta.client) window.print()
}

useSeoMeta({
  title: 'Authenticity checklist (printable) | The Franks Standard',
  description: 'Free printable COA and listing checklist for card shops and collectibles sellers.',
})
</script>

<style scoped>
@import '~/assets/css/learn-hub.css';
h1, h2 { font-family: 'Cinzel', Georgia, serif; font-weight: 800; }
.check-block { margin: 24px 0; }
.check-block h2 { font-size: 1.1rem; color: #92400e; margin-bottom: 12px; }
.check-list { list-style: none; padding: 0; margin: 0; }
.check-list li { margin-bottom: 10px; font-weight: 600; }
.check-list label { display: flex; gap: 10px; align-items: flex-start; cursor: pointer; }
.footer-line { margin-top: 32px; font-size: 0.85rem; font-weight: 700; color: #6b7280; }
.eyebrow a { color: #146eb4; font-weight: 700; }
</style>
