<template>
  <footer class="mkt-landing-footer">
    <div class="container">
      <div class="mkt-landing-footer__grid">
        <div class="mkt-landing-footer__brand">
          <img
            src="/franks-pavilion.png"
            alt=""
            class="mkt-landing-footer__logo"
            @error="onPavilionImgError"
          />
          <p class="mkt-landing-footer__site-name">The Franks Standard</p>
          <p class="text-muted">
            The Franks Standard LLC — marketplace facilitator for collectors and gear. Sellers back collectible listings; we screen and enforce policies — we do not guarantee item authenticity.
          </p>
          <div v-if="socialLinks.length" class="mkt-landing-footer__follow">
            <p class="mkt-landing-footer__follow-label">Follow us</p>
            <div class="mkt-landing-footer__social-row">
              <a
                v-for="link in socialLinks"
                :key="link.id"
                :href="link.url"
                class="mkt-landing-footer__social-link"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="`Follow on ${link.label}`"
              >{{ link.label }}</a>
            </div>
          </div>
          <p v-else class="mkt-landing-footer__follow-hint text-muted small">
            <NuxtLink to="/social">Social &amp; updates</NuxtLink> ·
            <NuxtLink to="/open-door">Talk to the founder</NuxtLink>
          </p>
        </div>
        <div class="mkt-landing-footer__col">
          <h4>Marketplace</h4>
          <NuxtLink to="/browse">Browse All</NuxtLink>
          <NuxtLink to="/sell/start">Sell an Item</NuxtLink>
          <NuxtLink to="/categories">Categories</NuxtLink>
          <NuxtLink to="/pricing">Pricing</NuxtLink>
          <NuxtLink to="/video">Video Calls</NuxtLink>
        </div>
        <div class="mkt-landing-footer__col">
          <h4>Sellers</h4>
          <NuxtLink to="/sellers">For Stores &amp; Sellers</NuxtLink>
          <NuxtLink to="/store-builder">AI Store Builder</NuxtLink>
          <NuxtLink to="/launch-offer">Launch Offer</NuxtLink>
          <NuxtLink to="/join/founders10">Founding Sellers (3 mo Pro)</NuxtLink>
          <NuxtLink to="/honor">Honor Our Heroes (6 mo Pro)</NuxtLink>
          <NuxtLink to="/how-it-works">How It Works</NuxtLink>
          <NuxtLink to="/seller-tools">Appraisal &amp; comp tools</NuxtLink>
          <NuxtLink to="/learn/tools">Coin &amp; authenticity tools</NuxtLink>
          <NuxtLink to="/collections">Collections &amp; limited drops</NuxtLink>
          <NuxtLink to="/partners/creators">Creator affiliates</NuxtLink>
          <NuxtLink to="/social">Social promotion</NuxtLink>
          <NuxtLink to="/top-sellers">Top sellers program</NuxtLink>
          <NuxtLink to="/support">Support</NuxtLink>
        </div>
        <div class="mkt-landing-footer__col">
          <h4>Legal</h4>
          <NuxtLink to="/terms">Terms of Service</NuxtLink>
          <NuxtLink to="/marketplace-policy">Marketplace Policies</NuxtLink>
          <NuxtLink to="/protection">Protection overview</NuxtLink>
          <NuxtLink to="/privacy">Privacy Policy</NuxtLink>
          <NuxtLink to="/prohibited-items">Prohibited Items</NuxtLink>
          <NuxtLink to="/seller-agreement">Seller Agreement</NuxtLink>
        </div>
        <div class="mkt-landing-footer__col mkt-landing-footer__col--contact">
          <h4>Contact</h4>
          <a href="tel:+18778370527" class="mkt-landing-footer__contact-line">(877) 837-0527</a>
          <a href="mailto:info@thefranksstandard.com" class="mkt-landing-footer__contact-line">info@thefranksstandard.com</a>
          <NuxtLink to="/contact">Full contact page</NuxtLink>
          <NuxtLink to="/support">Support &amp; tech</NuxtLink>
          <NuxtLink to="/download">Download app</NuxtLink>
          <NuxtLink to="/about">About us</NuxtLink>
        </div>
      </div>
      <div class="mkt-landing-footer__bottom">
        <p>&copy; {{ year }} The Franks Standard &bull; Founded by Charles Franks &bull; All rights reserved.</p>
        <p v-if="isSignedIn" class="mkt-landing-footer__signout">
          Signed in as {{ displayEmail }} —
          <button type="button" class="mkt-landing-footer__signout-btn" @click="onSignOut">Sign out</button>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { buildSocialLinks } from '~/utils/siteSocial.js'

const config = useRuntimeConfig()
const { isSignedIn, displayEmail, signOut } = useAuthNav()
const socialLinks = computed(() => buildSocialLinks(config.public))
const year = new Date().getFullYear()

async function onSignOut () {
  await signOut()
}

function onPavilionImgError (e) {
  const el = e?.target
  if (!el || el.dataset?.pavilionFallback) return
  el.dataset.pavilionFallback = '1'
  el.src = '/logo.svg'
}
</script>

<style scoped>
.mkt-landing-footer {
  margin-top: 0;
  padding: 60px 0 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: #121216;
  color: #f5f5f7;
}
.mkt-landing-footer__grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 36px;
}
.mkt-landing-footer__logo {
  width: 100px;
  height: 56px;
  object-fit: cover;
  object-position: 50% 32%;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  margin-bottom: 12px;
  display: block;
}
.mkt-landing-footer__follow { margin-top: 14px; }
.mkt-landing-footer__follow-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #ffd814;
  font-weight: 800;
  margin: 0 0 8px;
}
.mkt-landing-footer__social-row { display: flex; flex-wrap: wrap; gap: 8px 12px; }
.mkt-landing-footer__social-link {
  font-size: 0.85rem;
  color: #e5e7eb;
  text-decoration: none;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}
.mkt-landing-footer__social-link:hover { color: #ffd814; border-color: rgba(255, 216, 20, 0.45); }
.mkt-landing-footer__follow-hint { margin-top: 12px; line-height: 1.5; }
.mkt-landing-footer__follow-hint a { color: #ffd814; }
.mkt-landing-footer__site-name {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1.15rem;
  color: #f5f5f7;
  margin: 0 0 6px;
}
.mkt-landing-footer__col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.mkt-landing-footer__col h4 {
  font-family: 'Cinzel', serif;
  font-size: 0.95rem;
  color: #ffd814;
  margin-bottom: 4px;
}
.mkt-landing-footer__col a {
  color: #9ca3af;
  font-size: 0.9rem;
  text-decoration: none;
}
.mkt-landing-footer__col a:hover { color: #f5f5f7; }
.mkt-landing-footer__col--contact .mkt-landing-footer__contact-line {
  color: #f5f5f7;
  font-weight: 600;
  font-size: 0.92rem;
}
.mkt-landing-footer__col--contact .mkt-landing-footer__contact-line:hover { color: #ffd814; }
.mkt-landing-footer__bottom {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
  color: #7a8190;
  font-size: 0.85rem;
}
.mkt-landing-footer__signout {
  margin-top: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #9ca3af;
}
.mkt-landing-footer__signout-btn {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-weight: 800;
  color: #ffd814;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}
@media (max-width: 768px) {
  .mkt-landing-footer__grid { grid-template-columns: 1fr 1fr; gap: 30px; }
}
@media (max-width: 480px) {
  .mkt-landing-footer__grid { grid-template-columns: 1fr; }
}
</style>
