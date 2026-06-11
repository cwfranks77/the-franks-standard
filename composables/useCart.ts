import { ref, computed, watch } from 'vue'

export type CartItem = {
  id: string
  name: string
  sku: string
  price: number
  quantity: number
  image?: string
}

const CART_STORAGE_KEY = 'bcpa_cart_v1'

const cartItems = ref<CartItem[]>([])

const loadCart = () => {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      cartItems.value = parsed
    }
  } catch (e) {
    console.warn('Failed to load cart from storage', e)
  }
}

const saveCart = () => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(cartItems.value),
    )
  } catch (e) {
    console.warn('Failed to save cart to storage', e)
  }
}

if (typeof window !== 'undefined') {
  loadCart()
}

watch(
  cartItems,
  () => {
    saveCart()
  },
  { deep: true },
)

export const useCart = () => {
  const items = computed(() => cartItems.value)

  const itemCount = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.quantity, 0),
  )

  const subtotal = computed(() =>
    cartItems.value.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    ),
  )

  const addItem = (payload: {
    id: string
    name: string
    sku: string
    price: number
    image?: string
    quantity?: number
  }) => {
    const qty = payload.quantity && payload.quantity > 0 ? payload.quantity : 1
    const existing = cartItems.value.find((i) => i.id === payload.id)
    if (existing) {
      existing.quantity += qty
    } else {
      cartItems.value.push({
        id: payload.id,
        name: payload.name,
        sku: payload.sku,
        price: payload.price,
        image: payload.image,
        quantity: qty,
      })
    }
  }

  const removeItem = (id: string) => {
    cartItems.value = cartItems.value.filter((i) => i.id !== id)
  }

  const clearCart = () => {
    cartItems.value = []
  }

  return {
    items,
    itemCount,
    subtotal,
    addItem,
    removeItem,
    clearCart,
  }
}
