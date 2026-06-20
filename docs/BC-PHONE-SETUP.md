# B&C Performance Audio — phone setup

| Number | Role |
|--------|------|
| **+18337224147** `(833) 722-4147` | **Customer line** — what shoppers call |
| **+13373400449** `(337) 340-0449` | **Owner handoff** — rings only when caller asks for owner or AI escalates |

**Support line:** (833) 722-4147 / +18337224147

---

## Why callers still heard “Petra” (B&C line only — Franks Standard is separate)

The B&C support number **(833) 722-4147** must use **only** the B&C greeting handler below. Do **not** point it at the Franks Standard AI line (`twilio-voice-inbound`) — that is a different product and may play old recorded greetings.

Saving the Supabase URL in Twilio is only half the job. **Real phone calls may still not use that URL** if:

| Likely cause | What to check in Twilio (B&C number only) |
|--------------|---------------------------------------------|
| **Studio Flow** still active | Number → Configure → **Primary handler** = **Webhook**, not Studio Flow |
| **Voice fallback URL** points to Franks handler | Clear fallback or use the B&C twimlet URL below — **never** `twilio-voice-inbound` |
| **Wrong number dialed** | Old `1-866-319-8547` may still route to Petra — site shows `(833) 722-4147` |
| **Webhook saved but not used** | After a test call: Monitor → Logs → Calls → check **Request URL** |

The word “Petra” is **not** in the B&C greeting code. It comes from an old phone path (Studio Flow, fallback URL, or a different number).

---

## Fix that works without Supabase (recommended)

Use Twilio’s own hosted greeting. Paste this **entire URL** as the Voice **Webhook** (HTTP POST):

```
https://twimlets.com/echo?Twiml=%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3CResponse%3E%3CSay%20voice%3D%22Polly.Joanna%22%3EThank%20you%20for%20calling%20B%20and%20C%20Performance%20Audio%2C%20a%20division%20of%20The%20Franks%20Standard.%20Your%20call%20is%20important%20to%20us.%20Please%20hold%20while%20we%20connect%20you%20to%20customer%20support.%3C%2FSay%3E%3CDial%20timeout%3D%2235%22%3E%2B13373400449%3C%2FDial%3E%3C%2FResponse%3E
```

This plays your B&C hold message, then rings **your cell** (`+13373400449`). No Supabase involved.

To print this URL again anytime:

```
node scripts/print-bc-voice-twimlet.cjs
```

---

## Call flow (live on +18337224147)

1. **Greeting** — "Thank you for calling B and C Performance Audio…" (no Franks Standard mention)
2. **AI assistant** — natural neural voice, powered by **GPT-4o** for complex questions
3. **Your cell (337) 340-0449** rings only when caller says **owner** / presses **0**, or AI escalates

**Voice:** Amazon Polly **Joanna Neural** (most human-like on Twilio). Optional Supabase secrets: `BC_TWILIO_VOICE`, `BC_VOICE_AI_MODEL`.

This was applied for you on the server. To run it again anytime:

```
npm run ops:apply-bc-voice-twilio
```

That clears any old Studio Flow hook on **(833) 722-4147** and sets the B&C twimlet greeting + forward to your cell.

## Manual setup (if you prefer Twilio console)

You need to point your Twilio number at the greeting URL.

### New Twilio screen (most accounts now)

1. Sign in at [https://console.twilio.com](https://console.twilio.com)
2. Left menu: **Phone Numbers** → **Manage** → **Active numbers**  
   (Some accounts say **Numbers & senders** → **Phone numbers**)
3. Click your B&C number: **(833) 722-4147**
4. Open the **Configure** tab (or **Configuration details**)
5. Find **Voice** (or **Voice and emergency calling**) and click **Edit** / **Edit details**
6. Under **Primary handler** (or *How do you want to set up your primary method?*):
   - Choose **Webhook** (not Studio Flow, not TwiML Bin)
7. Paste the **twimlet URL** from the section above (recommended), **or** this Supabase URL:
   ```
   https://rochesyrxiyrxhzmkuwk.supabase.co/functions/v1/bc-voice-inbound
   ```
8. Set method to **HTTP POST**
9. **Fallback URL:** leave empty, or paste the same twimlet URL (do **not** use `twilio-voice-inbound`)
10. Click **Save**

### Confirm what Twilio actually uses (after a test call)

1. Twilio left menu: **Monitor** → **Logs** → **Calls**
2. Click your test call to `(833) 722-4147`
3. Look at **Request URL** — it must match the URL you pasted (twimlet or `bc-voice-inbound`)
4. If it shows a different URL or **Studio**, the Primary handler is still wrong

### Older Twilio screen (if you still see it)

1. Open your number → scroll to **Voice & Fax**
2. **Configure with:** Webhook, TwiML Bin, Function, Studio Flow…
3. **A call comes in:** Webhook
4. Same URL and **POST** as above → **Save**

### If you see “Studio Flow” instead of Webhook

Your number may still be on an old **Studio Flow** (that can play the Petra message). Change **Primary handler** from **Studio Flow** to **Webhook**, then paste the twimlet URL above.

### Test

Call **(833) 722-4147**. You should hear the B&C hold message, then your cell rings.


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

That command sets the Twilio webhook to the **twimlet** B&C greeting (forwards to your cell). To use Supabase instead, set `BC_VOICE_WEBHOOK_URL` in `.env.local` before running.

---

## After deploy

Hard-refresh **www.bcpoweraudio.com** so the site shows **(833) 722-4147**, not the old 866 number.
