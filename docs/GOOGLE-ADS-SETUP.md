# Google Ads + paid acquisition setup

The Franks Standard cannot be fully “turned on” from code alone — you need a Google Ads account and billing. This doc is the operator checklist; copy lives in **Ops → Google Ads** (`/ops/google-ads`).

## 0. cwfranks77@gmail vs info@thefranksstandard.com

Google Ads logs in with a **Google account** (Gmail or **Google Workspace**), not a normal Namecheap inbox.

| Your email | Works as Google Ads login? |
|------------|----------------------------|
| **cwfranks77@gmail.com** | Yes — use this today if ads already exist here. |
| **info@thefranksstandard.com** | Only if it is **Google Workspace** on your domain (paid Google mail). Plain Namecheap Private Email cannot sign in to Google. |

### Recommended (keep existing ads, brand as Franks)

1. Stay signed in at [ads.google.com](https://ads.google.com) as **cwfranks77@gmail.com** (do not delete campaigns).
2. **Tools & settings** (wrench) → **Preferences** → set **Account name** to `The Franks Standard`.
3. **Admin** → **Account access** → add a backup admin (your choice).
4. **Billing** → use business card; business name on invoices: `The Franks Standard LLC`.
5. In ads, use landing URLs on **thefranksstandard.com** (not github.io).

Notifications: Google will still email the **Google account** (cwfranks77@gmail). To also get copies at info@, set up **forwarding** in Namecheap from info@ → gmail, or use Workspace (below).

### If you want info@ to own Google Ads (proper long-term)

1. Add **Google Workspace** for thefranksstandard.com (~$7/mo/user) so **info@** is a real Google login.
2. Sign in to [ads.google.com](https://ads.google.com) with **info@thefranksstandard.com**.
3. Either create a **new** Ads account under info@, **or** on the cwfranks77 account: **Tools** → **Access and security** → **Users** → invite **info@** as **Admin** (after Workspace is live).
4. Pause old personal campaigns only after the new account is running (avoid a gap).

### Rebrand old Ambrena account → The Franks Standard (cwfranks77@gmail.com)

Your Ads account stays on **cwfranks77@gmail.com** (that is a normal Gmail Google account — not Workspace, and that is fine). You **cannot** switch the login to **info@thefranksstandard.com** until you buy **Google Workspace** for the domain. Until then, use info@ on the **website and in ad text**, and forward info@ → Gmail if you want one inbox.

**In Google Ads (signed in as cwfranks77@gmail.com):**

1. **Account name:** wrench → **Preferences** → Account name → `The Franks Standard`.
2. **Remove Ambrena campaigns:** **Campaigns** → pause or remove any still named Ambrena / old dropship URLs.
3. **New Search campaign:** goal Traffic or Leads → site `https://thefranksstandard.com/sell` (sellers) and `/browse` (buyers).
4. **Final URL:** only `thefranksstandard.com` paths (no old store domains).
5. **Display path:** `thefranksstandard.com` / `Sell` or `Browse`.
6. **Business name** (assets / some ad types): The Franks Standard.
7. **Call extension:** (877) 837-0527.
8. **Sitelinks:** `/sell`, `/browse`, `/pricing`, `/join/founders10`, `/how-it-works` (each different URL).
9. **Billing:** **Billing** → profile → business name `The Franks Standard LLC`; billing email can stay Gmail or add info@ as contact in Namecheap forward only (Google invoices still go to the Google account email unless Workspace).

**Google account profile (separate from Ads):** [myaccount.google.com](https://myaccount.google.com) → name can stay yours; no need for “Ambrena” on the Google identity.

**Do not** claim info@ “owns” the Ads account in ads copy as the login email — use “Contact: info@thefranksstandard.com” in the site/footer; Ads billing alerts still go to the Gmail that owns the account.

### Do not

- Create a second Ads account on the same site without linking (split data and billing).
- Claim “money-back guarantee” in ads until that program is live (use escrow + COA copy instead).

## 1. Create / open Google Ads

1. Go to [https://ads.google.com](https://ads.google.com) and sign in with the Google account you chose above (Gmail now, info@ after Workspace).
2. Choose **New campaign** → goal **Leads** or **Website traffic** (traffic is fine for marketplace signups).
3. Campaign type: **Search** first (control + intent). Add **Performance Max** later with your pavilion image.

## 2. Conversion tracking (required)

1. Google Ads → **Goals** → **Conversions** → **New conversion action** → **Website**.
2. Use Google tag (gtag.js). Add to repo when you have an ID:

   ```bash
   NUXT_PUBLIC_GADS_ID=AW-XXXXXXXXX
   NUXT_PUBLIC_GADS_CONVERSION_LABEL=xxxxxxxx
   ```

3. Fire conversion on:
   - `/auth/register` success (seller signup)
   - `/sell` first published listing (if trackable)
   - Stripe checkout complete (`/order/success`)

4. Until gtag is in the build, use **Google Analytics 4** linked to Ads and mark key events as conversions.

## 3. Campaign structure (recommended)

| Campaign | Budget/day (start) | Landing URL |
|----------|-------------------|-------------|
| Brand | $5 | `https://thefranksstandard.com/` |
| Sellers – collectibles | $15 | `https://thefranksstandard.com/sell` |
| Sellers – eBay alt | $10 | `https://thefranksstandard.com/sellers/switch` |
| Buyers – trust | $10 | `https://thefranksstandard.com/browse` |

**UTM template:** `?utm_source=google&utm_medium=cpc&utm_campaign={campaign}&utm_content={adgroup}`

## 4. Ad groups & keywords (examples)

**Seller – sports cards**
- Keywords (phrase match): `"sell sports cards online"`, `"ebay alternative lower fees"`, `"collectibles marketplace"`
- Negatives: `free ebay`, `ebay login`, `amazon seller`

**Seller – general**
- `"sell collectibles online"`, `"authenticated marketplace"`, `"COA marketplace"`

**Buyer**
- `"buy authenticated sports cards"`, `"COA sports cards marketplace"`

## 5. Ad copy (paste from Ops page)

Use headlines that match the site **today**:
- COA or guarantee required
- Escrow checkout (not “money-back guarantee”)
- 4–5% seller fees
- FOUNDERS10 — 3 months Pro free

## 6. Extensions

- **Sitelinks:** Browse, Sell, Pricing, Founders10, How it works (each unique URL)
- **Call:** (877) 837-0527
- **Structured snippets:** Categories: Sports Cards, Watches, Coins, Memorabilia

## 7. Also run ads elsewhere (low cost test)

| Platform | Best for | Start |
|----------|----------|-------|
| Meta (Facebook/Instagram) | Seller lookalikes, collectors | Boost post → `/sell`, use `/ops/ads` copy |
| Reddit | r/sportscards, r/coins | Organic + promoted post $5/day |
| Pinterest | Visual collectibles | Pin category images → `/browse` |

## 8. Compliance

- Do **not** claim “eBay money back guarantee” or platform MBG until live (see roadmap).
- Do claim: escrow, COA/guarantee, fee range, FOUNDERS10.

## 9. After deploy

1. Hard refresh site (Ctrl+F5).
2. Confirm landing pages load in &lt;3s on mobile.
3. Turn on campaign at $10–20/day total, review search terms weekly.
