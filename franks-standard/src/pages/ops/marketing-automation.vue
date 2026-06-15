<template>
  <div class="mauto-page">
    <div class="container">
      <header class="mauto-head">
        <div>
          <p class="eyebrow">Owner toolkit</p>
          <h1>Marketing automation</h1>
          <p class="text-muted lede">
            Weekly posts, get-found on Google and YouTube, AI video ad scripts, email, and mailed flyers — all in one place.
          </p>
        </div>
        <NuxtLink to="/ops/panel" class="btn btn-outline btn-sm">← Operator console</NuxtLink>
      </header>

      <section v-if="loadError" class="mauto-card mauto-alert">{{ loadError }}</section>
      <section v-if="saveMessage" class="mauto-card mauto-ok">{{ saveMessage }}</section>

      <section class="mauto-card mauto-progress">
        <div class="mauto-progress-top">
          <div>
            <strong>Week {{ queue?.weekId || '—' }}</strong>
            <span class="text-muted small"> · starts {{ queue?.weekStart || '—' }}</span>
          </div>
          <span class="mauto-pct">{{ stats.pct }}% done</span>
        </div>
        <div class="mauto-bar" role="progressbar" :aria-valuenow="stats.pct" aria-valuemin="0" aria-valuemax="100">
          <div class="mauto-bar-fill" :style="{ width: `${stats.pct}%` }" />
        </div>
        <p class="text-muted small mauto-stats-line">
          {{ stats.posted }} posted · {{ stats.pending }} pending · {{ stats.skipped }} skipped
          <span v-if="stats.dueToday.length"> · <strong>{{ stats.dueToday.length }} due today</strong></span>
        </p>
        <div class="mauto-actions">
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

      <section class="mauto-card">
        <h2>Get found — Google, YouTube, and more</h2>
        <p class="text-muted small">Check each box when done. Progress saves on this device.</p>
        <div v-for="dest in visibilityDestinations" :key="dest.id" class="mauto-dest" :class="{ 'mauto-dest--done': visibilityProgress[dest.id] }">
          <label class="mauto-dest-check">
            <input v-model="visibilityProgress[dest.id]" type="checkbox" @change="persistVisibility">
            <span>
              <strong>{{ dest.label }}</strong>
              <span class="text-muted small"> — {{ dest.why }}</span>
            </span>
          </label>
          <p class="text-muted small mauto-dest-steps">{{ dest.steps }}</p>
          <a :href="dest.url" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Open ↗</a>
        </div>
      </section>

      <section class="mauto-card">
        <h2>AI video ad builder</h2>
        <p class="text-muted small">
          Picks a script automatically. Paste into CapCut or Canva (free), export MP4, then upload using the post links.
        </p>
        <label class="mauto-field">
          Video idea
          <select v-model.number="videoIdeaIndex" class="select">
            <option v-for="(idea, i) in videoAdIdeas" :key="i" :value="i">{{ idea.hook }}</option>
          </select>
        </label>
        <div class="mauto-actions">
          <button type="button" class="btn btn-primary btn-sm" @click="copyVideoScript">{{ videoScriptCopied ? 'Copied script' : 'Copy full script' }}</button>
          <button type="button" class="btn btn-outline btn-sm" @click="copyVideoCaption">{{ videoCaptionCopied ? 'Copied caption' : 'Copy post caption' }}</button>
        </div>
        <pre class="mauto-caption">{{ videoPackage.script }}</pre>
        <h3 class="mauto-subhead">Scene list (for filming or AI edit)</h3>
        <ul class="mauto-scene-list">
          <li v-for="(s, i) in videoPackage.scenes" :key="i"><strong>{{ s.sec }}s</strong> — {{ s.visual }} · {{ s.audio }}</li>
        </ul>
        <h3 class="mauto-subhead">Edit video (free tools)</h3>
        <div class="mauto-actions">
          <a v-for="tool in videoPackage.editTools" :key="tool.url" :href="tool.url" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">{{ tool.label }} ↗</a>
        </div>
        <h3 class="mauto-subhead">Post your video here</h3>
        <div class="mauto-actions">
          <a v-for="link in videoPackage.postLinks" :key="link.id" :href="link.url" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">{{ link.label }} ↗</a>
        </div>
      </section>

      <section class="mauto-card">
        <h2>Email campaigns and mailed flyers</h2>
        <p class="text-muted small">Email opens your mail app. Flyers use Lob (test mode is free — no mail sent until you switch to live key).</p>
        <div class="mauto-actions">
          <button type="button" class="btn btn-primary btn-sm" @click="openBulkEmail">Open seller email draft</button>
          <button type="button" class="btn btn-outline btn-sm" @click="copyPostcard">{{ postcardCopied ? 'Copied' : 'Copy postcard text' }}</button>
          <a :href="platformLinks.lob_postcards" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Set up Lob postcards ↗</a>
          <a :href="platformLinks.lob_dashboard" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Lob dashboard ↗</a>
        </div>
        <pre class="mauto-caption">{{ postcardCopy }}</pre>
        <h3 class="mauto-subhead">Radio / podcast pitch</h3>
        <button type="button" class="btn btn-outline btn-sm" @click="copyRadio">{{ radioCopied ? 'Copied' : 'Copy radio pitch email' }}</button>
        <pre class="mauto-caption">{{ radioPitch }}</pre>
      </section>

      <section v-if="stats.dueToday.length" class="mauto-card mauto-today">
        <h2>Due today</h2>
        <ul class="mauto-today-list">
          <li v-for="t in stats.dueToday" :key="t.id">{{ t.title }}</li>
        </ul>
      </section>

      <section v-for="task in queue?.tasks || []" :key="task.id" class="mauto-card mauto-task" :class="taskStatusClass(task)">
        <div class="mauto-task-head">
          <div>
            <span class="mauto-day">{{ task.dayLabel }}</span>
            <span class="mauto-date text-muted">{{ task.scheduledDate }}</span>
            <h3>{{ task.title }}</h3>
            <span v-if="task.platform" class="mauto-badge">{{ task.platform }}</span>
            <span class="mauto-badge mauto-badge--status">{{ task.status }}</span>
          </div>
          <div class="mauto-task-btns">
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
          <p v-if="task.reelHint" class="mauto-hint text-muted small"><strong>Video idea:</strong> {{ task.reelHint }}</p>
          <pre class="mauto-caption">{{ task.caption }}</pre>
        </template>

        <template v-else-if="task.kind === 'email'">
          <p class="text-muted small">{{ task.notes }}</p>
          <label class="mauto-field">
            Shop name (for greeting)
            <input v-model="emailName" class="input" type="text" placeholder="Joe's Cards">
          </label>
          <label class="mauto-field">
            Their email (optional — leave blank to pick in your mail app)
            <input v-model="emailTo" class="input" type="email" placeholder="shop@example.com">
          </label>
          <pre class="mauto-caption">{{ formatEmailPreview(task.bodyTemplate) }}</pre>
        </template>

        <template v-else-if="task.kind === 'seo'">
          <ol class="mauto-checklist">
            <li v-for="(line, i) in task.checklist" :key="i">{{ line }}</li>
          </ol>
        </template>
      </section>

      <section class="mauto-card">
        <h2>Terminal commands (optional)</h2>
        <p class="text-muted small">These run on your PC when API keys are in <code>.env</code> — not required for the queue above.</p>
        <table class="mauto-cmd-table">
          <tr><td><code>npm run post:social</code></td><td>Post to Telegram, Facebook, X (keys required)</td></tr>
          <tr><td><code>npm run email:campaign -- --dry-run</code></td><td>Preview SendGrid seller emails</td></tr>
          <tr><td><code>npm run seo:ping</code></td><td>Ping Bing / IndexNow after deploy</td></tr>
        </table>
        <p class="text-muted small mt-1">
          <NuxtLink to="/ops/marketing">Full marketing playbook</NuxtLink>
          · <NuxtLink to="/ops/social-promo">Social promotion</NuxtLink>
          · <NuxtLink to="/ops/ads">Social ads copy</NuxtLink>
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
import {
  MARKETING_QUEUE_KEY,
  PLATFORM_LINKS,
  VISIBILITY_DESTINATIONS,
  POSTCARD_MAIL_COPY,
  RADIO_PITCH_COPY,
  VIDEO_AD_IDEAS,
  allPendingCaptions,
  buildVideoAdPackage,
  generateWeeklyQueue,
  loadLocalQueue,
  loadVisibilityProgress,
  mergeQueuePreservingProgress,
  queueStats,
  saveLocalQueue,
  saveVisibilityProgress,
  startOfWeek,
  buildSellerOutreachMailto,
} from '~/utils/marketingAutomation.js'
import { getStoredOpsPhrase } from '~/utils/opsClientAuth'

