<template>
  <div class="bcmauto-page">
    <div class="container">
      <header class="bcmauto-head">
        <div>
          <p class="bcmauto-eyebrow">B&amp;C owner toolkit</p>
          <h1>Marketing automation</h1>
          <p class="bcmauto-lede">
            Weekly posts for bcpoweraudio.com, get found on Google and YouTube, video ad scripts, dealer email, and mailed flyers.
          </p>
        </div>
        <NuxtLink to="/bc-audio/ops/panel" class="btn btn-outline btn-sm">← Owner console</NuxtLink>
      </header>

      <section v-if="loadError" class="bcmauto-card bcmauto-alert">{{ loadError }}</section>
      <section v-if="saveMessage" class="bcmauto-card bcmauto-ok">{{ saveMessage }}</section>

      <section class="bcmauto-card bcmauto-progress">
        <div class="bcmauto-progress-top">
          <div>
            <strong>Week {{ queue?.weekId || '—' }}</strong>
            <span class="bcmauto-muted small"> · starts {{ queue?.weekStart || '—' }}</span>
          </div>
          <span class="bcmauto-pct">{{ stats.pct }}% done</span>
        </div>
        <div class="bcmauto-bar" role="progressbar" :aria-valuenow="stats.pct" aria-valuemin="0" aria-valuemax="100">
          <div class="bcmauto-bar-fill" :style="{ width: `${stats.pct}%` }" />
        </div>
        <p class="bcmauto-muted small bcmauto-stats-line">
          {{ stats.posted }} posted · {{ stats.pending }} pending · {{ stats.skipped }} skipped
          <span v-if="stats.dueToday.length"> · <strong>{{ stats.dueToday.length }} due today</strong></span>
        </p>
        <div class="bcmauto-actions">
          <button type="button" class="btn btn-primary btn-sm" :disabled="busy" @click="regenerateWeek">
            {{ busy ? 'Working…' : 'Generate this week' }}
          </button>
          <button type="button" class="btn btn-outline btn-sm" :disabled="busy" @click="saveQueue">
            Save to cloud
          </button>
          <button type="button" class="btn btn-outline btn-sm" :disabled="!queue" @click="copyAllPending">
            {{ copiedAll ? 'Copied all' : 'Copy all pending posts' }}
          </button>
          <button type="button" class="btn btn-outline btn-sm" @click="shiftWeek(-7)">← Last week</button>
          <button type="button" class="btn btn-outline btn-sm" @click="shiftWeek(7)">Next week →</button>
        </div>
      </section>

      <section class="bcmauto-card">
        <h2>Get found — Google, YouTube, and more</h2>
        <p class="bcmauto-muted small">Check each box when done. Progress saves on this device.</p>
        <div v-for="dest in visibilityDestinations" :key="dest.id" class="bcmauto-dest" :class="{ 'bcmauto-dest--done': visibilityProgress[dest.id] }">
          <label class="bcmauto-dest-check">
            <input v-model="visibilityProgress[dest.id]" type="checkbox" @change="persistVisibility">
            <span>
              <strong>{{ dest.label }}</strong>
              <span class="bcmauto-muted small"> — {{ dest.why }}</span>
            </span>
          </label>
          <p class="bcmauto-muted small bcmauto-dest-steps">{{ dest.steps }}</p>
          <a :href="dest.url" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Open ↗</a>
        </div>
      </section>

      <section class="bcmauto-card">
        <h2>Video ad builder</h2>
        <p class="bcmauto-muted small">
          Picks a script automatically. Paste into CapCut or Canva (free), export MP4, then upload using the post links.
        </p>
        <label class="bcmauto-field">
          Video idea
          <select v-model.number="videoIdeaIndex" class="input">
            <option v-for="(idea, i) in videoAdIdeas" :key="i" :value="i">{{ idea.hook }}</option>
          </select>
        </label>
        <div class="bcmauto-actions">
          <button type="button" class="btn btn-primary btn-sm" @click="copyVideoScript">{{ videoScriptCopied ? 'Copied script' : 'Copy full script' }}</button>
          <button type="button" class="btn btn-outline btn-sm" @click="copyVideoCaption">{{ videoCaptionCopied ? 'Copied caption' : 'Copy post caption' }}</button>
        </div>
        <pre class="bcmauto-caption">{{ videoPackage.script }}</pre>
        <h3 class="bcmauto-subhead">Scene list</h3>
        <ul class="bcmauto-scene-list">
          <li v-for="(s, i) in videoPackage.scenes" :key="i"><strong>{{ s.sec }}s</strong> — {{ s.visual }} · {{ s.audio }}</li>
        </ul>
        <h3 class="bcmauto-subhead">Edit video (free tools)</h3>
        <div class="bcmauto-actions">
          <a v-for="tool in videoPackage.editTools" :key="tool.url" :href="tool.url" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">{{ tool.label }} ↗</a>
        </div>
        <h3 class="bcmauto-subhead">Post your video here</h3>
        <div class="bcmauto-actions">
          <a v-for="link in videoPackage.postLinks" :key="link.id" :href="link.url" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">{{ link.label }} ↗</a>
        </div>
      </section>

      <section class="bcmauto-card">
        <h2>Email campaigns and mailed flyers</h2>
        <p class="bcmauto-muted small">Email opens your mail app. Flyers use Lob (test mode is free until you switch to live).</p>
        <div class="bcmauto-actions">
          <button type="button" class="btn btn-primary btn-sm" @click="openBulkEmail">Open dealer email draft</button>
          <button type="button" class="btn btn-outline btn-sm" @click="copyPostcard">{{ postcardCopied ? 'Copied' : 'Copy postcard text' }}</button>
          <a :href="platformLinks.lob_postcards" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Set up Lob postcards ↗</a>
        </div>
        <pre class="bcmauto-caption">{{ postcardCopy }}</pre>
        <h3 class="bcmauto-subhead">Radio / podcast pitch</h3>
        <button type="button" class="btn btn-outline btn-sm" @click="copyRadio">{{ radioCopied ? 'Copied' : 'Copy radio pitch email' }}</button>
        <pre class="bcmauto-caption">{{ radioPitch }}</pre>
      </section>

      <section v-if="stats.dueToday.length" class="bcmauto-card bcmauto-today">
        <h2>Due today</h2>
        <ul class="bcmauto-today-list">
          <li v-for="t in stats.dueToday" :key="t.id">{{ t.title }}</li>
        </ul>
      </section>

      <section v-for="task in queue?.tasks || []" :key="task.id" class="bcmauto-card bcmauto-task" :class="taskStatusClass(task)">
        <div class="bcmauto-task-head">
          <div>
            <span class="bcmauto-day">{{ task.dayLabel }}</span>
            <span class="bcmauto-date bcmauto-muted">{{ task.scheduledDate }}</span>
            <h3>{{ task.title }}</h3>
            <span v-if="task.platform" class="bcmauto-badge">{{ task.platform }}</span>
            <span class="bcmauto-badge bcmauto-badge--status">{{ task.status }}</span>
          </div>
          <div class="bcmauto-task-btns">
            <template v-if="task.kind === 'social'">
              <button type="button" class="btn btn-outline btn-sm" @click="copyTask(task)">{{ copyState[task.id] ? 'Copied' : 'Copy post' }}</button>
              <a :href="task.platformUrl" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Open {{ task.platform }} ↗</a>
            </template>
            <template v-else-if="task.kind === 'email'">
              <button type="button" class="btn btn-outline btn-sm" @click="openEmail(task)">Open email draft</button>
            </template>
            <template v-else-if="task.kind === 'seo'">
              <a :href="platformLinks.search_console" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Search Console ↗</a>
            </template>
            <button v-if="task.status !== 'posted'" type="button" class="btn btn-primary btn-sm" @click="markPosted(task)">Mark posted</button>
            <button v-if="task.status === 'pending'" type="button" class="btn btn-outline btn-sm" @click="markSkipped(task)">Skip</button>
            <button v-if="task.status !== 'pending'" type="button" class="btn btn-outline btn-sm" @click="markPending(task)">Reset</button>
          </div>
        </div>

        <template v-if="task.kind === 'social'">
          <pre class="bcmauto-caption">{{ task.caption }}</pre>
        </template>

        <template v-else-if="task.kind === 'email'">
          <p class="bcmauto-muted small">{{ task.notes }}</p>
          <label class="bcmauto-field">
            Shop name (for greeting)
            <input v-model="emailName" class="input" type="text" placeholder="Joe's Car Audio">
          </label>
          <label class="bcmauto-field">
            Their email (optional)
            <input v-model="emailTo" class="input" type="email" placeholder="shop@example.com">
          </label>
          <pre class="bcmauto-caption">{{ formatEmailPreview(task.bodyTemplate) }}</pre>
        </template>

        <template v-else-if="task.kind === 'seo'">
          <ol class="bcmauto-checklist">
            <li v-for="(line, i) in task.checklist" :key="i">{{ line }}</li>
          </ol>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup>
