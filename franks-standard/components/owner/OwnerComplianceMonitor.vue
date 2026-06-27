<script setup lang="ts">
import { scanListingCompliance, scanListingImageNames, formatComplianceBlockMessage } from '~/utils/listingCompliance'
import { appendLocalActivity } from '~/utils/platformActivity'

const testTitle = ref('')
const testDescription = ref('')
const testCategory = ref('Sports Cards & Memorabilia')
const testImages = ref('')
const coaSerial = ref('')
const sellerSignature = ref('')
const result = ref<ReturnType<typeof scanListingCompliance> | null>(null)
const imageResult = ref<ReturnType<typeof scanListingImageNames> | null>(null)

const { busy, lastError, callOps } = useIntegrityOps()
const queue = ref<Record<string, unknown>[]>([])
const queueMsg = ref('')

function runTest () {
  result.value = scanListingCompliance({
    category: testCategory.value,
    title: testTitle.value,
    description: testDescription.value,
    coa_serial_number: coaSerial.value,
    seller_signature: sellerSignature.value,
    coa_type: coaSerial.value ? 'franks_issued' : 'none',
  })
  const names = testImages.value.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
  imageResult.value = scanListingImageNames(names)

  if (!result.value.ok || !imageResult.value.ok) {
    appendLocalActivity({
      user_id: 'operator',
      user_display_name: 'Operator',
      ip_address: 'browser-session',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      action: 'Compliance test blocked sample listing',
      action_category: 'infraction',
      metadata: { title: testTitle.value.slice(0, 80) },
    })
  }
}

async function loadQueue () {
  const data = await callOps('list_queue', { limit: 40 })
  if (data?.listings) queue.value = data.listings as Record<string, unknown>[]
  if (data?.ok) queueMsg.value = `Queue loaded: ${queue.value.length} items`
}

async function autoScanFix () {
  const data = await callOps('scan_all', { limit: 300 })
  if (data?.ok) {
    const results = (data.results as { severity?: string; integrity_status?: string }[]) || []
    const flagged = results.filter((r) => r.integrity_status === 'review' || r.severity === 'block').length
    queueMsg.value = `Auto-scan complete — ${data.scanned ?? results.length} listings scanned, ${flagged} flagged for review.`
    await loadQueue()
  }
}

onMounted(loadQueue)
</script>

<template>
  <div class="space-y-6 text-sm">
    <p class="text-white/80">
      Blocks personal contact info, prohibited items, and collectibles without COA serial + e-signature.
      Image file names are scanned for restricted keywords (full image AI review connects when enabled).
    </p>

    <section class="border border-border rounded-lg p-4 bg-bg/40 space-y-3">
      <h3 class="font-semibold text-white">Test listing scanner</h3>
      <input v-model="testTitle" class="w-full bg-bg border border-border rounded px-3 py-2 text-white" placeholder="Listing title">
      <textarea v-model="testDescription" rows="2" class="w-full bg-bg border border-border rounded px-3 py-2 text-white" placeholder="Description" />
      <select v-model="testCategory" class="w-full bg-bg border border-border rounded px-3 py-2 text-white">
        <option>Sports Cards & Memorabilia</option>
        <option>General Merchandise</option>
        <option>Coins & Currency</option>
        <option>Watches & Jewelry</option>
      </select>
      <input v-model="coaSerial" class="w-full bg-bg border border-border rounded px-3 py-2 text-white" placeholder="COA serial (if collectible)">
      <input v-model="sellerSignature" class="w-full bg-bg border border-border rounded px-3 py-2 text-white" placeholder="Seller legal name e-signature">
      <input v-model="testImages" class="w-full bg-bg border border-border rounded px-3 py-2 text-white" placeholder="Image file names (comma separated)">
      <button type="button" class="px-4 py-2 bg-primary text-bg rounded font-medium" @click="runTest">Run compliance scan</button>

      <pre v-if="result && !result.ok" class="text-xs text-red-300 whitespace-pre-wrap bg-red-950/30 p-3 rounded">{{ formatComplianceBlockMessage(result.flags) }}</pre>
      <p v-else-if="result?.ok && imageResult?.ok" class="text-green-400 text-xs">Scan passed — would be allowed to publish (subject to live COA verification).</p>
      <ul v-if="imageResult?.flags?.length" class="text-xs text-amber-300 list-disc list-inside">
        <li v-for="f in imageResult.flags" :key="f.id">{{ f.label }}</li>
      </ul>
    </section>

    <section class="border border-border rounded-lg p-4 bg-bg/40 space-y-3">
      <div class="flex justify-between items-center">
        <h3 class="font-semibold text-white">Integrity review queue</h3>
        <div class="flex gap-2">
          <button type="button" class="text-xs text-primary hover:underline" @click="loadQueue">Refresh</button>
          <button
            type="button"
            class="text-xs px-2 py-1 border border-border rounded text-white hover:border-primary"
            :disabled="busy"
            @click="autoScanFix"
          >
            Auto-scan &amp; suspend blocks
          </button>
        </div>
      </div>
      <p v-if="queueMsg" class="text-xs text-white/65">{{ queueMsg }}</p>
      <p v-if="lastError" class="text-xs text-red-400">{{ lastError }}</p>
      <ul class="space-y-2 max-h-48 overflow-y-auto">
        <li v-for="row in queue" :key="String(row.id)" class="text-xs text-white/80 border-b border-border pb-2">
          <strong>{{ row.title }}</strong> — {{ row.integrity_status }} (score {{ row.integrity_score }})
        </li>
        <li v-if="!queue.length" class="text-white/55">Queue empty or not connected.</li>
      </ul>
    </section>
  </div>
</template>
