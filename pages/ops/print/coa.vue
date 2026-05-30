<template>
  <CoaCertificateTemplate specimen />
</template>

<script setup>
definePageMeta({ layout: 'print', middleware: 'ops-auth' })

useSeoMeta({
  title: 'Print COA template | The Franks Standard',
  robots: 'noindex',
})
</script>
