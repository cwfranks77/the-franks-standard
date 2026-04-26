<template>
  <section class="showcase section">
    <div class="container">
      <h2 class="section-title text-center">Live energy from the floor</h2>
      <p class="section-subtitle text-center text-muted max-w">
        A rotating look at the kinds of inventory the Standard is built for. Browse will fill in as sellers come aboard.
      </p>
    </div>
    <div class="reel-wrap" aria-label="Product examples">
      <div class="reel-mask">
        <div class="reel-line">
          <article v-for="(item, i) in lineDoubled" :key="`x-${i}`" class="reel-card">
            <div class="reel-card-img">
              <img
                :src="item.src"
                :alt="i < items.length ? item.alt : ''"
                width="400"
                height="260"
                loading="lazy"
              />
              <span class="reel-coa">COA</span>
            </div>
            <h4>{{ item.title }}</h4>
            <p class="reel-cat">{{ item.tag }}</p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const items = [
  { title: 'Slabbed sports', tag: 'Cards', alt: 'Sports collectibles', src: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&w=400&h=260&q=80&fit=crop' },
  { title: 'Stage electrics', tag: 'Guitars', alt: 'Guitar', src: 'https://images.unsplash.com/photo-1525201548942-d3032a605a8e?auto=format&w=400&h=260&q=80&fit=crop' },
  { title: 'Chrono steel', tag: 'Watches', alt: 'Watch', src: 'https://images.unsplash.com/photo-1523170335258-f5b1183203bb?auto=format&w=400&h=260&q=80&fit=crop' },
  { title: 'Numismatics', tag: 'Coins', alt: 'Coins', src: 'https://images.unsplash.com/photo-1624366330919-0b5f42f16160?auto=format&w=400&h=260&q=80&fit=crop' },
  { title: 'Deadstock', tag: 'Sneakers', alt: 'Sneakers', src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&w=400&h=260&q=80&fit=crop' },
  { title: 'Gallery & estate', tag: 'Art', alt: 'Art and antiques', src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&w=400&h=260&q=80&fit=crop' },
]
const lineDoubled = computed(() => [...items, ...items])
</script>

<style scoped>
.showcase { background: linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 50%); }
.max-w { max-width: 700px; margin: 0 auto; }
.reel-wrap { margin-top: 20px; overflow: hidden; }
.reel-mask {
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
}
.reel-line {
  display: flex; gap: 20px; width: max-content;
  padding: 10px 0;
  animation: reel-infinite 42s linear infinite;
  will-change: transform;
}
@keyframes reel-infinite {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.reel-card {
  flex: 0 0 280px; background: var(--stone-900); border: 1px solid var(--stone-800);
  border-radius: var(--radius-lg); overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
.reel-card h4 { font-size: 0.95rem; padding: 12px 12px 4px; }
.reel-cat { color: var(--stone-500); font-size: 0.8rem; padding: 0 12px 12px; margin: 0; }
.reel-card-img { position: relative; aspect-ratio: 400/260; background: #111; }
.reel-card-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.reel-coa {
  position: absolute; bottom: 6px; right: 6px; font-size: 0.62rem; font-weight: 800;
  letter-spacing: 0.12em; color: var(--gold); background: rgba(0,0,0,0.6); padding: 3px 6px; border-radius: 4px;
}
@media (prefers-reduced-motion: reduce) {
  .reel-line { animation: none; }
}
</style>
