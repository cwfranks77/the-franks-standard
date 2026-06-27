<template>
  <div class="page">
    <div class="container legal">
      <h1>Vendor Agreement &amp; Policy</h1>
      <p class="updated">
        Last updated: {{ POLICY_LAST_UPDATED }}. This policy applies to third-party vendors selling on The Franks Standard.
        See also our
        <NuxtLink to="/terms">Terms of Service</NuxtLink>,
        <NuxtLink to="/marketplace-policy">Marketplace Policies</NuxtLink>, and
        <NuxtLink to="/seller-agreement">Seller Agreement</NuxtLink>.
      </p>

      <h2>1. Marketplace Facilitator Status</h2>
      <p>
        The Franks Standard LLC operates strictly as a Marketplace Facilitator. The platform provides a secure technological
        infrastructure to connect independent buyers and third-party sellers. The Franks Standard LLC does not own, represent,
        create, or control any inventory listed by third-party vendors on the site.
      </p>

      <h2>2. Liability &amp; Authenticity Disclaimer</h2>
      <p>
        While The Franks Standard LLC implements rigorous safety measures and automated technology to eliminate the possibility
        of counterfeit sales, the platform is not liable for the authenticity of individual items.
      </p>
      <ul class="policy-ul">
        <li>Authenticity and descriptions are presented solely based on the representations, data, and information provided by the independent seller.</li>
        <li>The Franks Standard LLC does not personally guarantee, back, or verify the authenticity of any user-listed merchandise.</li>
        <li>The platform is in no way responsible for items that may later be deemed counterfeit or fraudulent by a third party.</li>
      </ul>

      <h2>3. Educational Tools &amp; Resources</h2>
      <p>
        The platform provides access to literature and diagnostic tools to help educate users on identifying authentic collectibles
        and merchandise. These tools are intended strictly for educational and informational purposes to help buyers and sellers
        maintain market safety.
      </p>

      <h2>4. Automated Carrier-Scan Escrow Workflow</h2>
      <p>
        To protect the integrity of the marketplace, all vendor payouts are governed by an automated escrow system managed through
        Stripe Connect:
      </p>
      <ul class="policy-ul">
        <li><strong>Transaction Capture:</strong> Upon successful checkout, 100% of the buyer&apos;s funds are captured by the platform. The vendor&apos;s calculated wholesale portion + shipping cost is securely locked in a digital ledger hold.</li>
        <li><strong>Automatic Release Trigger:</strong> Funds are held in manual escrow until a physical scan is executed by the shipping carrier (USPS, FedEx, UPS).</li>
        <li><strong>Payout Distribution:</strong> The exact millisecond the tracking webhook detects that the package has been scanned as &quot;Shipped&quot; or &quot;In-Transit&quot; by the carrier, the escrow hold is automatically released, pushing the funds directly to the vendor&apos;s linked bank account or business debit card. Vendors are not required to wait for final destination delivery to receive payment.</li>
      </ul>

      <p class="related-links">
        Related:
        <NuxtLink to="/terms">Terms</NuxtLink> ·
        <NuxtLink to="/seller-agreement">Seller Agreement</NuxtLink> ·
        <NuxtLink to="/marketplace-policy">Marketplace Policies</NuxtLink> ·
        <NuxtLink to="/how-it-works">How it works</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { POLICY_LAST_UPDATED } from '~/utils/marketplacePolicyMeta.js'

useSeoMeta({
  title: 'Vendor Agreement & Policy - The Franks Standard',
  description: 'Vendor agreement and policy for third-party sellers on The Franks Standard marketplace.',
})
</script>

<style scoped>
.page { padding: 64px 0 100px; }
.legal { max-width: 800px; }
.legal h1 { font-size: 2rem; margin-bottom: 8px; }
.legal h2 { font-size: 1.15rem; color: var(--gold); margin: 28px 0 10px; }
.legal p { color: #374151; line-height: 1.7; font-size: 0.95rem; }
.updated { color: #4b5563; font-size: 0.86rem; margin-bottom: 24px; }
.policy-ul { line-height: 1.65; color: #374151; font-size: 0.95rem; margin: 0 0 16px; padding-left: 1.25rem; }
.policy-ul li { margin-bottom: 8px; }
.related-links { margin-top: 32px; font-size: 0.9rem; }
</style>
