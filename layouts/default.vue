<template>
  <div class="site-wrapper">
    <header class="site-header">
      <div class="container header-inner">
        <NuxtLink to="/" class="header-brand">
          <img src="/logo.png" alt="The Franks Standard" class="header-logo" />
          <span class="header-name">The Franks Standard</span>
        </NuxtLink>

        <nav class="header-nav" :class="{ open: menuOpen }">
          <NuxtLink to="/browse" class="nav-link" @click="menuOpen = false">Browse</NuxtLink>
          <NuxtLink to="/sell" class="nav-link" @click="menuOpen = false">Sell</NuxtLink>
          <NuxtLink to="/how-it-works" class="nav-link" @click="menuOpen = false">How It Works</NuxtLink>
          <NuxtLink to="/auth/login" class="btn btn-outline btn-sm" @click="menuOpen = false">Sign In</NuxtLink>
          <NuxtLink to="/auth/register" class="btn btn-primary btn-sm" @click="menuOpen = false">Join Free</NuxtLink>
        </nav>

        <button class="menu-toggle" @click="menuOpen = !menuOpen" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>

    <main class="site-main">
      <slot />
    </main>

    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <img src="/logo.png" alt="The Franks Standard" class="footer-logo" />
            <p class="text-muted">The marketplace where authenticity isn't optional — it's the standard.</p>
          </div>
          <div class="footer-col">
            <h4>Marketplace</h4>
            <NuxtLink to="/browse">Browse All</NuxtLink>
            <NuxtLink to="/sell">Sell an Item</NuxtLink>
            <NuxtLink to="/categories">Categories</NuxtLink>
          </div>
          <div class="footer-col">
            <h4>Company</h4>
            <NuxtLink to="/how-it-works">How It Works</NuxtLink>
            <NuxtLink to="/about">About Us</NuxtLink>
            <NuxtLink to="/contact">Contact</NuxtLink>
          </div>
          <div class="footer-col">
            <h4>Legal</h4>
            <NuxtLink to="/terms">Terms of Service</NuxtLink>
            <NuxtLink to="/privacy">Privacy Policy</NuxtLink>
            <NuxtLink to="/prohibited-items">Prohibited Items</NuxtLink>
            <NuxtLink to="/seller-agreement">Seller Agreement</NuxtLink>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; {{ new Date().getFullYear() }} The Franks Standard &bull; Founded by Charles Franks &bull; All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const menuOpen = ref(false)
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--stone-800);
}
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}
.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--stone-100);
}
.header-brand:hover { color: var(--gold); }
.header-logo { height: 40px; width: auto; }
.header-name {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1.15rem;
  letter-spacing: 0.5px;
}
.header-nav {
  display: flex;
  align-items: center;
  gap: 24px;
}
.nav-link {
  color: var(--stone-300);
  font-weight: 500;
  font-size: 0.9rem;
  transition: color 0.2s;
}
.nav-link:hover, .nav-link.router-link-active { color: var(--gold); }

.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}
.menu-toggle span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--stone-300);
  border-radius: 2px;
  transition: 0.2s;
}

@media (max-width: 768px) {
  .menu-toggle { display: flex; }
  .header-nav {
    display: none;
    position: absolute;
    top: 70px;
    left: 0;
    right: 0;
    flex-direction: column;
    padding: 20px;
    background: var(--stone-950);
    border-bottom: 1px solid var(--stone-800);
    gap: 16px;
  }
  .header-nav.open { display: flex; }
}

.site-main { min-height: calc(100vh - 70px - 300px); }

.site-footer {
  margin-top: 80px;
  padding: 60px 0 30px;
  border-top: 1px solid var(--stone-800);
  background: rgba(26, 26, 46, 0.7);
}
.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
}
.footer-logo { height: 50px; margin-bottom: 12px; }
.footer-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.footer-col h4 {
  font-family: 'Cinzel', serif;
  font-size: 0.95rem;
  color: var(--gold);
  margin-bottom: 4px;
}
.footer-col a {
  color: var(--stone-400);
  font-size: 0.9rem;
}
.footer-col a:hover { color: var(--stone-100); }
.footer-bottom {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--stone-800);
  text-align: center;
  color: var(--stone-500);
  font-size: 0.85rem;
}
@media (max-width: 768px) {
  .footer-grid { grid-template-columns: 1fr 1fr; gap: 30px; }
}
@media (max-width: 480px) {
  .footer-grid { grid-template-columns: 1fr; }
}
</style>
