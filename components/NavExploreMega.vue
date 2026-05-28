<template>
  <div
    class="nav-more"
    :class="{ open: open }"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <button
      type="button"
      class="nav-more-btn"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      Explore
      <span class="chev" aria-hidden="true" />
    </button>
    <div v-show="open" class="nav-mega-panel" @click.stop>
      <div
        v-for="section in sections"
        :key="section.id"
        class="nav-mega-col"
        :class="'nav-mega-col--' + section.accent"
      >
        <h4>{{ section.label }}</h4>
        <NuxtLink
          v-for="item in section.items"
          :key="item.to"
          :to="item.to"
          class="nav-mega-link"
          @click="emit('navigate')"
        >
          <strong>{{ item.label }}</strong>
          <span>{{ item.desc }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { NAV_EXPLORE_SECTIONS } from '~/utils/navExploreMenu.js'

const emit = defineEmits(['navigate'])
const open = ref(false)
const sections = NAV_EXPLORE_SECTIONS

let hoverOk = true
onMounted(() => {
  if (!import.meta.client) return
  const mq = window.matchMedia('(min-width: 769px)')
  const sync = () => { hoverOk = mq.matches }
  sync()
  mq.addEventListener('change', sync)
})

function onEnter () {
  if (import.meta.client && hoverOk) open.value = true
}
function onLeave () {
  if (import.meta.client && hoverOk) open.value = false
}
function toggle () {
  open.value = !open.value
}
</script>
