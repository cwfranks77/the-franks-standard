const STORAGE_KEY = 'tfs-platform-activity-v1'

export type ActivityEvent = {
  id: string
  user_id: string | null
  user_display_name: string | null
  ip_address: string | null
  user_agent: string
  action: string
  action_category: string
  metadata: Record<string, unknown>
  created_at: string
}

function uid () {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function loadLocalActivity (): ActivityEvent[] {
  if (!import.meta.client) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function appendLocalActivity (event: Omit<ActivityEvent, 'id' | 'created_at'> & { id?: string; created_at?: string }) {
  if (!import.meta.client) return
  const row: ActivityEvent = {
    id: event.id || uid(),
    user_id: event.user_id ?? null,
    user_display_name: event.user_display_name ?? null,
    ip_address: event.ip_address ?? 'browser-session',
    user_agent: event.user_agent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
    action: event.action,
    action_category: event.action_category,
    metadata: event.metadata || {},
    created_at: event.created_at || new Date().toISOString(),
  }
  const list = loadLocalActivity()
  list.unshift(row)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 500)))
}

export function seedDemoActivityIfEmpty () {
  if (!import.meta.client) return
  if (loadLocalActivity().length) return
  const samples: ActivityEvent[] = [
    {
      id: uid(),
      user_id: 'demo-seller-1',
      user_display_name: 'Graded Cards Co.',
      ip_address: '192.0.2.10',
      user_agent: 'Mozilla/5.0',
      action: 'Signed in',
      action_category: 'auth',
      metadata: {},
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: uid(),
      user_id: 'demo-buyer-2',
      user_display_name: 'Collector Mike',
      ip_address: '192.0.2.44',
      user_agent: 'Mozilla/5.0',
      action: 'Started checkout — listing escrow',
      action_category: 'transaction',
      metadata: { amount_cents: 12500 },
      created_at: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: uid(),
      user_id: 'demo-seller-1',
      user_display_name: 'Graded Cards Co.',
      ip_address: '192.0.2.10',
      user_agent: 'Mozilla/5.0',
      action: 'Message sent (on-platform)',
      action_category: 'message',
      metadata: { thread: 'listing-abc' },
      created_at: new Date(Date.now() - 900000).toISOString(),
    },
  ]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(samples))
}

const MESSAGES_KEY = 'tfs-platform-messages-v1'

export type StoredMessage = {
  id: string
  conversation_id: string
  sender_id: string
  sender_display_name: string
  body: string
  status: 'sent' | 'blocked' | 'flagged'
  blocked_pii: boolean
  pii_violations: { id: string; label: string }[]
  created_at: string
}

export function loadLocalMessages (): StoredMessage[] {
  if (!import.meta.client) return []
  try {
    const raw = localStorage.getItem(MESSAGES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function appendLocalMessage (msg: Omit<StoredMessage, 'id' | 'created_at'> & { id?: string }) {
  if (!import.meta.client) return
  const row: StoredMessage = {
    ...msg,
    id: msg.id || uid(),
    created_at: new Date().toISOString(),
  }
  const list = loadLocalMessages()
  list.unshift(row)
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(list.slice(0, 300)))
}

export function seedDemoMessagesIfEmpty () {
  if (!import.meta.client) return
  if (loadLocalMessages().length) return
  appendLocalMessage({
    conversation_id: 'conv-1',
    sender_id: 'demo-buyer-2',
    sender_display_name: 'Collector Mike',
    body: 'Is the COA included with this slab?',
    status: 'sent',
    blocked_pii: false,
    pii_violations: [],
  })
  appendLocalMessage({
    conversation_id: 'conv-1',
    sender_id: 'demo-buyer-3',
    sender_display_name: 'Blocked attempt',
    body: '[BLOCKED] User tried to share personal email',
    status: 'blocked',
    blocked_pii: true,
    pii_violations: [{ id: 'email', label: 'Personal email in message' }],
  })
}
