#!/usr/bin/env python3
"""Remove COA bypass on kind=general; enforce proof for all collectibles."""
import re
from pathlib import Path

path = Path(__file__).resolve().parent.parent / "pages" / "sell.vue"
c = path.read_text(encoding="utf-8")

# 1. Import NON_COLLECTIBLE_CATEGORIES
if "NON_COLLECTIBLE_CATEGORIES" not in c:
    c = c.replace(
        "  LISTING_CATEGORIES,\n  categoryRequiresCoa,\n  listingRequiresCoa,",
        "  LISTING_CATEGORIES,\n  NON_COLLECTIBLE_CATEGORIES,\n  categoryRequiresCoa,\n  listingRequiresCoa,",
        1,
    )

# 2. Remove requiresCoa bypass for kind=general
c = re.sub(
    r"const requiresCoa = computed\(\(\) => \{\n\s*if \(listingKind\.value === 'general'\) return false\n\s*return listingRequiresCoa\(form\.category, form\.title, form\.description\)\n\}\)",
    "const requiresCoa = computed(() =>\n  listingRequiresCoa(form.category, form.title, form.description),\n)",
    c,
    count=1,
)

# 3. sellCategories computed (after categories = LISTING_CATEGORIES)
if "sellCategories" not in c:
    c = c.replace(
        "const categories = LISTING_CATEGORIES\n",
        "const sellCategories = computed(() => {\n"
        "  if (listingKind.value === 'general') {\n"
        "    return [...NON_COLLECTIBLE_CATEGORIES]\n"
        "  }\n"
        "  return [...LISTING_CATEGORIES]\n"
        "})\n",
        1,
    )
    c = c.replace(
        '<option v-for="cat in categories" :key="cat" :value="cat">',
        '<option v-for="cat in sellCategories" :key="cat" :value="cat">',
        1,
    )

# 4. Header copy — no "no COA step"
c = c.replace(
    "General merchandise — no COA step. Complete seller policies if prompted, then fill out the form below.",
    "General merchandise only (retail categories). Collectibles and antiques are not allowed on this path — use the Collectible option.",
    1,
)

# 5. general-merch-note only when proof not required
c = c.replace(
    '<div v-else-if="form.category" class="form-section general-merch-note">',
    '<div v-else-if="form.category && !requiresCoa" class="form-section general-merch-note">',
    1,
)

# 6. Watch category — block collectible categories on general path
old_watch = """watch(() => form.category, (cat) => {
  if (!listingRequiresCoa(cat, form.title, form.description) && listingKind.value !== 'collectible') {
    form.coaType = ''
    form.guaranteeSigned = false
    coaFile.value = null
    coaFileName.value = ''
    coaCompareAck.value = false
  }
})"""

new_watch = """watch(() => form.category, (cat) => {
  if (listingKind.value === 'general') {
    if (categoryRequiresCoa(cat) || textSuggestsCollectible(form.title, form.description)) {
      alert('Collectibles and antiques cannot be listed without COA. Use the Collectible path and complete authenticity proof first.')
      navigateTo(`${LIST_ITEM_COA_PATH}/`)
      return
    }
  }
  if (!listingRequiresCoa(cat, form.title, form.description) && listingKind.value !== 'collectible') {
    form.coaType = ''
    form.guaranteeSigned = false
    coaFile.value = null
    coaFileName.value = ''
    coaCompareAck.value = false
  }
})"""

if old_watch in c:
    c = c.replace(old_watch, new_watch, 1)
else:
    print("WARN: category watch block not found exactly")

# 7. Submit — collectible path must have coaType from COA step
needle = "  const needsCoa = listingRequiresCoa(form.category, form.title, form.description)\n  if (needsCoa) {"
insert = """  if (listingKind.value === 'collectible' && !allowedCoaTypes.has(form.coaType)) {
    alert('Collectible listings require COA or seller guarantee. Complete the authenticity proof step first.')
    await navigateTo(`${LIST_ITEM_COA_PATH}/`)
    return
  }
  const needsCoa = listingRequiresCoa(form.category, form.title, form.description)
  if (needsCoa) {"""
if "listingKind.value === 'collectible' && !allowedCoaTypes" not in c:
    c = c.replace(needle, insert, 1)

# 8. Never publish none when proof required
c = c.replace(
    "  const effectiveCoaType = needsCoa ? form.coaType : 'none'",
    "  const effectiveCoaType = needsCoa ? form.coaType : 'none'\n  if (needsCoa && !allowedCoaTypes.has(effectiveCoaType)) {\n    alert('COA or signed seller guarantee is required for this category.')\n    return\n  }",
    1,
)

path.write_text(c, encoding="utf-8", newline="\n")
print("patched sell.vue COA enforcement")

# Chooser copy
chooser = Path(__file__).resolve().parent.parent / "components" / "SellListingPathChooser.vue"
ch = chooser.read_text(encoding="utf-8")
ch = ch.replace(
    "Pick the path that matches your item. Collectibles need authenticity proof first; general merchandise goes straight to the listing form.",
    "Pick the path that matches your item. Collectibles and antiques always require COA or seller guarantee — no exceptions. General merchandise is only for retail categories (electronics, tools, apparel, etc.).",
    1,
)
ch = ch.replace(
    "Sporting goods, electronics, tools, apparel, and other general merchandise.",
    "Retail only: electronics, tools, apparel, appliances — not cards, coins, art, antiques, or memorabilia.",
    1,
)
chooser.write_text(ch, encoding="utf-8", newline="\n")
print("patched SellListingPathChooser.vue")

routes = Path(__file__).resolve().parent.parent / "utils" / "listItemRoutes.js"
rt = routes.read_text(encoding="utf-8")
rt = rt.replace(
    "/** Non-collectible → sell form, no COA step. */",
    "/** General retail path — non-collectible categories only; COA still enforced if category/keywords require proof. */",
    1,
)
routes.write_text(rt, encoding="utf-8", newline="\n")
print("patched listItemRoutes.js")
