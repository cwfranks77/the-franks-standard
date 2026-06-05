# B&C Performance Audio — own website + Franks Standard link

You can run a **standalone B&C site** (your own domain or subdomain) and still keep the **Franks Standard storefront** at `/bc-audio` for marketplace discovery and Stripe split checkout.

## How it works

| Surface | Purpose |
|--------|---------|
| `https://thefranksstandard.com/bc-audio` | Catalog + dropship checkout on the marketplace (always keep this for payments) |
| `NUXT_PUBLIC_BC_AUDIO_EXTERNAL_URL` | Optional marketing site opened in a new tab (“Full website ↗”) |

## Setup

1. Host the B&C site on your domain (production: **`https://www.bcpoweraudio.com`** — see `docs/BCPOWERAUDIO-DOMAIN.md`).
2. In `.env` and GitHub Actions secrets for deploy, set:

   ```env
   NUXT_PUBLIC_BC_AUDIO_EXTERNAL_URL=https://your-bc-domain.com
   ```

3. Rebuild / redeploy GitHub Pages.

4. On the B&C standalone site, link back to Franks for checkout, for example:

   ```html
   <a href="https://thefranksstandard.com/bc-audio">Checkout on The Franks Standard</a>
   ```

## DNS pattern (subdomain on your main domain)

- `CNAME audio.thefranksstandard.com` → your B&C host (Vercel, Netlify, etc.)
- Franks marketplace continues to use `/bc-audio` — no conflict.

## What does not move automatically

- Stripe Connect split checkout stays on Franks (`/bc-audio`, edge `bc-dropship-checkout`).
- Moving checkout to the external site only would require new integration on that host.
