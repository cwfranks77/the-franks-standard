# B&C Power Audio — restore points (backup tags)

If a deploy breaks the live site, restore using these git tags:

| Tag | Commit | When to use |
|-----|--------|-------------|
| `backup-bcpoweraudio-https-www-align-2026-06-11` | `89a122e` | **Current save point** — redirect loop fixed, www CNAME + GitHub Pages aligned for HTTPS |
| `backup-bcpoweraudio-pre-loadfix-2026-06-11` | `dfaddea` | Before white-screen load fix |
| `backup-bcpoweraudio-working-bc-audio-route` | `d1dd3bc` | Old home at `/bc-audio` |

Restore example:

```bash
git checkout backup-bcpoweraudio-https-www-align-2026-06-11
# push master, wait for Deploy B&C to bcpoweraudio.com workflow
```

## Correct DNS (Namecheap Advanced DNS) — do not change without reason

| Type | Host | Value |
|------|------|--------|
| CNAME | `www` | `cwfranks77.github.io` |
| URL Redirect (Unmasked) | `@` | `https://www.bcpoweraudio.com` |

**Do not** use A records on `@` at the same time as the redirect.

## Correct GitHub (bcpoweraudio repo → Settings → Pages)

| Setting | Value |
|---------|--------|
| Custom domain | `www.bcpoweraudio.com` |
| CNAME file on `gh-pages` branch | `www.bcpoweraudio.com` (must match exactly) |
| Enforce HTTPS | On when GitHub shows certificate ready |

Green **DNS check** ≠ both hostnames secure. **www** is the store. Bare name needs redirect at Namecheap.

## Live store URL for customers

**https://www.bcpoweraudio.com**
