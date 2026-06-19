# B&C phone greeting setup

Your official hold message:

> Thank you for calling B and C Performance Audio, a division of The Franks Standard. Your call is important to us. Please hold while we connect you to customer support.

Then the call forwards to your cell.

**Support line:** (833) 722-4147

---

## Why callers still heard “Petra”

1. The greeting script was saved in the project, but **Twilio was never updated** (API keys were missing from `.env.local`).
2. The homepage showed an **old phone number** (`1-866-319-8547`) instead of your B&C line `(833) 722-4147`.

The live greeting server (`bc-voice-inbound` on Supabase) is now updated with your B&C script.

---

## One-time Twilio setup (about 5 minutes)

You need to point your Twilio number at the greeting URL.

1. Sign in at [https://console.twilio.com](https://console.twilio.com)
2. Go to **Phone Numbers → Manage → Active numbers**
3. Click **(833) 722-4147** (or whichever number customers dial)
4. Under **Voice configuration**:
   - **A call comes in:** Webhook
   - **URL:** `https://rochesyrxiyrxhzmkuwk.supabase.co/functions/v1/bc-voice-inbound`
   - **HTTP:** POST
5. Click **Save**
6. Call **(833) 722-4147** to test

---

## Automatic setup (if you have Twilio API keys)

Add these lines to `.env.local` (never commit this file):

```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
PRIVATE_OWNER_CELL_PHONE=+13373400449
NUXT_PUBLIC_BC_AUDIO_SUPPORT_TEL=+18337224147
```

Then run:

```
npm run ops:deploy-bc-voice
```

That command sets the Twilio webhook to the same greeting URL above.

---

## After deploy

Hard-refresh **www.bcpoweraudio.com** so the site shows **(833) 722-4147**, not the old 866 number.
