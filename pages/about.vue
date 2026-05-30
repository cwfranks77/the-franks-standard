<template>
  <div class="page about-page">
    <div class="container">
      <ScrollReveal>
        <p class="eyebrow">Our story</p>
        <h1>About The Franks Standard</h1>
        <p class="text-muted lead">
          A <strong>marketplace facilitator</strong> for collectibles, gear, and high-trust resale.
          We connect buyers and sellers — we do not sell listed items or guarantee that any item is authentic.
        </p>
      </ScrollReveal>

      <div class="about-grid mt-4">
        <ScrollReveal>
          <article class="about-card">
            <h2>Our standard</h2>
            <p class="text-muted">
              Collectible listings require seller-provided proof (COA or signed guarantee template).
              We screen listings, hold funds in escrow, and enforce policies when misrepresentation is proven — that is not a Platform warranty of genuineness.
            </p>
          </article>
        </ScrollReveal>
        <ScrollReveal>
          <article class="about-card about-card-gold">
            <h2>Founder and developer</h2>
            <p class="text-muted">
              Founded and built by <strong>Charles Franks</strong>. Marketplace product, seller onboarding,
              Stripe payments, video meet, AI support, and proof workflows on one floor.
            </p>
            <a
              href="mailto:info@thefranksstandard.com?subject=Partnership%20or%20development"
              class="btn btn-primary btn-sm mt-2"
            >Contact Charles</a>
          </article>
        </ScrollReveal>
      </div>

      <ScrollReveal>
        <h2 class="section-title text-center mt-4">What we offer</h2>
        <div class="pill-grid">
          <NuxtLink v-for="p in offers" :key="p.label" :to="p.to" class="pill hover-lift">{{ p.label }}</NuxtLink>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div class="contact-banner">
          <div>
            <h2>Get in touch</h2>
            <p class="text-muted">Phone, email, chat, and video on the contact page.</p>
          </div>
          <div class="contact-banner-actions">
            <a href="tel:+18778370527" class="banner-phone">(877) 837-0527</a>
            <NuxtLink to="/contact" class="btn btn-primary">Contact page</NuxtLink>
          </div>
        </div>
      </ScrollReveal>

      <div class="row-btns mt-4">
        <NuxtLink to="/compare" class="btn btn-outline btn-lg">How we compare</NuxtLink>
        <NuxtLink to="/auth/register" class="btn btn-primary btn-lg">Join free</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'About - The Franks Standard',
  description: 'Marketplace facilitator for collectibles and gear — founded by Charles Franks. Seller proof and policy enforcement, not Platform authentication.',
})
const offers = [
  { label: 'Browse', to: '/browse' },
  { label: 'Sell', to: '/sell/start' },
  { label: 'For sellers', to: '/sellers' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Video meet', to: '/video' },
  { label: 'Support', to: '/support' },
]
</script>

<style scoped>
.about-page { padding: 56px 16px 100px; }
.eyebrow { font-size: 0.72rem; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 10px; }
.lead { font-size: 1.1rem; line-height: 1.65; margin-bottom: 28px; max-width: 720px; }
h1 { font-size: clamp(1.8rem, 4vw, 2.4rem); margin-bottom: 16px; }
.about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 960px; }
.about-card { padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--stone-800); background: rgba(255,255,255,0.03); height: 100%; }
.about-card-gold { border-color: rgba(255,216,77,0.3); }
.about-card h2 { font-size: 1.15rem; color: var(--gold); margin: 0 0 12px; }
.pill-grid { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; max-width: 800px; margin: 0 auto; }
.pill { padding: 10px 18px; border-radius: 999px; border: 1px solid #d7dde6; color: #374151; font-weight: 700; text-decoration: none; background: #fff; }
.pill:hover { border-color: var(--gold); color: var(--gold); }
.contact-banner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 20px; margin-top: 48px; padding: 28px 32px; border-radius: var(--radius-xl); border: 1px solid rgba(16,255,176,0.25); }
.banner-phone { font-family: Cinzel, serif; font-size: 1.2rem; color: var(--trust-green); text-decoration: none; display: block; margin-bottom: 10px; }
.row-btns { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
@media (max-width: 768px) { .about-grid { grid-template-columns: 1fr; } }
</style>
