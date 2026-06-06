# B&C Performance Audio — dedicated support phone line

**Master contact ledger:** `src/content/support-contacts.json` — one file for both brands (phone, email, hours). Replace placeholder phones with your real cell and Google Voice numbers, then redeploy.

B&C uses its **own** customer service number, separate from The Franks Standard `(877) 837-0527`.

| Brand | Display on site | Twilio |
|-------|-----------------|--------|
| **The Franks Standard** | `NUXT_PUBLIC_CUSTOMER_SERVICE_PHONE` | Main marketplace Studio flow |
| **B&C Performance Audio LLC** | `NUXT_PUBLIC_BC_AUDIO_SUPPORT_PHONE` | B&C Studio flow (below) |

## Already have a paid Twilio account? (recommended)

If you have **balance on file** (same account as Franks), use the project script — it charges your Twilio balance (~$2/month per toll-free number).

1. Open [twilio.com/console](https://console.twilio.com) → copy **Account SID** and **Auth Token**.
2. In the project folder, create **`.env.local`** (never commit this file):

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
```

3. In a terminal, from the project folder:

```powershell
npm run ops:setup-bc-phone
npm run ops:setup-bc-phone -- --search
npm run ops:setup-bc-phone -- --buy --gh-secrets
```

- **`--search`** — shows toll-free numbers available to buy  
- **`--buy`** — purchases one number from your balance  
- **`--gh-secrets`** — saves the number to GitHub Actions so the next deploy updates the live site  

4. Set `PRIVATE_OWNER_CELL_PHONE` in `.env.local` to your cell (E.164). In Studio, the **“talk to owner”** path dials that number.
5. Continue with **section 3** below (Studio flow on the new number).

## 1. Buy manually in Twilio (alternative)

1. Sign in at [twilio.com/console](https://console.twilio.com/console) (same account as Franks is fine).
2. Go to **Phone Numbers → Manage → Buy a number**.
3. Search **toll-free** (1-800 / 1-833 / 1-888) or a **Louisiana local** number.
4. Buy the number (~$2/month toll-free, paid from your Twilio balance).
5. Copy the number in display form, e.g. `(833) 322-8439`, and E.164 form, e.g. `+18333228439`.

## 2. GitHub secrets (both repos use the same repo secrets)

In **cwfranks77/the-franks-standard → Settings → Secrets → Actions**, add or update:

| Secret | Example |
|--------|---------|
| `NUXT_PUBLIC_BC_AUDIO_SUPPORT_PHONE` | `(833) 322-8439` |
| `NUXT_PUBLIC_BC_AUDIO_SUPPORT_TEL` | `+18333228439` |

Redeploy B&C (push to `master` or re-run **Deploy B&C to bcpoweraudio.com**).

## 3. Studio flow — same pattern as Franks

1. [Studio → Flows → Create](https://console.twilio.com/us1/develop/studio/flows) → name: **B&C Performance Audio Customer Service**.
2. **Say/Play:**  
   *"Thank you for calling B and C Performance Audio — competition car audio, subwoofers, and amplifiers. I'm your AI assistant. How can I help you today?"*
3. **Gather Input** (speech) → route keywords:
   - **order / shipping / tracking** → short answer + offer callback
   - **sub / amp / install / product** → product help script
   - **return / refund / damaged** → returns script
   - **owner / manager / speak to someone** → transfer to your cell (same as Franks Open Door)
4. Enable **Record calls** on the incoming trigger (or Voice → Settings globally).
5. On the **B&C phone number** → **A call comes in** → **Studio Flow** → **B&C Performance Audio Customer Service**.

## 4. Franks central line (optional cleanup)

The Franks hub `(877) 837-0527` no longer needs **Option 3** for B&C. Update your Franks Studio flow greeting to say:

*"For B and C Performance Audio car audio, call [B&C number] directly."*

See `marketing/central-phone-tree-configuration.txt` for the old Option 3 tree (archived reference).

## 5. Verify on the live site

After deploy:

- **www.bcpoweraudio.com** → top nav shows the B&C number only (no “Option 3”).
- **B&C Help** chat mentions the same number.
- **Open Door** (`/bc-audio/open-door`) click-to-call uses the B&C `tel:` link.
- **The Franks Standard** `/support` lists both numbers.
