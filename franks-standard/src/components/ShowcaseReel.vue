<template>
  <section class="showcase section">
    <div class="container">
      <h2 class="section-title text-center">Live energy from the floor</h2>
      <p class="section-subtitle text-center text-muted max-w">
        A non-stop reel: streetwear, slabs, chrono, gallery work. The Standard is a lookbook, not a grid of gray boxes.
      </p>
      <p class="reel-hint text-center text-muted">Scroll sideways to browse — you can select and copy any label.</p>
    </div>
    <div class="reel-scroll" tabindex="0" aria-label="Product examples — scroll horizontally">
      <div class="reel-line">
        <article v-for="(item, i) in items" :key="item.title" class="reel-card">
          <div class="reel-card-img">
            <img
              :src="item.src"
              :alt="item.alt"
              width="400"
              height="260"
              loading="lazy"
              draggable="false"
              @error="onReelImgError"
            />
            <span class="reel-coa">COA</span>
          </div>
          <h4>{{ item.title }}</h4>
          <p class="reel-cat">{{ item.tag }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
function onReelImgError (e) {
  const el = e?.target
  if (!el || el.dataset?.fallbackReel) { return }
  el.dataset.fallbackReel = '1'
  el.src = '/img/hero-showcase-v2.svg'
}

const items = [
  { title: 'Slabbed sports', tag: 'Cards', alt: 'Sports collectibles', src: '/img/reel-cards.svg' },
  { title: 'Stage electrics', tag: 'Guitars', alt: 'Guitar', src: '/img/reel-guitars.svg' },
  { title: 'Chrono steel', tag: 'Watches', alt: 'Watch', src: '/img/reel-watches.svg' },
  { title: 'Numismatics', tag: 'Coins', alt: 'Coins', src: '/img/reel-coins.svg' },
  { title: 'Deadstock', tag: 'Sneakers', alt: 'Sneakers', src: '/img/hero-showcase-v2.svg' },
  { title: 'Gallery & estate', tag: 'Art', alt: 'Art and antiques', src: '/img/hero-showcase-v2.svg' },
]
</script>

<style scoped>
.showcase { background: linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 50%); }
.max-w { max-width: 700px; margin: 0 auto; }
.reel-hint {
  font-size: 0.82rem;
  margin: 8px auto 0;
  max-width: 520px;
  color: #374151;
  font-weight: 600;
}
.reel-scroll {
  margin-top: 20px;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x proximity;
  padding: 10px 16px 18px;
  user-select: text;
  -webkit-user-select: text;
  cursor: auto;
}
.reel-line {
  display: flex;
  gap: 20px;
  width: max-content;
  min-width: 100%;
}
.reel-card {
  flex: 0 0 280px;
  scroll-snap-align: start;
  background: linear-gradient(180deg, rgba(18, 8, 32, 0.95), #111827);
  border: 1px solid rgba(0, 224, 255, 0.35);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 36px rgba(0,0,0,0.25);
  color: #f9fafb;
  user-select: text;
  -webkit-user-select: text;
  pointer-events: auto;
}
.reel-card:hover {
  border-color: rgba(0, 224, 255, 0.55);
}
.reel-card h4 {
  font-size: 0.95rem;
  padding: 12px 12px 4px;
  color: #ffffff;
  -webkit-text-fill-color: #ffffff;
  font-weight: 800;
}
.reel-cat {
  color: #e5e7eb;
  -webkit-text-fill-color: #e5e7eb;
  font-size: 0.8rem;
  padding: 0 12px 14px;
  margin: 0;
  font-weight: 600;
}
.reel-card-img { position: relative; aspect-ratio: 400/260; background: #111; }
.reel-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
  user-select: none;
}
.reel-coa {
  position: absolute; bottom: 6px; right: 6px; font-size: 0.62rem; font-weight: 800;
  letter-spacing: 0.12em; color: var(--gold); background: rgba(0,0,0,0.75); padding: 3px 6px; border-radius: 4px;
}
.reel-scroll:focus-visible {
  outline: 2px solid #146eb4;
  outline-offset: 2px;
}
</style>
