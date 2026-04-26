<template>
  <div class="panel">
    <div class="container">
      <header class="panel-head">
        <div>
          <p class="eyebrow">Operator console</p>
          <h1>Franks Standard quick actions</h1>
          <p class="text-muted">Shortcuts and staged perks. Wire entitlements to your backend when ready.</p>
        </div>
        <button type="button" class="btn btn-outline btn-sm" @click="signOut">Sign out</button>
      </header>

      <div class="grid panel-grid mt-4">
        <section class="card panel-section">
          <h2>Marketplace</h2>
          <ul class="link-list">
            <li><NuxtLink to="/dashboard">Member dashboard</NuxtLink></li>
            <li><NuxtLink to="/sell">Create listing</NuxtLink></li>
            <li><NuxtLink to="/browse">Browse live</NuxtLink></li>
            <li><NuxtLink to="/pay">Pay and fees (Stripe links)</NuxtLink></li>
            <li><NuxtLink to="/video">Video call hub</NuxtLink></li>
            <li><NuxtLink to="/auth/register">Registration (QA)</NuxtLink></li>
          </ul>
        </section>

        <section class="card panel-section">
          <h2>Content</h2>
          <ul class="link-list">
            <li><NuxtLink to="/">Homepage</NuxtLink></li>
            <li><NuxtLink to="/compare">Competitive comparison</NuxtLink></li>
            <li><NuxtLink to="/how-it-works">How it works</NuxtLink></li>
          </ul>
        </section>

        <section class="card panel-section perks">
          <h2>Perks (staged)</h2>
          <p class="small text-muted">Placeholder list until Supabase/Stripe entitlements exist.</p>
          <ul class="checklist">
            <li>Founder: featured listing queue</li>
            <li>COA review fast-track</li>
            <li>Early-seller fee tier in Stripe metadata</li>
            <li>Priority dispute review to help inbox</li>
          </ul>
        </section>

        <section class="card panel-section">
          <h2>Checklist</h2>
          <p class="small text-muted">Real admin belongs on a server, not the static site.</p>
          <ul class="checklist">
            <li>Namecheap email inboxes: see continuity/NAMECHEAP-EMAIL.md</li>
            <li>Supabase: enable module when creds are ready</li>
            <li>Rotate NUXT_PUBLIC_OPS_ACCESS_KEY if the bundle is leaked</li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default', middleware: 'ops-auth' })
useSeoMeta({ title: 'Operator - The Franks Standard', robots: 'noindex, nofollow' })

const { revoke } = useOpsSession()
const router = useRouter()

function signOut () {
  revoke()
  router.push('/')
}
</script>

<style scoped>
.panel { padding: 60px 0 80px; }
.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
.eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 6px;
}
.panel-head h1 { font-size: 1.75rem; margin-bottom: 8px; }
.panel-grid { grid-template-columns: repeat(2, 1fr); }
@media (max-width: 900px) {
  .panel-grid { grid-template-columns: 1fr; }
}
.panel-section { padding: 20px 22px; }
.panel-section h2 { font-size: 1.05rem; color: var(--gold); margin-bottom: 12px; }
.perks { border-color: rgba(201, 168, 76, 0.35); }
.link-list { list-style: none; display: flex; flex-direction: column; gap: 10px; margin: 0; padding: 0; }
.link-list a { color: var(--stone-200); font-size: 0.95rem; }
.link-list a:hover { color: var(--gold); }
.checklist { margin: 0; padding-left: 1.1rem; color: var(--stone-300); font-size: 0.88rem; line-height: 1.5; }
.checklist li { margin-bottom: 8px; }
.small { font-size: 0.86rem; margin-bottom: 10px; }
</style>

