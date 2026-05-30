#!/usr/bin/env python3
"""One-off patch for sell.vue listing flow + account switch."""
import re
from pathlib import Path

path = Path(__file__).resolve().parent.parent / "pages" / "sell.vue"
c = path.read_text(encoding="utf-8")

header_new = """      <div class="sell-wrapper">
        <div v-if="signedInEmail" class="sell-account-bar" role="status">
          Signed in as <strong>{{ signedInEmail }}</strong>.
          <button type="button" class="link-btn" @click="switchSellAccount">Use a different account</button>
        </div>

        <div class="sell-header text-center">
          <template v-if="isListingFlow">
            <h1>List your item</h1>
            <p v-if="listingKind === 'general'" class="text-muted">
              General merchandise — no COA step. Complete seller policies if prompted, then fill out the form below.
            </p>
            <p v-else class="text-muted">
              Collectible listing — COA or seller guarantee applies. Complete policies if prompted, then add your item.
            </p>
          </template>
          <template v-else>
            <h1>Sell on The Franks Standard</h1>
            <p class="text-muted">List in minutes. COA or signed guarantee is required only for collectibles, antiques, and similar categories — general merchandise uses accurate photos and description.</p>
          </template>
        </div>

        <div v-if="!isListingFlow" class="sell-switch-banner card" role="status">"""

pat = re.compile(
    r"      <div class=\"sell-wrapper\">\s*"
    r"<div class=\"sell-header text-center\">.*?</div>\s*"
    r"<div class=\"sell-switch-banner card\" role=\"status\">",
    re.DOTALL,
)
c2, n = pat.subn(header_new, c, count=1)
if n != 1:
    raise SystemExit(f"header patch failed ({n})")

c2 = c2.replace(
    "const requiresCoa = computed(() =>\n  listingRequiresCoa(form.category, form.title, form.description),\n)",
    "const requiresCoa = computed(() => {\n  if (listingKind.value === 'general') return false\n  return listingRequiresCoa(form.category, form.title, form.description)\n})",
)

c2 = re.sub(
    r"\nconst showListingPathChooser = computed\(\(\) => \{.*?\n\}\)\n",
    "\n",
    c2,
    count=1,
    flags=re.DOTALL,
)

insert = """
import {
  collectibleNeedsCoaStep,
  isActiveListingFlow,
  LIST_ITEM_COA_PATH,
} from '~/utils/listItemRoutes.js'

const isListingFlow = computed(() => isActiveListingFlow(route.query))

const signedInEmail = ref('')

async function switchSellAccount () {
  const redirect = encodeURIComponent(route.fullPath)
  await supabase.auth.signOut()
  await navigateTo(`/auth/login?switch=1&redirect=${redirect}`)
}

function enforceListingPathGuard () {
  if (collectibleNeedsCoaStep(route.query)) {
    navigateTo(`${LIST_ITEM_COA_PATH}/`)
  }
}
"""

if "const isListingFlow" not in c2:
    m = re.search(r"(const isSellSubRoute = computed\(\(\) => \{.*?\}\)\s*)", c2, re.DOTALL)
    if not m:
        raise SystemExit("isSellSubRoute block not found")
    c2 = c2[: m.end()] + insert + c2[m.end() :]

c2 = c2.replace(
    "onMounted(async () => {\n  await loadPolicyStatus()",
    "onMounted(async () => {\n  enforceListingPathGuard()\n  const { data: { user: mountUser } } = await supabase.auth.getUser()\n  if (mountUser?.email) signedInEmail.value = mountUser.email\n  await loadPolicyStatus()",
    1,
)

if "watch(() => route.query, () => { enforceListingPathGuard()" not in c2:
    c2 = c2.replace(
        "watch(\n  () => [route.query.kind, route.query.coaType, route.query.coa],",
        "watch(() => route.query, () => { enforceListingPathGuard() }, { deep: true })\n\nwatch(\n  () => [route.query.kind, route.query.coaType, route.query.coa],",
        1,
    )

if 'id="listing-form"' not in c2:
    c2 = c2.replace(
        '<form @submit.prevent="handleSubmit"',
        '<form id="listing-form" @submit.prevent="handleSubmit"',
        1,
    )

if ".sell-account-bar" not in c2 and "</style>" in c2:
    c2 = c2.replace(
        "</style>",
        ".sell-account-bar {\n  margin-bottom: 12px;\n  padding: 10px 14px;\n  font-size: 0.88rem;\n  font-weight: 600;\n  background: #f8fafc;\n  border: 1px solid #e2e8f0;\n  border-radius: 8px;\n}\n.sell-account-bar .link-btn {\n  margin-left: 8px;\n  font-weight: 800;\n}\n</style>",
        1,
    )

path.write_text(c2, encoding="utf-8", newline="\n")
print("patched", path)
