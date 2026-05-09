<template>
  <div class="od-page">
    <div class="container narrow">
      <p class="eyebrow">Built for and by collectors</p>
      <h1>Open Door Policy</h1>
      <p class="lead text-muted">
        The Franks Standard is not a faceless platform. The developers, the founder, and the team behind
        this marketplace are <strong>accessible, accountable, and listening</strong>. If you have feedback,
        a partnership idea, or a technical suggestion — we want to hear it.
      </p>

      <section class="od-card">
        <h2>Why we do this</h2>
        <p class="text-muted">
          Most marketplaces grow so fast that they stop hearing the people who built their floor. We are choosing a
          different path: the platform stays built for collectors because collectors can reach the people building it.
          No ticket queue. No "we'll get back to you in 7–10 business days." Real feedback from real users shapes
          every release.
        </p>
      </section>

      <section class="od-card">
        <h2>How to reach us</h2>
        <div class="od-channels">
          <div class="od-channel">
            <span class="od-icon">✉️</span>
            <div>
              <h4>General feedback and ideas</h4>
              <p><a href="mailto:info@thefranksstandard.com?subject=Open%20Door%20Feedback">info@thefranksstandard.com</a></p>
              <p class="text-muted small">Subject line: "Open Door Feedback" — goes straight to the team, not a bot.</p>
            </div>
          </div>
          <div class="od-channel">
            <span class="od-icon">🔧</span>
            <div>
              <h4>Technical feedback and bug reports</h4>
              <p><a href="mailto:info@thefranksstandard.com?subject=Technical%20Feedback">info@thefranksstandard.com</a></p>
              <p class="text-muted small">Subject line: "Technical Feedback" — include browser, device, and screenshots if possible.</p>
            </div>
          </div>
          <div class="od-channel">
            <span class="od-icon">🤝</span>
            <div>
              <h4>Partnership and collaboration inquiries</h4>
              <p><a href="mailto:info@thefranksstandard.com?subject=Partnership%20Inquiry">info@thefranksstandard.com</a></p>
              <p class="text-muted small">Grading companies, authentication services, logistics partners, content creators — we're open.</p>
            </div>
          </div>
          <div class="od-channel">
            <span class="od-icon">📞</span>
            <div>
              <h4>Talk to us</h4>
              <p><a href="tel:+18778370527">(877) 837-0527</a></p>
              <p class="text-muted small">AI-powered customer service with human escalation. Or use <NuxtLink to="/video">Video</NuxtLink> for face-to-face.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="od-card commitment-card">
        <h2>Our commitment</h2>
        <div class="od-commitments">
          <div class="commit-item">
            <span class="commit-check">✓</span>
            <p><strong>Every email gets a human response</strong> — not an auto-reply, not a ticket number, a real answer from someone who works on the platform.</p>
          </div>
          <div class="commit-item">
            <span class="commit-check">✓</span>
            <p><strong>Feature requests are tracked publicly</strong> — we will publish a roadmap so you can see what is coming and what was suggested by the community.</p>
          </div>
          <div class="commit-item">
            <span class="commit-check">✓</span>
            <p><strong>Bug reports get priority</strong> — if something is broken, we want to know before it affects your sale or your trust.</p>
          </div>
          <div class="commit-item">
            <span class="commit-check">✓</span>
            <p><strong>Founder is reachable</strong> — Charles Franks reads feedback personally. The name on the site is the name behind the standard.</p>
          </div>
        </div>
      </section>

      <section class="od-card">
        <h2>For developers and technical partners</h2>
        <p class="text-muted">
          If you are a developer, security researcher, or technical partner: we welcome responsible disclosure,
          integration ideas, and API collaboration. The Franks Standard is built on open web standards (Nuxt, Vue,
          Supabase, Stripe) and we believe in transparency about how the platform works.
        </p>
        <p class="text-muted mt-2">
          Interested in building on top of The Franks Standard or integrating with us? Reach out with
          "Technical Partnership" in the subject line.
        </p>
      </section>

      <div class="od-cta text-center">
        <p class="text-muted">The door is open. The floor is yours.</p>
        <div class="od-cta-row">
          <a href="mailto:info@thefranksstandard.com?subject=Open%20Door%20Feedback" class="btn btn-primary btn-lg">Send feedback</a>
          <NuxtLink to="/roadmap" class="btn btn-outline btn-lg">See the roadmap</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Open Door Policy — The Franks Standard',
  description: 'The developers and founder of The Franks Standard are accessible for feedback, partnerships, and technical collaboration. Built for and by collectors.',
})
</script>

<style scoped>
.od-page { padding: 48px 0 80px; }
.narrow { max-width: 780px; margin: 0 auto; }
.eyebrow { font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 10px; }
.lead { font-size: 1.08rem; line-height: 1.65; margin-bottom: 32px; }
h1 { font-size: 2rem; margin-bottom: 12px; }
.od-card { margin-bottom: 28px; padding: 28px 24px; border: 1px solid var(--stone-800); border-radius: var(--radius-lg); background: var(--stone-900); }
.od-card h2 { font-size: 1.2rem; color: var(--gold); margin: 0 0 14px; }
.od-channels { display: flex; flex-direction: column; gap: 20px; }
.od-channel { display: flex; gap: 14px; align-items: flex-start; }
.od-icon { font-size: 1.6rem; flex: 0 0 auto; margin-top: 2px; }
.od-channel h4 { font-size: 0.95rem; margin: 0 0 4px; color: var(--stone-100); font-family: 'Inter', sans-serif; }
.od-channel p { margin: 0; font-size: 0.9rem; }
.od-channel a { color: var(--gold); font-weight: 600; }
.small { font-size: 0.82rem; margin-top: 2px; }
.commitment-card { border-color: rgba(0, 245, 160, 0.25); background: linear-gradient(135deg, rgba(0, 245, 160, 0.04), var(--stone-900)); }
.od-commitments { display: flex; flex-direction: column; gap: 14px; }
.commit-item { display: flex; gap: 12px; align-items: flex-start; }
.commit-check { color: var(--trust-green); font-weight: 800; font-size: 1.1rem; flex: 0 0 auto; margin-top: 2px; }
.commit-item p { font-size: 0.9rem; color: var(--stone-200); line-height: 1.55; margin: 0; }
.od-cta { margin-top: 40px; }
.od-cta-row { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 16px; }
.mt-2 { margin-top: 12px; }
</style>
