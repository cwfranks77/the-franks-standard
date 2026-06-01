#!/usr/bin/env python3
"""Re-apply guarantee removal on sell.vue (idempotent)."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sell = ROOT / "pages" / "sell.vue"
c = sell.read_text(encoding="utf-8")

if "isAllowedCoaProofType" not in c:
    c = c.replace(
        "  LIST_ITEM_COA_PATH,\n} from '~/utils/listItemRoutes.js'",
        "  LIST_ITEM_COA_PATH,\n  isAllowedCoaProofType,\n} from '~/utils/listItemRoutes.js'",
        1,
    )

c = c.replace(
    "const allowedCoaTypes = new Set(['upload', 'guarantee', 'franks_issued'])",
    "const allowedCoaTypes = new Set(['upload', 'franks_issued'])",
)

# Remove guarantee radio if present
if "value=\"guarantee\" name=\"coaType\"" in c:
    c = re.sub(
        r"\n              <label class=\"coa-option\" :class=\"\{ active: form\.coaType === 'guarantee' \}\">.*?</label>",
        "",
        c,
        count=1,
        flags=re.DOTALL,
    )

# Remove guarantee box
if "<!-- Sign Guarantee -->" in c:
    start = c.find("            <!-- Sign Guarantee -->")
    end = c.find("          <div v-else-if=\"form.category", start)
    if start >= 0 and end >= 0:
        c = c[:start] + c[end:]

# Remove guarantee imports
c = c.replace(
    "import {\n  GUARANTEE_WITH_SEAL_INTRO,\n  SELLER_GUARANTEE_SUBTITLE,\n  SELLER_GUARANTEE_TITLE,\n} from '~/utils/authenticitySeal.js'\n\nconst guaranteeSealIntro = GUARANTEE_WITH_SEAL_INTRO\n",
    "",
)

# applyListingKindFromQuery redirect guarantee URLs
if "if (coa === 'guarantee')" not in c:
    c = c.replace(
        "    const coa = String(route.query.coaType || route.query.coa || '').toLowerCase()\n    if (allowedCoaTypes.has(coa)) form.coaType = coa",
        "    const coa = String(route.query.coaType || route.query.coa || '').toLowerCase()\n    if (coa === 'guarantee') {\n      navigateTo(`${LIST_ITEM_COA_PATH}/`)\n      return\n    }\n    if (allowedCoaTypes.has(coa)) form.coaType = coa",
        1,
    )

# Fix submitListing — insert collectible check after policy if missing
if "listingKind.value === 'collectible'" not in c:
    c = c.replace(
        "async function submitListing() {\n  if (needsPolicyAcceptance.value) {\n    alert('You must digitally sign all seller policies before publishing.')\n    return\n  }\n  const needsCoa = listingRequiresCoa",
        "async function submitListing() {\n  if (needsPolicyAcceptance.value) {\n    alert('You must digitally sign all seller policies before publishing.')\n    return\n  }\n  if (listingKind.value === 'collectible' && !allowedCoaTypes.has(form.coaType)) {\n    alert('Collectible listings require uploaded COA or Franks Standard COA. Complete the authenticity proof step first.')\n    await navigateTo(`${LIST_ITEM_COA_PATH}/`)\n    return\n  }\n  const needsCoa = listingRequiresCoa",
        1,
    )

# Inside needsCoa block
c = c.replace(
    "      alert('This listing requires a COA upload, Franks COA template, or signed Seller Authenticity Guarantee. Scroll to the Certificate of Authenticity section.')",
    "      alert('This listing requires an uploaded COA or Franks Standard COA. Scroll to the Certificate of Authenticity section.')",
)
c = re.sub(
    r"\n    if \(form\.coaType === 'guarantee' && !form\.guaranteeSigned\) \{.*?\n    \}\n",
    "\n",
    c,
    count=1,
    flags=re.DOTALL,
)

if "Written seller guarantee is no longer accepted" not in c:
    c = c.replace(
        "  if (needsCoa) {\n    if (!form.coaType) {",
        "  if (needsCoa) {\n    if (form.coaType === 'guarantee' || (form.coaType && !isAllowedCoaProofType(form.coaType))) {\n      alert('Written seller guarantee is no longer accepted. Upload your COA or choose the Franks Standard COA template.')\n      await navigateTo(`${LIST_ITEM_COA_PATH}/`)\n      return\n    }\n    if (!form.coaType) {",
        1,
    )

c = c.replace(
    "    alert('Collectible listings require COA or seller guarantee. Complete the authenticity proof step first.')",
    "    alert('Collectible listings require uploaded COA or Franks Standard COA. Complete the authenticity proof step first.')",
)
c = c.replace(
    "    alert('COA or signed seller guarantee is required for this category.')",
    "    alert('Uploaded COA or Franks Standard COA is required for this category.')",
)
c = c.replace(
    "  if (needsCoa && !allowedCoaTypes.has(effectiveCoaType)) {",
    "  if (needsCoa && !isAllowedCoaProofType(effectiveCoaType)) {",
)

text_repls = [
    ("COA or guarantee", "uploaded COA or Franks Standard COA"),
    ("COA or signed guarantee", "uploaded COA or Franks Standard COA"),
    ("signed Seller Authenticity Guarantee", "Franks Standard COA"),
    ("COA uploaded or signed Franks Standard guarantee required", "Upload a COA or use the Franks Standard COA template"),
    ("COA or guarantee applies only when", "COA proof applies when"),
    ("Choose one option:", "Upload a third-party COA or use the Franks Standard serial registry — every collectible is recorded on-platform."),
]
for a, b in text_repls:
    c = c.replace(a, b)

c = c.replace(
    "  if (coaType === 'guarantee') auth = 'Authenticity: Seller backs this item via signed Seller Authenticity Guarantee (Franks Standard template).'\n",
    "",
)

sell.write_text(c, encoding="utf-8", newline="\n")
print("fixed sell.vue", sell)
