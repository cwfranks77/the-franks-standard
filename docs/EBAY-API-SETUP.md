# eBay API — fully automated skim

One-time setup enables **one-click** seller prospecting and **automatic inventory import** (no HTML upload).

## 1. Create an eBay developer app

1. Sign in at [https://developer.ebay.com/](https://developer.ebay.com/)
2. **My Account** → **Application Keys** → create an app (Production keys).
3. Copy **App ID (Client ID)** and **Cert ID (Client Secret)**.

Required OAuth scope (default for client credentials):

- `https://api.ebay.com/oauth/api_scope`

## 2. Add secrets to Supabase (one command)

From the repo root (PowerShell). You will be prompted for App ID and Cert ID unless they are in `.env` or `franks-standard-credentials/ebay.env`:

```powershell
npm run ebay:setup
```

That script:

1. Saves keys to `franks-standard-credentials/ebay.env` (never committed)
2. Sets GitHub secrets `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET`
3. Pushes to Supabase Edge secrets on project `rochesyrxiyrxhzmkuwk` (paste `sbp_` token if asked)

Or trigger from GitHub after secrets exist:

```powershell
gh workflow run push-supabase-ebay-secrets.yml --repo cwfranks77/the-franks-standard
```

Edge functions read secrets at runtime — no redeploy required after pushing secrets.

## 3. Verify

1. Unlock ops → **https://thefranksstandard.com/ops/ebay-prospects**
2. Click **Find sellers now** — status should show **eBay API (automated)** and a table of sellers within ~10s.
3. **https://thefranksstandard.com/sell/import** — enter an eBay username → **Preview listings** should load without HTML.

## What runs automatically

| Feature | API used |
|---------|----------|
| Prospect skim (`/ops/ebay-prospects`) | Browse API search → unique sellers |
| Inventory import (`/sell/import`) | Browse API `filter=sellers:{username}` |

If API keys are missing, the site falls back to HTML scrape (usually blocked) or manual HTML/CSV upload.

## Sandbox (optional)

For testing only:

```text
EBAY_API_ENV=sandbox
```

Use sandbox App ID / Cert ID from the eBay developer portal.