import {
  BC_MARKETING_QUEUE_KEY,
  BC_PLATFORM_LINKS,
  BC_VISIBILITY_DESTINATIONS,
  BC_POSTCARD_COPY,
  BC_RADIO_PITCH,
  BC_VIDEO_AD_IDEAS,
  allBcPendingCaptions,
  buildBcVideoAdPackage,
  generateBcWeeklyQueue,
  loadBcLocalQueue,
  loadBcVisibilityProgress,
  mergeBcQueuePreservingProgress,
  bcQueueStats,
  saveBcLocalQueue,
  saveBcVisibilityProgress,
  startOfWeek,
  buildBcDealerMailto,
} from '~/utils/bcMarketingAutomation.js'
import { getStoredOpsPhrase } from '~/utils/opsClientAuth'

definePageMeta({
  layout: 'bc-audio',
  middleware: ['bc-ops-host', 'bc-ops-auth'],
})

useSeoMeta({ title: 'B&C Marketing automation', robots: 'noindex, nofollow' })

const platformLinks = BC_PLATFORM_LINKS
const queue = ref(null)
const weekAnchor = ref(startOfWeek())
const busy = ref(false)
const loadError = ref('')
const saveMessage = ref('')
const copyState = reactive({})
const copiedAll = ref(false)
const emailName = ref('')
const emailTo = ref('')
const visibilityDestinations = BC_VISIBILITY_DESTINATIONS
const visibilityProgress = reactive(loadBcVisibilityProgress())
const videoAdIdeas = BC_VIDEO_AD_IDEAS
const videoIdeaIndex = ref(0)
const videoScriptCopied = ref(false)
const videoCaptionCopied = ref(false)
const postcardCopy = BC_POSTCARD_COPY
const radioPitch = BC_RADIO_PITCH
const postcardCopied = ref(false)
const radioCopied = ref(false)

