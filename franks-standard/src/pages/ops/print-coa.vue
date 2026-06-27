<template>
  <div class="specimen-wrap">
    <p class="specimen-banner no-print" role="alert">
      <strong>Office specimen only</strong> — not a valid COA for any item. Real certificates require listing photos, description, serial, and site-issued copy ID.
    </p>
    <CoaCertificateTemplate specimen />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'print', middleware: 'ops-auth' })

useSeoMeta({
  title: 'Print COA template | The Franks Standard',
  robots: 'noindex',
})
</script>

<style scoped>
.specimen-banner {
  max-width: 8.5in;
  margin: 0 auto 12px;
  padding: 12px 14px;
  border: 2px solid #b45309;
  background: #fffbeb;
  color: #92400e;
  font-size: 0.88rem;
  line-height: 1.45;
}
.specimen-wrap { padding: 16px; }
</style>
