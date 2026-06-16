<script setup>
const { contactInbox, pending, reload } = useOwnerOpsFeed()
</script>

<template>
  <div class="space-y-3 text-sm">
    <p class="text-white/80">
      Public contact form submissions — visible to operators only, not on seller profiles.
    </p>
    <button type="button" class="text-xs text-primary hover:underline" @click="reload">Refresh</button>
    <p v-if="pending" class="text-white/60">Loading…</p>
    <ul v-else class="space-y-2 max-h-64 overflow-y-auto">
      <li
        v-for="row in contactInbox"
        :key="row.id"
        class="border border-border rounded p-3 bg-bg/50"
      >
        <p class="font-medium text-white">{{ row.subject }}</p>
        <p class="text-xs text-white/55">{{ row.name || 'Visitor' }} · {{ new Date(row.created_at).toLocaleString() }}</p>
        <p class="text-white/75 mt-1">{{ row.message }}</p>
      </li>
      <li v-if="!contactInbox.length" class="text-white/60 text-center py-4">
        No contact submissions in feed (requires live Supabase ops connection).
      </li>
    </ul>
  </div>
</template>
