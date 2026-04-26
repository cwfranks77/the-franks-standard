<template>
  <div class="page">
    <div class="container">
      <div class="head">
        <h1>Categories</h1>
        <p class="text-muted">Browse by interest. Every live listing is backed by proof of authenticity where required.</p>
      </div>

      <div class="grid grid-3">
        <NuxtLink
          v-for="c in cats"
          :key="c.name"
          to="/browse"
          class="cat"
        >
          <span class="icon">{{ c.icon }}</span>
          <span class="name">{{ c.name }}</span>
          <span class="hint">Browse on marketplace</span>
        </NuxtLink>
      </div>

      <p class="text-center mt-4 text-muted">Listing something special? <NuxtLink to="/sell">Start a listing</NuxtLink></p>
    </div>
  </div>
</template>

<script setup>
const cats = [
  { icon: '🏆', name: 'Sports cards and memorabilia' },
  { icon: '🎸', name: 'Musical instruments' },
  { icon: '🔧', name: 'Firearms accessories' },
  { icon: '🪙', name: 'Coins and currency' },
  { icon: '🎨', name: 'Art and antiques' },
  { icon: '⌚', name: 'Watches and jewelry' },
  { icon: '👟', name: 'Sneakers and streetwear' },
  { icon: '🎮', name: 'Retro games and tech' },
]

useSeoMeta({
  title: 'Categories - The Franks Standard',
  description: 'Shop authentic collectibles, gear, and more. Every category on The Franks Standard is backed by COA or a signed guarantee.',
})
</script>

<style scoped>
.page { padding: 64px 0 100px; }
.head { text-align: center; max-width: 640px; margin: 0 auto 40px; }
h1 { font-size: 2rem; margin-bottom: 8px; }
.cat {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: 28px 16px; border: 1px solid var(--stone-800); border-radius: var(--radius-lg);
  background: var(--stone-900); text-decoration: none; color: inherit; transition: border-color 0.2s, transform 0.2s;
}
.cat:hover { border-color: var(--gold); transform: translateY(-2px); color: inherit; }
.icon { font-size: 2rem; margin-bottom: 10px; }
.name { font-family: 'Cinzel', serif; font-weight: 600; color: var(--stone-100); }
.hint { font-size: 0.78rem; color: var(--stone-500); margin-top: 6px; }
</style>
