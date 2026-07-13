<script setup>
definePageMeta({ layout: false })

useHead({
  title: 'The Franks Standard',
  meta: [{ name: 'description', content: 'Coming soon.' }],
})
</script>

<template>
  <div class="coming-soon coming-soon--tfs">
    <h1>The Franks Standard</h1>
    <p>Coming soon</p>
  </div>
</template>

<style scoped>
.coming-soon {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.coming-soon--tfs {
  background: #0d1117;
  color: #f3f4f6;
}

.coming-soon--tfs h1 {
  font-size: clamp(1.75rem, 5vw, 2.75rem);
  font-weight: 700;
  margin: 0 0 1rem;
}

.coming-soon--tfs p {
  font-size: 1.25rem;
  color: #9ca3af;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0;
}
</style>
