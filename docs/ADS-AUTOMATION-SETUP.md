# Ads automation — you set up accounts, bots run posts & paid Meta

## What runs automatically today

| What | How | Schedule |
|------|-----|----------|
| **Organic posts** (Telegram, Facebook Page, Instagram, X) | GitHub Action `Post Franks Social Ads` | Mon/Wed/Fri 9am CT |
| **Security campaign posts** | Same workflow — choose campaign **security** | Manual or change default in workflow |
| **Full ads run** (organic + optional paid) | GitHub Action `Run ads (organic + optional Meta paid)` | Manual only (workflow_dispatch) |

Reddit **paid** and Google **paid** are not fully API-automated yet — the bot **exports copy** to `assets/paid-ads-export/` for you to paste into [ads.reddit.com](https://ads.reddit.com) and [ads.google.com](https://ads.google.com).

---

## Step 1 — You create accounts (one-time)

1. **Meta Business** — [business.facebook.com](https://business.facebook.com) — Page + Ad account + payment method  
2. **X Developer** — [developer.x.com](https://developer.x.com) — app + Read/Write tokens → GitHub secrets (see `docs/X-PROFILE-REBRAND.md`)  
3. **Telegram** — @BotFather + channel (optional notify chat)  
4. **Reddit** — personal account for organic; [ads.reddit.com](https://ads.reddit.com) for paid  
5. **Google Ads** — [ads.google.com](https://ads.google.com) for paid search  

---

## Step 2 — GitHub secrets (bots use these)

[Repo → Settings → Secrets → Actions](https://github.com/cwfranks77/the-franks-standard/settings/secrets/actions)

### Organic (already documented)

| Secret | Purpose |
|--------|---------|
| `FACEBOOK_PAGE_ID` | `1018067851385482` |
| `FACEBOOK_PAGE_ACCESS_TOKEN` | Long-lived Page token |
| `TELEGRAM_BOT_TOKEN` | Bot |
| `TELEGRAM_CHANNEL_ID` | Public channel |
| `TELEGRAM_NOTIFY_CHAT_ID` | Your private DM for run reports |
| `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET` | X posts |

See `docs/META-FACEBOOK-SETUP.md` for Facebook token exchange.

### Paid Meta (add when ready)

| Secret | Example | Purpose |
|--------|---------|---------|
| `META_AD_ACCOUNT_ID` | `act_1234567890` | Ads Manager → Account settings |
| `META_AD_ACCESS_TOKEN` | User token with `ads_management` | Same app as Facebook, extra permissions |
| `META_ADS_DAILY_BUDGET_USD` | `5` | Cap per day (script max $50) |
| `META_ADS_STATUS` | `PAUSED` | Create ads paused (recommended) or `ACTIVE` |

**Safety:** Paid scripts default to **dry-run** unless `META_ADS_LIVE=1` in the environment.

---

## Step 3 — Run from your machine

```bash
npm run secrets:check
npm run validate:facebook

# Organic security post (all channels)
npm run post:social:security

# Dry-run Meta paid plan (no spend)
npm run ads:meta:dry

# Organic + export Reddit/Google copy
npm run ads:run

# When secrets are set — create PAUSED Meta campaign
set META_ADS_LIVE=1
set META_ADS_STATUS=PAUSED
npm run ads:run:live
```

---

## Step 4 — Run from GitHub (no laptop needed)

1. **Actions** → **Post Franks Social Ads** → Run workflow → campaign **security**  
2. **Actions** → **Run ads (organic + optional Meta paid)**  
   - campaign: **security**  
   - meta_paid: **true** only after `META_AD_ACCOUNT_ID` is set  
   - meta_live: **false** first (dry-run), then **true** when ready to create real campaigns  

You get a **Telegram DM** summary if `TELEGRAM_NOTIFY_CHAT_ID` is set.

---

## Reddit & Google paid (semi-automated)

After `npm run ads:run` or the GitHub workflow with export enabled:

- `assets/paid-ads-export/reddit-security.txt` → paste into Reddit Ads  
- `assets/paid-ads-export/google-security.json` → paste into Google Ads editor  

Organic Reddit posting: `/social/community` — still manual (Reddit bans bots).

---

## Ops panel

**https://thefranksstandard.com/ops/ads** — copy library + automation checklist.

---

## Rotate campaigns

| npm command | Campaign |
|-------------|----------|
| `npm run post:social` | Default product blurb |
| `npm run post:social:security` | Security stack |
| `npm run post:social:founders` | FOUNDERS10 |
| `npm run post:social:honor` | HONOR26 |

To alternate security vs default on the schedule, edit `.github/workflows/post-social-ads.yml` default campaign input or add a second cron job.
