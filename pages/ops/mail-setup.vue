<template>
  <div class="page mail-setup-page">
    <div class="container narrow">
      <header class="mail-head">
        <p class="eyebrow">Owner toolkit</p>
        <h1>Fix info@ on your phone</h1>
        <p class="text-muted">
          After a Namecheap password reset, Android keeps the <strong>old SMTP password</strong> until you
          remove the account and add it again. Use this page on your S25 while you reconfigure mail.
        </p>
      </header>

      <section class="card step-card">
        <h2>Step 1 — Confirm password (webmail)</h2>
        <p class="text-muted">If this fails, reset again in Namecheap before touching the phone.</p>
        <a class="btn btn-primary" href="https://privateemail.com" target="_blank" rel="noopener">Open webmail</a>
        <ul class="checklist">
          <li>Username: <button type="button" class="copy-inline" @click="copy(user)">{{ user }}</button></li>
          <li>Password: same as in <code>MAILBOX-PASSWORD.txt</code> (run <code>npm run mail:set-now</code> on your PC if webmail fails)</li>
        </ul>
      </section>

      <section class="card">
        <h2>Server settings (copy)</h2>
        <table class="settings-table">
          <tbody>
            <tr v-for="row in settings" :key="row.label">
              <th>{{ row.label }}</th>
              <td>
                <code>{{ row.value }}</code>
                <button type="button" class="btn btn-outline btn-xs" @click="copy(row.value)">Copy</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="copied" class="copy-ok">{{ copied }} copied</p>
      </section>

      <section class="card step-card">
        <h2>Step 2 — Samsung S25 (Gmail app)</h2>
        <ol class="steps">
          <li>Gmail → profile photo → <strong>Manage accounts on this device</strong></li>
          <li>Select <strong>{{ user }}</strong> → <strong>Remove account</strong></li>
          <li>Gmail → <strong>Add account</strong> → <strong>Personal (IMAP)</strong></li>
          <li>Enter email + <strong>new</strong> password</li>
          <li>If manual setup: use the table above exactly</li>
          <li>Outgoing: turn <strong>Require sign-in</strong> ON — username is the full email address</li>
        </ol>
      </section>

      <section class="card step-card">
        <h2>Step 2 — Samsung Email app</h2>
        <ol class="steps">
          <li>Settings → Accounts and backup → Manage accounts</li>
          <li>Remove <strong>{{ user }}</strong></li>
          <li>Add account → Email → enter address + new password</li>
          <li>Account type: <strong>IMAP</strong></li>
          <li>Incoming: port <strong>993</strong>, security <strong>SSL/TLS</strong></li>
          <li>Outgoing: port <strong>587</strong>, security <strong>STARTTLS</strong>, authentication <strong>ON</strong></li>
        </ol>
        <p class="text-muted small">
          If 587 fails, try outgoing port <strong>465</strong> with <strong>SSL</strong> (fallback only).
        </p>
      </section>

      <section class="card">
        <h2>Common mistakes</h2>
        <ul class="checklist">
          <li>Username is <code>info</code> instead of full <code>{{ user }}</code></li>
          <li>Only updated password in Namecheap — not on the phone</li>
          <li>SMTP authentication turned OFF (must be ON)</li>
          <li>Using SendGrid password — phone mail uses Namecheap only</li>
        </ul>
      </section>

      <section class="card">
        <h2>Step 3 — Test</h2>
        <ul class="checklist">
          <li>Send from personal email → {{ user }} (incoming)</li>
          <li>Reply from phone → personal email (outgoing)</li>
        </ul>
        <p class="text-muted small">
          On your PC (after filling <code>email.env</code>): run <code>npm run mail:test</code> from the site repo.
        </p>
      </section>

      <div class="actions">
        <NuxtLink to="/ops/panel" class="btn btn-outline">← Operator console</NuxtLink>
        <a class="btn btn-outline" href="https://ap.www.namecheap.com/domains/domaincontrolpanel/thefranksstandard.com" target="_blank" rel="noopener">Namecheap email</a>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default', middleware: 'ops-auth' })

const user = 'info@thefranksstandard.com'
const copied = ref('')

const settings = [
  { label: 'Email / username', value: user },
  { label: 'Incoming server (IMAP)', value: 'mail.privateemail.com' },
  { label: 'Incoming port', value: '993' },
  { label: 'Incoming security', value: 'SSL / TLS' },
  { label: 'Outgoing server (SMTP)', value: 'mail.privateemail.com' },
  { label: 'Outgoing port', value: '587' },
  { label: 'Outgoing security', value: 'STARTTLS' },
  { label: 'SMTP authentication', value: 'Required (same password)' },
]

async function copy (text) {
  if (!import.meta.client) return
  try {
    await navigator.clipboard.writeText(text)
    copied.value = text
    setTimeout(() => { copied.value = '' }, 2000)
  } catch {
    copied.value = 'Select and copy manually'
  }
}
</script>

<style scoped>
.mail-setup-page { padding: 2rem 0 3rem; }
.narrow { max-width: 720px; }
.mail-head { margin-bottom: 1.5rem; }
.step-card .steps { margin: 0.75rem 0 0; padding-left: 1.25rem; }
.step-card .steps li { margin-bottom: 0.5rem; }
.settings-table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
.settings-table th { text-align: left; vertical-align: top; padding: 0.5rem 0.75rem 0.5rem 0; width: 42%; font-weight: 600; }
.settings-table td { padding: 0.5rem 0; }
.settings-table code { word-break: break-all; }
.btn-xs { font-size: 0.75rem; padding: 0.15rem 0.5rem; margin-left: 0.5rem; }
.copy-inline { background: none; border: none; color: var(--accent, #c9a227); text-decoration: underline; cursor: pointer; font: inherit; }
.copy-ok { color: #2e7d32; font-size: 0.9rem; margin-top: 0.5rem; }
.actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.5rem; }
.checklist { margin: 0.5rem 0 0; padding-left: 1.2rem; }
.checklist li { margin-bottom: 0.35rem; }
</style>
