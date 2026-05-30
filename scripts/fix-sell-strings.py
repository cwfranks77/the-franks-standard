from pathlib import Path
p = Path(__file__).resolve().parent.parent / "pages" / "sell.vue"
c = p.read_text(encoding="utf-8")
c = c.replace(
    "  if (coaType === 'guarantee') auth = 'Authenticity: Seller backs this item via Franks Standard COA (Franks Standard template).'\n",
    "",
)
c = c.replace("fix COA/guarantee before publishing", "complete COA proof before publishing")
c = c.replace(
    "COA or signed guarantee is required only for collectibles",
    "Uploaded COA or Franks Standard COA is required for collectibles",
)
if "isAllowedCoaProofType" not in c:
    c = c.replace(
        "  LIST_ITEM_COA_PATH,\n} from '~/utils/listItemRoutes.js'",
        "  LIST_ITEM_COA_PATH,\n  isAllowedCoaProofType,\n} from '~/utils/listItemRoutes.js'",
        1,
    )
p.write_text(c, encoding="utf-8", newline="\n")
print("done")
