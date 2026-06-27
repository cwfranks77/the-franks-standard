<script setup>
import { validatePlatformMessage, MESSAGING_POLICY } from '~/utils/platformMessaging'
import { appendLocalMessage } from '~/utils/platformActivity'

const { pending, messages, reload, source } = useOwnerOpsFeed()
const testBody = ref('')
const testResult = ref('')

function runTest () {
  const result = validatePlatformMessage(testBody.value)
  if (!result.ok) {
    testResult.value = result.message
    appendLocalMessage({
      conversation_id: 'ops-test',
      sender_id: 'test-user',
      sender_display_name: 'Test sender',
      body: testBody.value.slice(0, 120),
      status: 'blocked',
      blocked_pii: true,
      pii_violations: result.violations,
    })
    reload()
    return
  }
  testResult.value = 'Message would be allowed on-platform.'
  appendLocalMessage({
    conversation_id: 'ops-test',
    sender_id: 'test-user',
    sender_display_name: 'Test sender',
    body: result.body,
    status: 'sent',
    blocked_pii: false,
    pii_violations: [],
  })
  testBody.value = ''
  reload()
}

const blocked = computed(() => messages.value.filter((m) => m.blocked_pii || m.status === 'blocked'))
const allowed = computed(() => messages.value.filter((m) => m.status === 'sent' && !m.blocked_pii))
</script>

<template>
  <div class="space-y-4 text-sm">
    <p class="text-white/80">{{ MESSAGING_POLICY }}</p>
    <p class="text-xs text-white/55">Source: {{ source }} · {{ blocked.length }} blocked · {{ allowed.length }} sent</p>

    <div class="border border-amber-500/40 rounded-lg p-3 bg-amber-500/5">
      <p class="text-xs font-semibold text-amber-200 mb-2">Test message filter</p>
      <textarea
        v-model="testBody"
        rows="2"
        class="w-full bg-bg border border-border rounded px-2 py-1 text-sm text-white mb-2"
        placeholder="Try typing an email or phone — it should block"
      />
      <button type="button" class="px-3 py-1 bg-primary text-bg rounded text-xs font-medium" @click="runTest">
        Test filter
      </button>
      <p v-if="testResult" class="text-xs mt-2 text-white/75">{{ testResult }}</p>
    </div>

    <div class="flex justify-end">
      <button type="button" class="text-xs text-primary hover:underline" @click="reload">Refresh</button>
    </div>

    <p v-if="pending" class="text-white/60">Loading messages…</p>

    <div v-else class="max-h-[24rem] overflow-y-auto space-y-2">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="border rounded px-3 py-2"
        :class="msg.blocked_pii ? 'border-red-500/40 bg-red-500/5' : 'border-border bg-bg/50'"
      >
        <div class="flex justify-between gap-2 text-xs text-white/55 mb-1">
          <span>{{ msg.sender_display_name }} · {{ msg.status }}</span>
          <span>{{ new Date(msg.created_at).toLocaleString() }}</span>
        </div>
        <p class="text-white/85">{{ msg.body }}</p>
        <ul v-if="msg.pii_violations?.length" class="text-xs text-red-300 mt-1 list-disc list-inside">
          <li v-for="v in msg.pii_violations" :key="v.id">{{ v.label }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>
