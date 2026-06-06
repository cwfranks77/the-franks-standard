# www.bcpoweraudio.com — public discovery setup

The B&C megastore lives at **`/bc-audio`** in this repo. To make it discoverable at **https://www.bcpoweraudio.com** (not only localhost), connect the domain to the **same** static deploy as The Franks Standard.

## Code (already in repo)

| Piece | Purpose |
|--------|---------|
| `plugins/bc-domain-host.client.js` | On `bcpoweraudio.com` / `www.bcpoweraudio.com`, `/` → `/bc-audio` |
| `content/meta-config.json` | Canonical + Open Graph URL `https://www.bcpoweraudio.com/bc-audio` |
| `NUXT_PUBLIC_BC_AUDIO_EXTERNAL_URL` | Marketplace “Full website ↗” link |

Checkout and Stripe split payment remain on **`https://thefranksstandard.com/bc-audio`** unless you later move integration.

## 1. GitHub Pages — add the second domain

Repo: **cwfranks77/the-franks-standard** (or your fork)

1. **Settings → Pages → Custom domain**
2. Keep **thefranksstandard.com** if already set.
3. GitHub now supports multiple domains on one Pages site: add **`www.bcpoweraudio.com`** (and optionally apex `bcpoweraudio.com`).
4. Save; wait for DNS check ✅.

## 2. DNS at your registrar (bcpoweraudio.com) — REQUIRED for www

**Repo deployed:** [github.com/cwfranks77/bcpoweraudio](https://github.com/cwfranks77/bcpoweraudio) (branch `gh-pages`, CNAME `www.bcpoweraudio.com`).

**Until you add this record, `www.bcpoweraudio.com` will not resolve** (verified: NXDOMAIN).

| Type | Name | Value |
|------|------|--------|
| **CNAME** | `www` | `cwfranks77.github.io` |

**Apex (`bcpoweraudio.com`):** Your DNS already aliases the apex to The Franks Standard GitHub Pages IPs. Visitors may hit the main site; the app redirects `bcpoweraudio.com` → `/bc-audio`. For a single canonical host, forward apex → `https://www.bcpoweraudio.com` at your registrar.

**Preview (works now, before www DNS):** https://cwfranks77.github.io/bcpoweraudio/bc-audio

## 3. Deploy secrets (GitHub Actions)

**Settings → Secrets → Actions** — set or confirm:

```env
NUXT_PUBLIC_BC_AUDIO_EXTERNAL_URL=https://www.bcpoweraudio.com
NUXT_PUBLIC_SITE_URL=https://thefranksstandard.com
```

Push to `main` / run **Deploy Franks Standard to GitHub Pages**, or locally:

```powershell
cd C:\Users\ninja\Desktop\franks-restored
$env:NUXT_PUBLIC_BC_AUDIO_EXTERNAL_URL="https://www.bcpoweraudio.com"
npm run build
```

## 4. Verify (production, not localhost)

- https://www.bcpoweraudio.com/ → opens **B&C Performance Audio** immediately (redirects to `/bc-audio`)
- https://www.bcpoweraudio.com/bc-audio → megastore + catalog
- View page source: `canonical` and `og:url` should reference **bcpoweraudio.com**

## 5. Search consoles

After DNS is live (24–48 h):

- [Google Search Console](https://search.google.com/search-console) — add property `https://www.bcpoweraudio.com`
- Bing Webmaster — same URL
- Submit sitemap if you enable `/@nuxtjs/sitemap` later

## Owner unlock (same as The Franks Standard)

On **www.bcpoweraudio.com** (B&C storefront):

1. Tap the **B&C logo** in the top-left **5 times** quickly.
2. Enter the same operator phrase as the main site (`NUXT_PUBLIC_OPS_ACCESS_KEY`).
3. You land on **`/ops/panel`** — same owner toolkit.

Uses the **same GitHub Actions secret** as the Franks deploy. The B&C workflow must pass `NUXT_PUBLIC_OPS_ACCESS_KEY` at build time.

## HTTPS (`https://` broken)

| Host | What to do |
|------|------------|
| **www.bcpoweraudio.com** | DNS **CNAME `www`** → `cwfranks77.github.io` (already correct). In [bcpoweraudio repo → Settings → Pages](https://github.com/cwfranks77/bcpoweraudio/settings/pages), turn on **Enforce HTTPS** when the checkbox is available (GitHub must finish issuing the certificate first — up to 24 h). |
| **bcpoweraudio.com** (no www) | Apex currently points at parking, not GitHub. In **Namecheap → Domain → Redirect**, forward **`bcpoweraudio.com`** → **`https://www.bcpoweraudio.com`**. |

Until HTTPS is live, **http://www.bcpoweraudio.com** works; the build upgrades to HTTPS automatically once the certificate exists.

## Troubleshooting

| Issue | Fix |
|--------|-----|
| Domain shows GitHub 404 | Pages **Source** = **gh-pages** branch from deploy workflow |
| SSL / certificate pending | Wait 24 h; confirm CNAME `www` → `cwfranks77.github.io`; then Enforce HTTPS in Pages settings |
| Apex HTTPS wrong | Forward apex → `https://www.bcpoweraudio.com` at registrar (do not point apex at parking IP) |
| Still only localhost | DNS not pointed; or deploy not run after code push |
| Wrong homepage on bcpoweraudio | Hard-refresh; confirm latest B&C deploy finished |
| Owner unlock missing on B&C | Redeploy after `NUXT_PUBLIC_OPS_ACCESS_KEY` is set in Actions secrets |
