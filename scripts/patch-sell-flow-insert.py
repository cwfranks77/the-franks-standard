#!/usr/bin/env python3
import re
from pathlib import Path

path = Path(__file__).resolve().parent.parent / "pages" / "sell.vue"
c = path.read_text(encoding="utf-8")

if "const isListingFlow" in c:
    print("already has isListingFlow")
    raise SystemExit(0)

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

m = re.search(r"(const isSellSubRoute = computed\(\(\) => \{.*?\}\)\s*)", c, re.DOTALL)
if not m:
    raise SystemExit("isSellSubRoute not found")

# supabase used before declaration - move insert after supabase = useSupabaseClient()
if "await supabase.auth.signOut" in c and "const supabase = useSupabaseClient()" in c:
    # insert after supabase line instead
    c = c.replace(
        "const supabase = useSupabaseClient()\n",
        "const supabase = useSupabaseClient()\n" + insert,
        1,
    )
else:
    c = c[: m.end()] + insert + c[m.end() :]

path.write_text(c, encoding="utf-8", newline="\n")
print("inserted helpers")