const videoPackage = computed(() => buildBcVideoAdPackage(videoIdeaIndex.value))
const stats = computed(() => bcQueueStats(queue.value))

function taskStatusClass (task) {
  if (task.status === 'posted') return 'bcmauto-task--done'
  if (task.status === 'skipped') return 'bcmauto-task--skip'
  if (task.scheduledDate === new Date().toISOString().slice(0, 10)) return 'bcmauto-task--today'
  return ''
}

function applyQueue (next) {
  queue.value = next
  saveBcLocalQueue(next)
}

async function loadQueue () {
  loadError.value = ''
  busy.value = true
  try {
    const data = await opsFetch('/api/ops/site-content', { query: { keys: BC_MARKETING_QUEUE_KEY } })
    const cloud = data?.[BC_MARKETING_QUEUE_KEY]
    if (cloud?.weekId && Array.isArray(cloud.tasks)) {
      applyQueue(cloud)
      return
    }
  } catch (e) {
    const msg = String(e?.message || e?.data?.statusMessage || '')
    if (!/not configured|supabase|unavailable|owner session/i.test(msg)) {
      loadError.value = 'Cloud queue not loaded — using this device. Tap Save to cloud after unlock.'
    }
  } finally {
    busy.value = false
  }

  const local = loadBcLocalQueue()
  if (local?.tasks?.length) {
    applyQueue(local)
    return
  }

  applyQueue(generateBcWeeklyQueue(weekAnchor.value))
}

