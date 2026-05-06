<template>
  <section class="showcase section">
    <div class="container">
      <h2 class="section-title text-center">Live energy from the floor</h2>
      <p class="section-subtitle text-center text-muted max-w">
        A non-stop reel: streetwear, slabs, chrono, gallery work. The Standard is a lookbook, not a grid of gray boxes.
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
                @error="onReelImgError"
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
function onReelImgError (e) {
  const el = e?.target
  if (!el || el.dataset?.fallbackReel) { return }
  el.dataset.fallbackReel = '1'
  el.src = '/img/hero-showcase.svg'
}

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
  animation: reel-infinite 36s linear infinite;
  will-change: transform;
}
@keyframes reel-infinite {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.reel-card {
  flex: 0 0 280px;
  background: linear-gradient(180deg, rgba(18, 8, 32, 0.8), var(--stone-900));
  border: 1px solid rgba(0, 224, 255, 0.2);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(255, 45, 122, 0.12) inset, 0 10px 36px rgba(0,0,0,0.4);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s;
}
.reel-card:hover {
  transform: translateY(-4px) scale(1.01);
  border-color: rgba(0, 224, 255, 0.45);
  box-shadow: 0 0 32px rgba(255, 45, 122, 0.15), 0 12px 40px rgba(0,0,0,0.45);
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
