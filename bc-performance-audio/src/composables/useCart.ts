const cart = ref([])

export function useCart () {
  function addItem (item) {
    if (!item?.id) return
    const existing = cart.value.find((r) => r.id === item.id)
    if (existing) {
      existing.qty = (existing.qty || 1) + 1
    } else {
      cart.value.push({ ...item, qty: 1 })
    }
  }

  function clear () {
    cart.value = []
  }

  const itemCount = computed(() => cart.value.reduce((n, r) => n + (r.qty || 1), 0))

  return { cart, addItem, clear, itemCount }
}
