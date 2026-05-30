#!/usr/bin/env python3
from pathlib import Path

path = Path(__file__).resolve().parent.parent / "pages" / "sell.vue"
c = path.read_text(encoding="utf-8")

old_header = """        <div class="sell-header text-center">
          <template v-if="isListingFlow">
            <h1>List your item</h1>
            <p v-if="listingKind === 'general'" class="text-muted">
              General merchandise only (retail categories). Collectibles and antiques are not allowed on this path — use the Collectible option.
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

new_header = """        <div class="sell-header text-center">
          <template v-if="needsPolicyAcceptance || policyLoading">
            <h1>{{ isListingFlow ? 'List your item' : 'Sell on The Franks Standard' }}</h1>
            <p class="text-muted">Sign the seller policy agreement below to continue.</p>
          </template>
          <template v-else-if="isListingFlow">
            <h1>List your item</h1>
            <p v-if="listingKind === 'general'" class="text-muted">
              General merchandise only (retail categories). Collectibles and antiques are not allowed on this path — use the Collectible option.
            </p>
            <p v-else class="text-muted">
              Collectible listing — COA or seller guarantee applies. Add your item below.
            </p>
          </template>
          <template v-else>
            <h1>Sell on The Franks Standard</h1>
            <p class="text-muted">List in minutes. COA or signed guarantee is required only for collectibles, antiques, and similar categories — general merchandise uses accurate photos and description.</p>
          </template>
        </div>

        <div
          v-if="!isListingFlow && !needsPolicyAcceptance && !policyLoading"
          class="sell-switch-banner card"
          role="status"
        >"""

if old_header not in c:
    raise SystemExit("header block not found — sell.vue may have changed")
path.write_text(c.replace(old_header, new_header, 1), encoding="utf-8", newline="\n")
print("patched", path)
