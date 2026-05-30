<template>
  <div
    ref="rootEl"
    class="nav-more"
    :class="{ open: open }"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <button
      type="button"
      class="nav-more-btn"
      :aria-expanded="open"
      aria-haspopup="true"
      @click.stop="onBtnClick"
    >
      {{ label }}
      <span class="chev" aria-hidden="true" />
    </button>
    <div
      v-show="open"
      class="nav-mega-panel"
      :class="`nav-mega-panel--cols-${colCount}`"
      role="menu"
      @click.stop
    >
      <div
        v-for="section in sections"
        :key="section.id"
        class="nav-mega-col"
        :class="'nav-mega-col--' + section.accent"
      >
        <h4>{{ section.label }}</h4>
        <template v-for="item in section.items" :key="itemKey(item)">
          <button
            v-if="item.action === 'signout'"
            type="button"
            class="nav-mega-link nav-mega-link--action"
            role="menuitem"
            @click="onActionClick(item)"
          >
            <strong>{{ item.label }}</strong>
            <span>{{ item.desc }}</span>
          </button>
          <NuxtLink
            v-else
            :to="item.to"
            class="nav-mega-link"
            role="menuitem"
            @click="onLinkClick"
          >
            <strong>{{ item.label }}</strong>
            <span>{{ item.desc }}</span>
          </NuxtLink>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  label: { type: String, required: true },
  sections: { type: Array, required: true },
})

const emit = defineEmits(['navigate', 'action'])
const open = ref(false)
const rootEl = ref(null)

const colCount = computed(() => Math.min(4, Math.max(1, props.sections?.length || 1)))

let hoverOk = true
let leaveTimer = null

onMounted(() => {
  if (!import.meta.client) return
  const mq = window.matchMedia('(min-width: 769px)')
  const sync = () => { hoverOk = mq.matches }
  sync()
  mq.addEventListener('change', sync)
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onDocKey)
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onDocKey)
  if (leaveTimer) clearTimeout(leaveTimer)
})

function onEnter () {
  if (leaveTimer) {
    clearTimeout(leaveTimer)
    leaveTimer = null
  }
  if (import.meta.client && hoverOk) open.value = true
}

function onLeave () {
  if (!import.meta.client || !hoverOk) return
  leaveTimer = setTimeout(() => {
    open.value = false
    leaveTimer = null
  }, 180)
}

function onBtnClick () {
  open.value = !open.value
}

function itemKey (item) {
  return `${item.action || item.to || ''}-${item.label}`
}

function onLinkClick () {
  open.value = false
  emit('navigate')
}

function onActionClick (item) {
  open.value = false
  emit('navigate')
  emit('action', item.action, item)
}

function onDocClick (e) {
  if (!open.value || !rootEl.value) return
  if (!rootEl.value.contains(e.target)) open.value = false
}

function onDocKey (e) {
  if (e.key === 'Escape' && open.value) open.value = false
}

defineExpose({ close: () => { open.value = false } })
</script>