definePageMeta({ layout: 'default', middleware: 'ops-auth' })
useSeoMeta({ title: 'Marketing automation — The Franks Standard', robots: 'noindex, nofollow' })

const platformLinks = PLATFORM_LINKS
const queue = ref(null)
const weekAnchor = ref(startOfWeek())
const busy = ref(false)
const loadError = ref('')
const saveMessage = ref('')
const copyState = reactive({})
const copiedAll = ref(false)
const emailName = ref('')
const emailTo = ref('')
const visibilityDestinations = VISIBILITY_DESTINATIONS
const visibilityProgress = reactive(loadVisibilityProgress())
const videoAdIdeas = VIDEO_AD_IDEAS
const videoIdeaIndex = ref(0)
const videoScriptCopied = ref(false)
const videoCaptionCopied = ref(false)
const postcardCopy = POSTCARD_MAIL_COPY
const radioPitch = RADIO_PITCH_COPY
const postcardCopied = ref(false)
const radioCopied = ref(false)

const videoPackage = computed(() => buildVideoAdPackage(videoIdeaIndex.value))

const stats = computed(() => queueStats(queue.value))

function taskStatusClass (task) {
  if (task.status === 'posted') return 'mauto-task--done'
  if (task.status === 'skipped') return 'mauto-task--skip'
  if (task.scheduledDate === new Date().toISOString().slice(0, 10)) return 'mauto-task--today'
  return ''
}

