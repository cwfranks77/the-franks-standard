<template>
  <div class="page narrow">
    <h1>Contact</h1>
    <p class="text-muted lead">
      Questions from buyers and sellers, press, and partnerships: reach the team at the address below. Stores and volume
      sellers: start at <NuxtLink to="/sellers">For sellers</NuxtLink> (same email). For step-by-step help and tech
      issues, go to
      <NuxtLink to="/support">Support &amp; tech</NuxtLink>
      or use the <strong>Help</strong> button on any page.
    </p>
    <div class="card contact-card">
      <div class="contact-method">
        <p class="label">📞 Phone (AI-Powered)</p>
        <p class="phone-big">
          <a href="tel:+18778370527">(877) 837-0527</a>
        </p>
        <p class="text-muted small">
          AI customer service for orders, returns, billing, and general questions.
          Complex issues are escalated to a human agent.
        </p>
      </div>
      <hr class="contact-divider" />
      <div class="contact-method">
        <p class="label">✉️ Email</p>
        <p class="email">
          <a href="mailto:info@thefranksstandard.com">info@thefranksstandard.com</a>
        </p>
        <p class="text-muted small">
          For order issues, include your order ID and photos. Reply from the same thread so we can match your case.
        </p>
        <div class="alias-wrap">
          <p class="label alias-label">Department inboxes (all route to info@)</p>
          <p class="alias-line">
            <a href="mailto:support@thefranksstandard.com">support@thefranksstandard.com</a> ·
            <a href="mailto:sales@thefranksstandard.com">sales@thefranksstandard.com</a> ·
            <a href="mailto:press@thefranksstandard.com">press@thefranksstandard.com</a> ·
            <a href="mailto:partnerships@thefranksstandard.com">partnerships@thefranksstandard.com</a>
          </p>
        </div>
      </div>
      <hr class="contact-divider" />
      <div class="contact-method">
        <p class="label">💬 AI Chat</p>
        <p class="text-muted small">
          Click the <strong>Help</strong> button in the bottom-right corner of any page for instant AI-powered answers.
        </p>
      </div>
      <hr class="contact-divider" />
      <div class="contact-method">
        <p class="label">📹 Video Call</p>
        <p class="text-muted small">
          Use <NuxtLink to="/video">Video</NuxtLink> for face-to-face conversations — no app required.
        </p>
      </div>
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
.phone-big a { font-size: 1.4rem; font-weight: 800; color: var(--trust-green); font-family: 'Cinzel', serif; text-decoration: none; }
.phone-big a:hover { color: var(--gold); }
.contact-card { padding: 28px; margin-top: 8px; }
.contact-method { padding: 4px 0; }
.contact-divider { border: none; border-top: 1px solid var(--stone-800); margin: 16px 0; }
.small { font-size: 0.9rem; line-height: 1.5; }
.alias-wrap { margin-top: 12px; }
.alias-label { color: var(--stone-400); margin-bottom: 4px; }
.alias-line { font-size: 0.9rem; line-height: 1.6; }
.alias-line a { color: var(--stone-100); }
.alias-line a:hover { color: var(--gold); }
.mt-3 { margin-top: 1rem; }
</style>
