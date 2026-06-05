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

- https://www.bcpoweraudio.com/ → loads, then shows **B&C Performance Audio** (`/bc-audio`)
- https://www.bcpoweraudio.com/bc-audio → megastore + catalog
- View page source: `canonical` and `og:url` should reference **bcpoweraudio.com**

## 5. Search consoles

After DNS is live (24–48 h):

- [Google Search Console](https://search.google.com/search-console) — add property `https://www.bcpoweraudio.com`
- Bing Webmaster — same URL
- Submit sitemap if you enable `/@nuxtjs/sitemap` later

## Troubleshooting

| Issue | Fix |
|--------|-----|
| Domain shows GitHub 404 | Pages **Source** = **GitHub Actions**, not old branch deploy |
| SSL pending | Wait up to 24 h after DNS; enforce HTTPS in Pages |
| Still only localhost | DNS not pointed; or deploy not run after code push |
| Wrong homepage on bcpoweraudio | Hard-refresh; confirm `bc-domain-host.client.js` is in latest deploy |