function regenerateWeek () {
  const fresh = generateBcWeeklyQueue(weekAnchor.value)
  applyQueue(mergeBcQueuePreservingProgress(queue.value, fresh))
  saveMessage.value = 'This week\'s plan refreshed — posted items kept their status.'
  setTimeout(() => { saveMessage.value = '' }, 4000)
}

function shiftWeek (days) {
  const d = new Date(weekAnchor.value)
  d.setDate(d.getDate() + days)
  weekAnchor.value = startOfWeek(d)
  applyQueue(generateBcWeeklyQueue(weekAnchor.value))
}

async function saveQueue () {
  saveMessage.value = ''
  loadError.value = ''
  if (!queue.value) return
  saveBcLocalQueue(queue.value)
  if (!getStoredOpsPhrase()) {
    loadError.value = 'Saved on this device only — tap the B&C logo 5×, unlock, then Save to cloud again.'
    return
  }
  busy.value = true
  try {
    await opsFetch('/api/ops/site-content', {
      method: 'PUT',
      body: { contentKey: BC_MARKETING_QUEUE_KEY, payload: queue.value },
    })
    saveMessage.value = 'Saved to cloud — your queue stays after refresh on any device.'
  } catch (e) {
    loadError.value = String(e?.message || e?.data?.statusMessage || 'Cloud save failed — progress kept on this device.')
  } finally {
    busy.value = false
  }
}

function updateTask (task, patch) {
  if (!queue.value) return
  applyQueue({
    ...queue.value,
    tasks: queue.value.tasks.map((t) => (t.id === task.id ? { ...t, ...patch } : t)),
  })
}

function markPosted (task) {
  updateTask(task, { status: 'posted', postedAt: new Date().toISOString() })
}

function markSkipped (task) {
  updateTask(task, { status: 'skipped', postedAt: null })
}

function markPending (task) {
  updateTask(task, { status: 'pending', postedAt: null })
}

async function copyTask (task) {
  if (!task.caption) return
  try {
    await navigator.clipboard.writeText(task.caption)
    copyState[task.id] = true
    setTimeout(() => { copyState[task.id] = false }, 2500)
  } catch {}
}

async function copyAllPending () {
  const text = allBcPendingCaptions(queue.value)
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    copiedAll.value = true
    setTimeout(() => { copiedAll.value = false }, 2500)
  } catch {}
}

function formatEmailPreview (body) {
  return String(body || '').replace(/\{\{name\}\}/g, emailName.value.trim() || 'there')
}

function openEmail () {
  window.location.href = buildBcDealerMailto({ name: emailName.value, email: emailTo.value })
}

function openBulkEmail () {
  openEmail()
}

function persistVisibility () {
  saveBcVisibilityProgress({ ...visibilityProgress })
}

async function copyVideoScript () {
  try {
    await navigator.clipboard.writeText(videoPackage.value.script)
    videoScriptCopied.value = true
    setTimeout(() => { videoScriptCopied.value = false }, 2500)
  } catch {}
}

async function copyVideoCaption () {
  try {
    await navigator.clipboard.writeText(videoPackage.value.caption)
    videoCaptionCopied.value = true
    setTimeout(() => { videoCaptionCopied.value = false }, 2500)
  } catch {}
}

async function copyPostcard () {
  try {
    await navigator.clipboard.writeText(postcardCopy)
    postcardCopied.value = true
    setTimeout(() => { postcardCopied.value = false }, 2500)
  } catch {}
}

async function copyRadio () {
  try {
    await navigator.clipboard.writeText(radioPitch)
    radioCopied.value = true
    setTimeout(() => { radioCopied.value = false }, 2500)
  } catch {}
}

onMounted(() => {
  loadQueue()
  Object.assign(visibilityProgress, loadBcVisibilityProgress())
})
</script>

