#!/usr/bin/env python3
"""Remove written seller guarantee from new collectible listings."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sell = ROOT / "pages" / "sell.vue"
c = sell.read_text(encoding="utf-8")

# Import coa proof helper
if "isAllowedCoaProofType" not in c:
    c = c.replace(
        "  LIST_ITEM_COA_PATH,\n} from '~/utils/listItemRoutes.js'",
        "  LIST_ITEM_COA_PATH,\n  isAllowedCoaProofType,\n} from '~/utils/listItemRoutes.js'",
        1,
    )

c = c.replace(
    "const allowedCoaTypes = new Set(['upload', 'guarantee', 'franks_issued'])",
    "const allowedCoaTypes = new Set(['upload', 'franks_issued'])",
    1,
)

# applyListingKindFromQuery — reject guarantee in URL
old_apply = """    const coa = String(route.query.coaType || route.query.coa || '').toLowerCase()
    if (allowedCoaTypes.has(coa)) form.coaType = coa"""
new_apply = """    const coa = String(route.query.coaType || route.query.coa || '').toLowerCase()
    if (coa === 'guarantee') {
      navigateTo(`${LIST_ITEM_COA_PATH}/`)
      return
    }
    if (allowedCoaTypes.has(coa)) form.coaType = coa"""
if old_apply in c:
    c = c.replace(old_apply, new_apply, 1)

# Remove guarantee radio block
guarantee_block = re.compile(
    r"\n              <label class=\"coa-option\" :class=\"\{ active: form\.coaType === 'guarantee' \}\">.*?"
    r"</label>\n",
    re.DOTALL,
)
c2, n = guarantee_block.subn("\n", c, count=1)
if n != 1:
    raise SystemExit(f"guarantee radio block not found ({n})")
c = c2

# Remove guarantee sign box
start = c.find("            <!-- Sign Guarantee -->")
end = c.find("          <div v-else-if=\"form.category", start)
if start < 0 or end < 0:
    raise SystemExit("guarantee box markers not found")
c = c[:start] + c[end:]

# COA section intro
replacements = [
    (
        "Your wording looks like a collectible or antique. Even under <strong>{{ form.category }}</strong>, you need COA or guarantee — or change category / wording if this is general retail.",
        "Your wording looks like a collectible or antique. Even under <strong>{{ form.category }}</strong>, you need an uploaded COA or Franks Standard COA — or change category / wording if this is general retail.",
    ),
    (
        '<p class="text-muted mb-2">Required for this listing. Choose one option:</p>',
        '<p class="text-muted mb-2">Required for this listing. Upload a third-party COA or use the Franks Standard serial registry — every collectible is recorded on-platform.</p>',
    ),
    (
        "Collectible listing — COA or seller guarantee applies. Add your item below.",
        "Collectible listing — uploaded COA or Franks Standard COA required. Add your item below.",
    ),
    (
        "COA or signed guarantee is required only for collectibles",
        "Uploaded COA or Franks Standard COA is required for collectibles",
    ),
    (
        "Collectible categories need COA or guarantee",
        "Collectible categories need uploaded COA or Franks Standard COA",
    ),
    (
        "you will add COA or guarantee after photos",
        "you will add COA proof after photos",
    ),
    (
        "Collectible categories need COA or guarantee; general merchandise does not",
        "Collectible categories need COA on file; general merchandise does not",
    ),
    (
        "Collectible listings require COA or seller guarantee. Complete the authenticity proof step first.",
        "Collectible listings require uploaded COA or Franks Standard COA. Complete the authenticity proof step first.",
    ),
    (
        "This listing requires a COA upload, Franks COA template, or signed Seller Authenticity Guarantee. Scroll to the Certificate of Authenticity section.",
        "This listing requires an uploaded COA or Franks Standard COA. Scroll to the Certificate of Authenticity section.",
    ),
    (
        "COA or signed seller guarantee is required for this category.",
        "Uploaded COA or Franks Standard COA is required for this category.",
    ),
    (
        "Remove misleading language or fix COA/guarantee before publishing.",
        "Remove misleading language or complete COA proof before publishing.",
    ),
    (
        "Authenticity: COA uploaded or signed Franks Standard guarantee required — add proof in the COA section below.",
        "Authenticity: Upload a COA or use the Franks Standard COA template — add proof in the COA section below.",
    ),
    (
        "<strong>{{ form.category }}</strong> — no COA or signed guarantee required.",
        "<strong>{{ form.category }}</strong> — no COA required.",
    ),
]
for old, new in replacements:
    c = c.replace(old, new)

# Remove guarantee submit checks — replace block
old_checks = """    if (form.coaType === 'guarantee' && !form.guaranteeSigned) {
      alert('You must sign the Seller Authenticity Guarantee to list this item.')
      return
    }
