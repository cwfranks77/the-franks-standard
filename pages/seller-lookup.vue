<script setup>
/** Legacy path — old links used /seller-lookup without .html */
const route = useRoute()
await navigateTo({
  path: '/ops/seller-lookup',
  query: route.query,
}, { replace: true })
</script>
