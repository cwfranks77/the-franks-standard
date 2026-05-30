# Signup email not arriving — fix

## What was wrong

The `auth-send-email` function returned **`missing_send_email_hook_secret`**.

SendGrid sender is verified, but Supabase must pass a **hook signing secret** to the edge function. Without it, signup never sends mail.

---

## Fix on your phone (5 minutes)

### Step 1 — Copy the hook secret

1. Open: https://supabase.com/dashboard/project/rochesyrxiyrxhzmkuwk/auth/hooks  
2. Open your **Send Email** hook (must be **enabled**).  
3. URL must be exactly:
   ```
   https://rochesyrxiyrxhzmkuwk.supabase.co/functions/v1/auth-send-email
   ```
4. Tap **Generate secret** (or copy existing signing secret).  
5. Copy the whole value (starts with `v1,whsec_`).

### Step 2 — Add to GitHub

1. https://github.com/cwfranks77/the-franks-standard/settings/secrets/actions  
2. **New secret**  
   - Name: `SEND_EMAIL_HOOK_SECRET`  
   - Value: paste the `v1,whsec_...` string  

### Step 3 — Deploy

1. https://github.com/cwfranks77/the-franks-standard/actions  
2. **Deploy Supabase Edge Functions** → **Run workflow**  
3. Wait for green checkmark.

### Step 4 — Test signup

Incognito → https://thefranksstandard.com/auth/register  
Use a **Gmail** (not info@). Check spam.

---

## Optional: test SendGrid only

```powershell
cd the-franks-standard
node scripts/test-sendgrid-send.cjs your@gmail.com
```

If that arrives but signup does not, the hook secret step above is still required.

---

## Redirect URL

https://supabase.com/dashboard/project/rochesyrxiyrxhzmkuwk/auth/url-configuration  

Must include: `https://thefranksstandard.com/auth/verify`