"""
if old_checks in c:
    c = c.replace(old_checks, "", 1)

# Block guarantee if somehow selected
block = """    if (form.coaType === 'guarantee' || !isAllowedCoaProofType(form.coaType)) {
      alert('Written seller guarantee is no longer accepted. Upload your COA or choose the Franks Standard COA template.')
      await navigateTo(`${LIST_ITEM_COA_PATH}/`)
      return
    }
"""
needle = "  if (needsCoa) {\n    if (!form.coaType) {"
if block.strip() not in c and needle in c:
    c = c.replace(needle, block + needle, 1)

# effectiveCoaType validation
c = c.replace(
    "  if (needsCoa && !allowedCoaTypes.has(effectiveCoaType)) {",
    "  if (needsCoa && !isAllowedCoaProofType(effectiveCoaType)) {",
    1,
)

# Remove guarantee imports if unused
for imp in [
    "import {\n  GUARANTEE_WITH_SEAL_INTRO,\n  SELLER_GUARANTEE_SUBTITLE,\n  SELLER_GUARANTEE_TITLE,\n} from '~/utils/authenticitySeal.js'\n\nconst guaranteeSealIntro = GUARANTEE_WITH_SEAL_INTRO\n",
    "  GUARANTEE_WITH_SEAL_INTRO,\n  SELLER_GUARANTEE_SUBTITLE,\n  SELLER_GUARANTEE_TITLE,\n",
]:
    c = c.replace(imp, "")

# Remove guarantee line from buildListingDescription
c = c.replace(
    "  if (coaType === 'guarantee') auth = 'Authenticity: Seller backs this item via signed Seller Authenticity Guarantee (Franks Standard template).'\n",
    "",
    1,
)

sell.write_text(c, encoding="utf-8", newline="\n")
print("patched sell.vue")

# Chooser
chooser = ROOT / "components" / "SellListingPathChooser.vue"
ch = chooser.read_text(encoding="utf-8")
ch = ch.replace(
    "Pick the path that matches your item. Collectibles need authenticity proof first; general merchandise goes straight to the listing form.",
    "Pick the path that matches your item. Collectibles require uploaded COA or a Franks Standard serial — recorded in our registry. General merchandise goes straight to the listing form.",
    1,
)
ch = ch.replace(
    "Cards, coins, watches, art, antiques, memorabilia, and similar items that need COA or seller guarantee.",
    "Cards, coins, watches, art, antiques, memorabilia — COA upload or Franks Standard COA only.",
    1,
)
chooser.write_text(ch, encoding="utf-8", newline="\n")
print("patched SellListingPathChooser.vue")

# Facilitator copy
fac = ROOT / "utils" / "marketplaceFacilitatorCopy.js"
fc = fac.read_text(encoding="utf-8")
fc = fc.replace(
    "Collectible listings require seller-provided proof (COA or signed guarantee template).",
    "Collectible listings require seller-provided proof: third-party COA upload or Franks Standard COA serial in our registry.",
    1,
)
fc = fc.replace(
    "sellers back collectibles with COA or signed guarantee;",
    "sellers back collectibles with COA on file (upload or Franks serial);",
    1,
)
fc = fc.replace(
    "Collectible categories require seller COA or signed guarantee; general merchandise requires accurate photos and description.",
    "Collectible categories require uploaded COA or Franks Standard COA; general merchandise requires accurate photos and description.",
    1,
)
fac.write_text(fc, encoding="utf-8", newline="\n")
print("patched marketplaceFacilitatorCopy.js")

# authenticityScan client
scan = ROOT / "utils" / "authenticityScan.js"
sc = scan.read_text(encoding="utf-8")
sc = sc.replace(
    "label: 'Collectible listing requires COA, guarantee, or Franks issued COA',",
    "label: 'Collectible listing requires uploaded COA or Franks issued COA',",
    1,
)
scan.write_text(sc, encoding="utf-8", newline="\n")
print("patched authenticityScan.js")

# Edge shared scan
edge = ROOT / "supabase" / "functions" / "_shared" / "authenticityScan.ts"
if edge.exists():
    et = edge.read_text(encoding="utf-8")
    et = et.replace(
        "label: 'Collectible listing requires COA, guarantee, or Franks issued COA',",
        "label: 'Collectible listing requires uploaded COA or Franks issued COA',",
        1,
    )
    edge.write_text(et, encoding="utf-8", newline="\n")
    print("patched authenticityScan.ts")
