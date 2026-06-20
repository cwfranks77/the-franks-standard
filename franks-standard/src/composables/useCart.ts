import { ref, computed, watch } from 'vue'
import { louisianaTaxFromShippingZip } from '~/utils/louisianaShippingTax'
import { logPlatformActivity } from '~/utils/platformActivityRemote'

export type CartItem = {
  id: string
  name: string
  sku: string
  price: number
  quantity: number
  image?: string
}

const CART_STORAGE_KEY = 'bcpa_cart_v1'
const SHIPPING_ZIP_KEY = 'bcpa_cart_shipping_zip_v1'

const cartItems = ref<CartItem[]>([])
const shippingZip = ref('')
let syncTimer: ReturnType<typeof setTimeout> | null = null
let supabaseClient: ReturnType<typeof useSupabaseClient> | null = null

const loadCart = () => {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) cartItems.value = parsed
    }
    shippingZip.value = window.localStorage.getItem(SHIPPING_ZIP_KEY) || ''
  } catch (e) {
    console.warn('Failed to load cart from storage', e)
  }
}

const saveCartLocal = () => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems.value))
    window.localStorage.setItem(SHIPPING_ZIP_KEY, shippingZip.value)
  } catch (e) {
    console.warn('Failed to save cart to storage', e)
  }
}

async function pullRemoteCart (userId: string) {
  if (!supabaseClient) return
  const { data } = await supabaseClient
    .from('buyer_carts')
    .select('items, shipping_zip')
    .eq('user_id', userId)
    .maybeSingle()

  if (data?.items && Array.isArray(data.items) && data.items.length) {
    cartItems.value = data.items as CartItem[]
  }
  if (data?.shipping_zip) {
    shippingZip.value = String(data.shipping_zip)
  }
  saveCartLocal()
}

async function pushRemoteCart (userId: string) {
  if (!supabaseClient) return
  await supabaseClient.from('buyer_carts').upsert({
    user_id: userId,
    items: cartItems.value,
    shipping_zip: shippingZip.value || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })
}

function scheduleRemoteSync () {
  if (!import.meta.client || !supabaseClient) return
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(async () => {
    const { data: { session } } = await supabaseClient!.auth.getSession()
    if (!session?.user?.id) return
    await pushRemoteCart(session.user.id)
  }, 600)
}

function logCartActivity (action: string, metadata: Record<string, unknown> = {}) {
  if (!supabaseClient) return
  logPlatformActivity(supabaseClient, {
    action,
    action_category: 'transaction',
    event_type: 'cart_update',
    metadata: { ...metadata, shipping_zip: shippingZip.value || null },
  })
}

if (typeof window !== 'undefined') {
  loadCart()
}

watch(cartItems, () => {
  saveCartLocal()
  scheduleRemoteSync()
}, { deep: true })

watch(shippingZip, () => {
  saveCartLocal()
  scheduleRemoteSync()
})

export const useCart = () => {
  if (import.meta.client && !supabaseClient) {
    try {
      supabaseClient = useSupabaseClient()
      supabaseClient.auth.getSession().then(({ data }) => {
        if (data.session?.user?.id) pullRemoteCart(data.session.user.id)
      })
      supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.id) {
          pullRemoteCart(session.user.id)
        }
      })
    } catch { /* supabase module optional during SSR */ }
  }

  const items = computed(() => cartItems.value)

  const itemCount = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.quantity, 0),
  )

  const subtotal = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
  )

  const estimatedTax = computed(() => {
    if (!shippingZip.value || shippingZip.value.length < 5) return 0
    return louisianaTaxFromShippingZip(shippingZip.value, subtotal.value).taxAmount
  })

  const totalWithTax = computed(() => subtotal.value + estimatedTax.value)

  const setShippingZip = (zip: string) => {
    shippingZip.value = String(zip || '').trim().slice(0, 10)
  }

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
    logCartActivity('Item added to cart', { listing_id: payload.id, quantity: qty })
  }

  const updateQuantity = (id: string, quantity: number) => {
    const item = cartItems.value.find((i) => i.id === id)
    if (!item) return
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    item.quantity = quantity
    logCartActivity('Cart quantity updated', { listing_id: id, quantity })
  }

  const removeItem = (id: string) => {
    cartItems.value = cartItems.value.filter((i) => i.id !== id)
    logCartActivity('Item removed from cart', { listing_id: id })
  }

  const clearCart = () => {
    cartItems.value = []
    logCartActivity('Cart cleared')
  }

  return {
    items,
    itemCount,
    subtotal,
    estimatedTax,
    totalWithTax,
    shippingZip: computed(() => shippingZip.value),
    setShippingZip,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  }
}
