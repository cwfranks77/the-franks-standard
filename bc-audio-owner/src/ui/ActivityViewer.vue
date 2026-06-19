<template>
  <div>
    <h2>Recent Activity</h2>
    <ul>
      <li v-for="a in activities" :key="a._id">{{ a.createdAt }} - {{ a.userId }} - {{ a.path }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const activities = ref([]);
onMounted(async () => {
  const res = await fetch('/api/owner/activity/recent');
  const data = await res.json();
  activities.value = data.items || [];
});
</script>
