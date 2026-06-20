# Visual Guidelines — Backend Notes

**Scope:** This document records backend and content-system notes for how visual identity is stored, resolved, and enforced in code. It is **not** a UI design spec—no colors, spacing, or component layouts for front-end implementation here.

---

## Purpose

Engineering and CMS pipelines need a single source for:

- Which brand context applies to a request (TFS vs B&C marketing)
- Where assets and tokens are loaded from
- How to prevent cross-brand bleed in data and APIs

---

## Brand Context Enum

Backend services should resolve `brand_context` as one of:

| Value | Meaning |
|-------|---------|
| `tfs` | The Franks Standard marketplace default |
| `bc_audio` | B&C Performance Audio lane (marketing, store slug, fee qualification) |

Default for unscoped marketplace routes: `tfs`.

B&C association typically derives from:

- Store profile flag or plan qualification
- Listing category / store namespace metadata
- Marketing URL UTM or campaign source (analytics only—not authorization)

**Authorization and checkout never depend on theme alone.**

---

## Asset Resolution

Recommended storage layout (conceptual):

```
/public/brands/tfs/          — default marketplace assets
/public/brands/bc_audio/     — B&C marketing assets only
```

Backend rules:

1. Email templates receive `brand_context` and select header logo URL from the matching prefix.
2. PDF exports (invoices, COA certificates) embed brand mark from listing store's qualified lane—not buyer preference.
3. API responses for `GET /stores/:id` may include `brand_lane: 'bc_audio' | null` for client theming; null implies TFS default.

Do not serve B&C assets on Franks-only admin routes unless explicitly previewing marketing.

---

## CMS & Copy Slots

Long-form content (help articles, emails) should store:

- `locale`
- `brand_context` (optional; default `tfs`)
- `content_key` (e.g. `seller_onboarding.welcome`)

B&C-specific marketing copy lives under keys prefixed `bc_audio.*` to avoid accidental injection into Franks shell strings.

---

## SEO & Metadata Backend

- `og:site_name`: "The Franks Standard" globally; B&C landing pages may use "B&C Performance Audio | The Franks Standard".
- Canonical URLs must not duplicate listing content across brand paths—listings have one canonical slug on TFS.

---

## Fee & Plan Badges (Data Only)

Visual badges are client-rendered; backend provides:

- `platform_fee_rate` (decimal)
- `fee_plan` (`default` | `featured` | `starter` | `bc_audio_qualified`)
- `badges[]` string array (e.g. `coa_eligible`, `bc_audio_lane`)

Never compute fees in the client without server validation on checkout.

---

## COA & Trust Badges

Backend flags on listings:

- `coa_required`
- `coa_uploaded`
- `coa_serial` (nullable)
- `verification_enabled`

Icon choice is front-end; API only exposes booleans and serial for verification endpoints.

---

## Email & Notification Theming

Notification service parameters:

```json
{
  "brand_context": "tfs",
  "template_id": "order_shipped",
  "logo_url": "/brands/tfs/logo-email.png"
}
```

B&C seller announcements set `brand_context: "bc_audio"`; order receipts for mixed carts still use TFS receipt template with line-item store attribution.

---

## Audit & Compliance

- Log when marketing sends use `bc_audio` context (campaign ID).
- Owner export includes brand lane on store records for fee audits.
- Visual misconfiguration (wrong logo on email) is a **content bug**, not a security boundary—payments and disputes remain TFS-scoped.

---

## Explicit Non-Goals (This Document)

- Color hex values, typography scales, grid systems
- Vue component structure for `pages/index.vue` vs B&C routes
- Screenshot or mockup references

Refer to product design sources for UI; refer to this file for **backend brand resolution and content routing**.
