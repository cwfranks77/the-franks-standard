import { getStoredOpsPhrase } from '~/utils/opsClientAuth'
import {
  loadLocalActivity,
  loadLocalMessages,
  seedDemoActivityIfEmpty,
  seedDemoMessagesIfEmpty,
  type ActivityEvent,
  type StoredMessage,
} from '~/utils/platformActivity'

export type OwnerTransaction = {
  id: string
  listing_id?: string
  buyer_id?: string
  seller_id?: string
  amount: number
  status: string
  created_at: string
}

export type OwnerContactRow = {
  id: string
  name: string | null
  email: string
  subject: string
  message: string
  created_at: string
}

export function useOwnerOpsFeed () {
  const config = useRuntimeConfig()
  const pending = ref(false)
  const loadError = ref('')
  const source = ref<'live' | 'local'>('local')

  const activity = ref<ActivityEvent[]>([])
  const transactions = ref<OwnerTransaction[]>([])
  const messages = ref<StoredMessage[]>([])
  const contactInbox = ref<OwnerContactRow[]>([])

  async function load () {
    pending.value = true
    loadError.value = ''

    seedDemoActivityIfEmpty()
    seedDemoMessagesIfEmpty()

    const base = String(config.public.supabaseUrl || '').replace(/\/$/, '')
    const phrase = getStoredOpsPhrase()

    if (base && phrase) {
      try {
        const res = await fetch(`${base}/functions/v1/ops-owner-feed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phrase, limit: 150 }),
        })
        if (res.ok) {
          const data = await res.json() as {
            activity?: ActivityEvent[]
            transactions?: OwnerTransaction[]
            messages?: StoredMessage[]
            contactInbox?: OwnerContactRow[]
          }
          activity.value = [...(data.activity || []), ...loadLocalActivity()]
            .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
            .slice(0, 200)
          transactions.value = data.transactions || []
          messages.value = [...(data.messages || []), ...loadLocalMessages()]
            .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
            .slice(0, 200)
          contactInbox.value = data.contactInbox || []
          source.value = 'live'
          pending.value = false
          return
        }
      } catch {
        loadError.value = 'Live ops feed unavailable — showing local session log.'
      }
    }

    activity.value = loadLocalActivity()
    messages.value = loadLocalMessages()
    transactions.value = [
      {
        id: 'demo-tx-1',
        amount: 125,
        status: 'paid',
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'demo-tx-2',
        amount: 89.5,
        status: 'escrow_hold',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ]
    contactInbox.value = []
    source.value = 'local'
    pending.value = false
  }

  onMounted(() => {
    load()
  })

  return {
    pending,
    loadError,
    source,
    activity,
    transactions,
    messages,
    contactInbox,
    reload: load,
  }
}