<style scoped>
.bcmauto-page { padding: 40px 16px 80px; }
.bcmauto-head {
  display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start;
  margin-bottom: 1.5rem;
}
.bcmauto-eyebrow { font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; color: #ff5252; margin: 0 0 6px; }
h1 { font-size: 1.75rem; margin: 0 0 8px; }
.bcmauto-lede { max-width: 40rem; margin: 0; line-height: 1.55; color: #b8bcc6; }
.bcmauto-muted { color: #9ca3af; }
.small { font-size: 0.85rem; }
.bcmauto-card {
  margin-bottom: 1rem; padding: 1.25rem 1.35rem;
  border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
  background: var(--bc-bg-card, #16161c);
}
.bcmauto-card h2 { font-size: 1.05rem; color: #ff5252; margin: 0 0 8px; }
.bcmauto-alert { border-color: rgba(239, 68, 68, 0.4); color: #fca5a5; }
.bcmauto-ok { border-color: rgba(74, 222, 128, 0.35); color: #86efac; }
.bcmauto-progress-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.bcmauto-pct { font-weight: 800; color: #ff5252; }
.bcmauto-bar {
  height: 8px; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden;
  margin-bottom: 8px;
}
.bcmauto-bar-fill { height: 100%; background: linear-gradient(90deg, #d32f2f, #ff5252); transition: width 0.3s; }
.bcmauto-stats-line { margin: 0 0 12px; }
.bcmauto-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.bcmauto-today { border-color: rgba(211, 47, 47, 0.45); }
.bcmauto-today h2 { font-size: 1rem; margin: 0 0 8px; color: #ff5252; }
.bcmauto-today-list { margin: 0; padding-left: 1.2rem; line-height: 1.6; }
.bcmauto-task--today { border-color: rgba(211, 47, 47, 0.5); }
.bcmauto-task--done { opacity: 0.72; border-color: rgba(74, 222, 128, 0.25); }
.bcmauto-task--skip { opacity: 0.55; }
.bcmauto-task-head {
  display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px;
  margin-bottom: 12px;
}
.bcmauto-task-head h3 { margin: 6px 0 8px; font-size: 1.05rem; width: 100%; }
.bcmauto-day { font-weight: 800; margin-right: 8px; }
.bcmauto-date { font-size: 0.85rem; }
.bcmauto-badge {
  display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 0.72rem;
  font-weight: 700; text-transform: uppercase; margin-right: 6px;
  background: rgba(211, 47, 47, 0.15); color: #ff5252;
}
.bcmauto-badge--status { background: rgba(255,255,255,0.08); color: #b8bcc6; }
.bcmauto-task-btns { display: flex; flex-wrap: wrap; gap: 6px; align-items: flex-start; }
.bcmauto-caption {
  white-space: pre-wrap; font-size: 0.85rem; line-height: 1.55;
  padding: 12px; border-radius: 8px; background: rgba(0,0,0,0.35);
  border: 1px solid rgba(255,255,255,0.06); color: #b8bcc6; margin: 0;
}
.bcmauto-field {
  display: flex; flex-direction: column; gap: 6px; font-size: 0.78rem; font-weight: 700;
  margin-bottom: 10px; max-width: 320px;
}
.bcmauto-checklist { margin: 0; padding-left: 1.2rem; line-height: 1.65; color: #b8bcc6; }
.bcmauto-subhead { font-size: 0.92rem; color: #ff5252; margin: 16px 0 8px; }
.bcmauto-dest { padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
.bcmauto-dest--done { opacity: 0.65; }
.bcmauto-dest-check {
  display: flex; gap: 10px; align-items: flex-start; cursor: pointer; margin-bottom: 6px;
}
.bcmauto-dest-check input { margin-top: 4px; }
.bcmauto-dest-steps { margin: 0 0 8px 1.6rem; }
.bcmauto-scene-list { margin: 0; padding-left: 1.2rem; line-height: 1.6; color: #b8bcc6; font-size: 0.88rem; }
</style>
