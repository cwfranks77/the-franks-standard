<template>
  <div class="theme-editor">
    <h2>Theme Editor</h2>
    <label>Name <input v-model="theme.name" /></label>
    <label>Slug <input v-model="theme.slug" /></label>
    <label>Primary Color <input v-model="theme.settings.primaryColor" type="color" /></label>
    <label>Accent Color <input v-model="theme.settings.accentColor" type="color" /></label>
    <button @click="save">Save Theme</button>
    <button @click="activate">Activate</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const theme = ref({ name: '', slug: '', settings: { primaryColor: '#000000', accentColor: '#ff0000' } });

async function save() {
  await fetch('/api/owner/theme/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(theme.value) });
  alert('Saved');
}
async function activate() {
  await fetch('/api/owner/theme/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...theme.value, active: true }) });
  alert('Activated');
}
</script>