function applyQueue (next) {
  queue.value = next
  saveLocalQueue(next)
}

async function loadQueue () {
  loadError.value = ''
  busy.value = true
  try {
    const data = await opsFetch('/api/ops/site-content', { query: { keys: MARKETING_QUEUE_KEY } })
    const cloud = data?.[MARKETING_QUEUE_KEY]
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

  const local = loadLocalQueue()
  if (local?.tasks?.length) {
    applyQueue(local)
    return
  }

  applyQueue(generateWeeklyQueue(weekAnchor.value))
}

function regenerateWeek () {
  const fresh = generateWeeklyQueue(weekAnchor.value)
  applyQueue(mergeQueuePreservingProgress(queue.value, fresh))
  saveMessage.value = 'This week\'s plan refreshed — posted items kept their status.'
  setTimeout(() => { saveMessage.value = '' }, 4000)
}

function shiftWeek (days) {
  const d = new Date(weekAnchor.value)
  d.setDate(d.getDate() + days)
  weekAnchor.value = startOfWeek(d)
  applyQueue(generateWeeklyQueue(weekAnchor.value))
}

async function saveQueue () {
  saveMessage.value = ''
  loadError.value = ''
  if (!queue.value) return
  saveLocalQueue(queue.value)
  if (!getStoredOpsPhrase()) {
    loadError.value = 'Saved on this device only — tap the logo 5×, unlock, then Save to cloud again.'
    return
  }
  busy.value = true
  try {
    await opsFetch('/api/ops/site-content', {
      method: 'PUT',
      body: { contentKey: MARKETING_QUEUE_KEY, payload: queue.value },
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
  const text = allPendingCaptions(queue.value)
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

function openEmail (task) {
  const href = buildSellerOutreachMailto({ name: emailName.value, email: emailTo.value })
  window.location.href = href
}

function openBulkEmail () {
  window.location.href = buildSellerOutreachMailto({ name: emailName.value, email: emailTo.value })
}

function persistVisibility () {
  saveVisibilityProgress({ ...visibilityProgress })
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
  Object.assign(visibilityProgress, loadVisibilityProgress())
})
</script>

<style scoped>
.mauto-page { padding: 40px 16px 80px; }
.mauto-head {
  display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start;
  margin-bottom: 1.5rem;
}
.eyebrow { font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gold); margin: 0 0 6px; }
h1 { font-size: 1.75rem; margin: 0 0 8px; }
.lede { max-width: 40rem; margin: 0; line-height: 1.55; }
.mauto-card {
  margin-bottom: 1rem; padding: 1.25rem 1.35rem;
  border: 1px solid var(--stone-800); border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.03);
}
.mauto-alert { border-color: rgba(239, 68, 68, 0.4); color: #fca5a5; }
.mauto-ok { border-color: rgba(74, 222, 128, 0.35); color: #86efac; }
.mauto-progress-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.mauto-pct { font-weight: 800; color: var(--gold); }
.mauto-bar {
  height: 8px; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden;
  margin-bottom: 8px;
}
.mauto-bar-fill { height: 100%; background: linear-gradient(90deg, var(--gold), #e8c547); transition: width 0.3s; }
.mauto-stats-line { margin: 0 0 12px; }
.mauto-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.mauto-today { border-color: rgba(201, 168, 76, 0.45); }
.mauto-today h2 { font-size: 1rem; margin: 0 0 8px; color: var(--gold); }
.mauto-today-list { margin: 0; padding-left: 1.2rem; line-height: 1.6; }
.mauto-task--today { border-color: rgba(201, 168, 76, 0.5); }
.mauto-task--done { opacity: 0.72; border-color: rgba(74, 222, 128, 0.25); }
.mauto-task--skip { opacity: 0.55; }
.mauto-task-head {
  display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px;
  margin-bottom: 12px;
}
.mauto-task-head h3 { margin: 6px 0 8px; font-size: 1.05rem; width: 100%; }
.mauto-day { font-weight: 800; margin-right: 8px; }
.mauto-date { font-size: 0.85rem; }
.mauto-badge {
  display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 0.72rem;
  font-weight: 700; text-transform: uppercase; margin-right: 6px;
  background: rgba(201, 168, 76, 0.15); color: var(--gold);
}
.mauto-badge--status { background: rgba(255,255,255,0.08); color: var(--stone-200); }
.mauto-task-btns { display: flex; flex-wrap: wrap; gap: 6px; align-items: flex-start; }
.mauto-caption {
  white-space: pre-wrap; font-size: 0.85rem; line-height: 1.55;
  padding: 12px; border-radius: 8px; background: rgba(0,0,0,0.35);
  border: 1px solid rgba(255,255,255,0.06); color: var(--stone-200); margin: 0;
}
.mauto-hint { margin: 0 0 8px; }
.mauto-field {
  display: flex; flex-direction: column; gap: 6px; font-size: 0.78rem; font-weight: 700;
  margin-bottom: 10px; max-width: 320px;
}
.mauto-checklist { margin: 0; padding-left: 1.2rem; line-height: 1.65; color: var(--stone-200); }
.mauto-subhead { font-size: 0.92rem; color: var(--gold); margin: 16px 0 8px; }
.mauto-dest {
  padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
}
.mauto-dest--done { opacity: 0.65; }
.mauto-dest-check {
  display: flex; gap: 10px; align-items: flex-start; cursor: pointer; margin-bottom: 6px;
}
.mauto-dest-check input { margin-top: 4px; }
.mauto-dest-steps { margin: 0 0 8px 1.6rem; }
.mauto-scene-list { margin: 0; padding-left: 1.2rem; line-height: 1.6; color: var(--stone-200); font-size: 0.88rem; }
.mauto-cmd-table { width: 100%; font-size: 0.85rem; border-collapse: collapse; }
.mauto-cmd-table td { padding: 8px 4px; border-bottom: 1px solid rgba(255,255,255,0.06); vertical-align: top; }
.mt-1 { margin-top: 10px; }
code { font-size: 0.85em; }
</style>
