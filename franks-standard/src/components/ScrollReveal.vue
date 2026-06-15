<template>
  <div ref="el" class="scroll-reveal" :class="{ 'is-visible': visible }">
    <slot />
  </div>
</template>

<script setup>
const el = ref(null)
const visible = ref(false)

onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    visible.value = true
    return
  }
  const node = el.value
  if (!node) {
    visible.value = true
    return
  }
  const obs = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        visible.value = true
        obs.disconnect()
      }
    },
    { threshold: 0.1, rootMargin: '0px 0px -48px 0px' },
  )
  obs.observe(node)
})
</script>

<style scoped>
.scroll-reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.scroll-reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  .scroll-reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
