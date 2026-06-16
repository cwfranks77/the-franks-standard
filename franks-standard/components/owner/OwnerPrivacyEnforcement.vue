<script setup>
import { OFF_PLATFORM_POLICY_SUMMARY } from '~/utils/offPlatformGuard'
import { PROFILE_PRIVACY_NOTICE } from '~/utils/publicProfile'
import { MESSAGING_POLICY } from '~/utils/platformMessaging'
</script>

<template>
  <div class="space-y-4 text-sm text-white/85">
    <section class="border border-border rounded-lg p-4 bg-bg/40">
      <h3 class="font-semibold text-white mb-2">On-platform only</h3>
      <p>{{ OFF_PLATFORM_POLICY_SUMMARY }}</p>
    </section>
    <section class="border border-border rounded-lg p-4 bg-bg/40">
      <h3 class="font-semibold text-white mb-2">Messaging rules</h3>
      <p>{{ MESSAGING_POLICY }}</p>
      <ul class="list-disc list-inside mt-2 text-white/75 space-y-1">
        <li>Emails, phone numbers, and payment apps are auto-blocked in messages and listings</li>
        <li>Blocked attempts appear in Message Monitor with violation details</li>
        <li>Buyers reach sellers through checkout and on-site tools — not personal inboxes</li>
      </ul>
    </section>
    <section class="border border-border rounded-lg p-4 bg-bg/40">
      <h3 class="font-semibold text-white mb-2">Hidden profiles</h3>
      <p>{{ PROFILE_PRIVACY_NOTICE }}</p>
      <ul class="list-disc list-inside mt-2 text-white/75 space-y-1">
        <li>Public pages show display name or store name only</li>
        <li>No buyer or seller email on listing, browse, or store pages</li>
        <li>Store contact must use @thefranksstandard.com when configured</li>
      </ul>
    </section>
  </div>
</template>
