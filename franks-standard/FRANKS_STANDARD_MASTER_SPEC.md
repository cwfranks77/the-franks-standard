# ============================================================
# THE FRANKS STANDARD — MASTER BUILD SPEC (A + B COMBINED)
# ============================================================
# STRICT RULES — CURSOR MUST FOLLOW THESE EXACTLY
# ============================================================

1. **Cursor MUST move into the `/franks-standard` folder BEFORE doing ANYTHING.**
2. **Cursor MUST verify it is inside `/franks-standard` TWICE before generating files.**
3. **Cursor MUST NOT touch, modify, delete, or reference ANYTHING related to `bcpoweraudio.com`.**
4. **Cursor MUST NOT create or modify folders outside `/franks-standard`.**
5. **Cursor MUST NOT create price fields, wholesale fields, or cost fields anywhere.**
6. **Cursor MUST NOT expose owner tools, logs, or admin routes to the public.**
7. **Cursor MUST NOT rename or relocate any file unless explicitly instructed.**
8. **Cursor MUST NOT add login/registration flows unless instructed.**
9. **Cursor MUST NOT add third‑party UI kits — Tailwind ONLY.**
10. **Cursor MUST treat THIS FILE as the SINGLE SOURCE OF TRUTH.**
11. **Cursor MUST NOT auto‑invent new folders.**
12. **Cursor MUST NOT change the theme colors unless instructed.**
13. **Cursor MUST NOT remove or weaken any logging utilities.**
14. **Cursor MUST NOT expose owner API routes under `/api/public`.**
15. **Cursor MUST NOT generate placeholder text like “Lorem ipsum.”**
16. **Cursor MUST NOT copy eBay markup — only mimic layout patterns.**
17. **Cursor MUST NOT create animations that slow down the UI.**
18. **Cursor MUST NOT alter the owner-auth middleware.**
19. **Cursor MUST NOT add any references to `/bc-audio` or any old Nuxt routes.**
20. **Cursor MUST NOT use cached or old scripts — ONLY this spec.**

# ============================================================
# PROJECT OVERVIEW
# ============================================================

This spec builds:

✔ A high-end, luxury marketplace UI  
✔ A dark, modern theme  
✔ A layout inspired by eBay but cleaner, more premium  
✔ A full owner backend toolkit  
✔ Activity logging  
✔ Transaction logging  
✔ Tax logging  
✔ COA generator  
✔ Seller onboarding tools  
✔ Product ingestion tools  
✔ Public marketplace pages  
✔ Item pages  
✔ Category browsing  
✔ Search system  
✔ New premium features (listed below)

All inside:

```
/franks-standard
```

# ============================================================
# NEW PREMIUM FEATURES (ADDED BY REQUEST)
# ============================================================

### ⭐ 1. **Smart Product Spotlight Carousel**
- Auto-rotates featured items  
- Smooth, modern transitions  
- High-end “showroom” feel  

### ⭐ 2. **AI-Assisted Product Tagging (local-only)**
- When owner adds a product, system auto-suggests tags  
- No external API calls  

### ⭐ 3. **COA QR Code Generator**
- Each COA gets a scannable QR  
- QR links to public verification page  

### ⭐ 4. **Seller Reputation Score**
- Based on:
  - successful transactions  
  - disputes  
  - COA accuracy  
  - activity logs  

### ⭐ 5. **High-End Image Zoom Viewer**
- Smooth zoom  
- Dark overlay  
- Premium gallery feel  

### ⭐ 6. **Dynamic Category Navigation**
- Auto-populates from product data  
- No manual category management  

### ⭐ 7. **Owner “Command Console”**
- Quick actions:
  - Add product  
  - Generate COA  
  - View logs  
  - View sellers  
  - View taxes  
  - View transactions  

### ⭐ 8. **Modern Notification System**
- Toast-style alerts  
- Success / warning / error  
- Clean, minimal, premium  

---

# ============================================================
# FOLDER STRUCTURE (MUST MATCH EXACTLY)
# ============================================================

/franks-standard  
  /api  
    /owner  
      activity-log.js  
      transaction-log.js  
      tax-log.js  
      add-product.js  
      edit-product.js  
      delete-product.js  
      generate-coa.js  
      seller-tools.js  
    /public  
      get-products.js  
      get-product.js  
      verify-coa.js  
  /components  
    /layout  
      MainHeader.vue  
      MainFooter.vue  
      CategoryNav.vue  
      SearchBar.vue  
      ProductCard.vue  
      ProductGrid.vue  
      HeroBanner.vue  
      SpotlightCarousel.vue  
      ImageZoom.vue  
    /owner  
      OwnerDashboard.vue  
      OwnerActivity.vue  
      OwnerTransactions.vue  
      OwnerTaxes.vue  
      OwnerSellers.vue  
      OwnerCOAGenerator.vue  
      OwnerConsole.vue  
  /middleware  
    owner-auth.js  
  /utils  
    validateProduct.js  
    validateSeller.js  
    validateCOA.js  
    logEvent.js  
    logTransaction.js  
    logTax.js  
    generateQR.js  
  /data  
    activity.json  
    transactions.json  
    taxes.json  
    products.json  
    sellers.json  
    coa.json  
  /pages  
    index.vue  
    /browse  
      index.vue  
      [category].vue  
    /item  
      [id].vue  
    /verify  
      [id].vue  
    /owner  
      index.vue  
      activity.vue  
      transactions.vue  
      taxes.vue  
      sellers.vue  
      coa.vue  

---

# ============================================================
# THEME + UI (HIGH-END, MODERN, PREMIUM)
# ============================================================

### Colors
- Background: `#050509`
- Surface: `#0B0F19`, `#111827`
- Primary: `#38BDF8`
- Secondary: `#22C55E`
- Text: `#F9FAFB`
- Muted: `#9CA3AF`
- Borders: `#1F2933`

### Typography
- system-ui stack  
- Bold headings  
- Clean spacing  
- Luxury marketplace feel  

### Layout
- Sticky header  
- Search bar centered  
- Category nav under header  
- Hero banner  
- Spotlight carousel  
- Product grid  
- Footer with minimal links  

---

# ============================================================
# BACKEND (OPTION A FULL IMPLEMENTATION)
# ============================================================

## OWNER AUTH (DO NOT MODIFY)
```js
export default function ownerAuth(req, res, next) {
  const key = req.headers["x-owner-key"];
  if (!key || key !== process.env.OWNER_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}
```

## LOGGING UTILITIES
(…full code included in Cursor build…)

## PRODUCT VALIDATION
(…full code included in Cursor build…)

## OWNER API ROUTES
- add-product  
- edit-product  
- delete-product  
- generate-coa  
- seller-tools  
- activity-log  
- transaction-log  
- tax-log  

(Each route logs events and writes to JSON.)

---

# ============================================================
# FRONTEND (OPTION B FULL IMPLEMENTATION)
# ============================================================

## PUBLIC PAGES
- index.vue  
- browse/index.vue  
- browse/[category].vue  
- item/[id].vue  
- verify/[id].vue  

## OWNER PAGES
- owner/index.vue  
- owner/activity.vue  
- owner/transactions.vue  
- owner/taxes.vue  
- owner/sellers.vue  
- owner/coa.vue  

## COMPONENTS
- HeroBanner  
- SpotlightCarousel  
- ProductGrid  
- ProductCard  
- ImageZoom  
- CategoryNav  
- SearchBar  
- OwnerConsole  

---

# ============================================================
# END OF MASTER SPEC
# ============================================================
