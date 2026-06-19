const STORAGE_KEY = 'bc-audio-cart'

type CartItem = {
  id: string
  name: string
  sku?: string
  price: number
  image?: string
  qty?: number
}

const cart = ref<CartItem[]>([])
let hydrated = false

function readStoredCart (): CartItem[] {
  if (!import.meta.client) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistCart () {
  if (!import.meta.client) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart.value))
}

function hydrateCart () {
  if (hydrated || !import.meta.client) return
  cart.value = readStoredCart()
  hydrated = true
}

export function useCart () {
  if (import.meta.client) hydrateCart()

  function addItem (item: CartItem) {
    if (!item?.id) return
    hydrateCart()
    const existing = cart.value.find((r) => r.id === item.id)
    if (existing) {
      existing.qty = (existing.qty || 1) + 1
    } else {
      cart.value.push({ ...item, qty: 1 })
    }
    persistCart()
  }

  function removeItem (id: string) {
    hydrateCart()
    cart.value = cart.value.filter((r) => r.id !== id)
    persistCart()
  }

  function clear () {
    cart.value = []
    persistCart()
  }

  function hasItem (id: string) {
    hydrateCart()
    return cart.value.some((r) => r.id === id)
  }

  const itemCount = computed(() => cart.value.reduce((n, r) => n + (r.qty || 1), 0))

  const subtotal = computed(() =>
    cart.value.reduce((sum, r) => sum + (Number(r.price) || 0) * (r.qty || 1), 0),
  )

  return { cart, addItem, removeItem, clear, hasItem, itemCount, subtotal }
}
