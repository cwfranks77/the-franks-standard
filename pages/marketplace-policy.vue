<template>
  <div class="page">
    <div class="container legal">
      <h1>Marketplace Policies &amp; Enforcement Standards</h1>
      <p class="updated">
        Last updated: {{ POLICY_LAST_UPDATED }}. These policies are part of the operating framework for The Franks Standard
        (the &quot;Platform&quot;). They supplement the
        <NuxtLink to="/terms">Terms of Service</NuxtLink> and, for sellers, the
        <NuxtLink to="/seller-agreement">Seller Agreement</NuxtLink>.
        Continued use after updates constitutes acceptance of the current version.
      </p>

      <div class="policy-notice" role="note">
        <p>
          <strong>Not legal advice.</strong> Have a qualified attorney review these policies before relying on them in
          litigation, advertising, or investor materials. The Platform operator is the business entity (LLC), not any
          individual founder personally.
        </p>
        <p class="mt-1">
          <strong>Attorney review (May 29, 2026 draft):</strong> Print this document and linked Terms / Seller Agreement for counsel.
          When you receive stamped final copies, send them to the team to replace this version on the site.
        </p>
      </div>

      <h2>1. Document hierarchy</h2>
      <p>If documents conflict, interpret them in this order (highest authority first):</p>
      <ol class="policy-ol">
        <li v-for="doc in POLICY_HIERARCHY" :key="doc.path">
          <NuxtLink :to="doc.path">{{ doc.label }}</NuxtLink> — {{ doc.role }}
        </li>
      </ol>

      <h2>2. Definitions</h2>
      <ul class="policy-ul">
        <li><strong>Platform</strong> — The Franks Standard website, apps, and related services operated by the business entity.</li>
        <li><strong>Escrow (hold-and-release)</strong> — Buyer payment collected via Stripe and held until delivery confirmation or other release conditions in these policies.</li>
        <li><strong>COA</strong> — Certificate of Authenticity, including third-party uploads and Franks-issued serials (format <code>FS-YYYY-NNNNNN</code>) bound to a single listing &quot;floor office.&quot;</li>
        <li><strong>Seller Written Guarantee</strong> — The seller&apos;s authenticity attestation text on a Franks Standard COA, digitally attached in the registry to one serial and listing snapshot at issue — a <em>seller</em> representation, not a Platform warranty.</li>
        <li><strong>Floor office</strong> — The unique listing slot to which a Franks COA serial and item fingerprint (photos + description at issue) are locked.</li>
        <li><strong>Seller at fault</strong> — A determination that the seller, not the buyer, caused the loss (see Section 6).</li>
        <li><strong>Platform debt</strong> — Amount the seller owes the Platform after the Platform refunds a buyer when the seller refused or failed to honor a valid refund obligation.</li>
        <li><strong>Account freeze</strong> — Suspension of substantially all account capabilities pending debt repayment (Section 8).</li>
        <li><strong>Protection Program / reserve</strong> — A discretionary program, funded over time from Platform fees, that may be used when escrow and seller balances are insufficient. It is <em>not</em> unlimited insurance.</li>
      </ul>

      <h2>3. Seller digital policy acceptance (required before selling)</h2>
      <p>
        Before any selling activity — including occasional listings, store inventory, dropship automation, CSV/eBay import,
        or auction listings — you must complete a <strong>one-time digital signature</strong> for the current policy version:
      </p>
      <ul class="policy-ul">
        <li><NuxtLink to="/terms">Terms of Service</NuxtLink></li>
        <li>This Marketplace Policies document</li>
        <li><NuxtLink to="/seller-agreement">Seller Agreement</NuxtLink></li>
        <li><NuxtLink to="/prohibited-items">Prohibited Items</NuxtLink></li>
        <li><NuxtLink to="/privacy">Privacy Policy</NuxtLink></li>
      </ul>
      <p>
        You enter your <strong>full legal name</strong> and confirm agreement on the Sell page (or Import / Dropship setup).
        Acceptance is stored on your profile and in an audit log. When policies change materially, you must re-sign the new version
        before listing again. Attempts to publish without acceptance are blocked in the app and database.
      </p>

      <h2>4. Authenticity, COA, and listing integrity</h2>
      <h3>4.1 Seller obligations (collectible categories)</h3>
      <p>
        Each collectible listing must include <strong>one</strong> of the following before publish:
      </p>
      <ul class="policy-ul">
        <li><strong>Uploaded third-party COA</strong> — readable image or PDF (PSA, PCGS, issuer, etc.) stored with the listing; or</li>
        <li><strong>Franks Standard COA</strong> — platform template with a unique serial and the seller&apos;s <strong>Seller Written Guarantee</strong> digitally attached in the registry to that listing&apos;s photos and description at issue.</li>
      </ul>
      <p>
        Listings must accurately describe the item offered. You may not reuse a Franks serial or certificate issued for one
        floor office on a different item or listing. A retired standalone &quot;sign guarantee without COA&quot; path is not
        permitted for new listings.
      </p>
      <h3>4.1a Franks Standard COA — serial binding and Seller Written Guarantee</h3>
      <p>
        When the Platform issues a COA serial, it is assigned to that listing&apos;s floor office only. Photos and description
        at issue time are frozen into a certificate fingerprint. The seller&apos;s <strong>Seller Written Guarantee</strong>
        (seller&apos;s legally binding authenticity statement) is stored on the certificate record together with the seller&apos;s
        legal name from policy acceptance and listing metadata. Buyers may verify at <code>/verify/coa/[serial]</code>. A mismatch
        between verification and the live listing is grounds for review.
      </p>
      <p class="text-muted small">
        <strong>Disclosure:</strong> The words &quot;guarantee&quot; on a Franks COA refer to the <strong>seller&apos;s</strong>
        written representation on that certificate — not a guarantee, warranty, or expert opinion by The Franks Standard LLC.
        The Platform provides the template, serial registry, verification tools, and policy enforcement. Enforcement when an item
        is proven counterfeit or misrepresented does not mean the Platform vouched for genuineness at sale.
      </p>
      <h3>4.1b Uploaded third-party COA</h3>
      <p>
        When you upload a third-party COA, you represent that it matches the item in your listing photos. The Platform does not
        guarantee the accuracy of third-party grading or issuer documents. Graded claims without a matching upload may be flagged
        for review.
      </p>
      <h3>4.2 Automated integrity screening</h3>
      <p>
        The Platform may scan published listings for risk patterns (e.g., replica language, inconsistent graded claims,
        category-specific signals). Scan results may set <code>integrity_status</code> to <strong>review</strong> without
        admitting wrongdoing. Listings in review may be blocked from checkout until cleared.
      </p>
      <h3>4.3 Buyer and public reports</h3>
      <p>
        Users may report suspected counterfeits or misrepresentation. Reports are reviewed by Platform operations. False or
        abusive reports may result in buyer account restrictions.
      </p>
      <h3>4.4 Enforcement actions (authenticity)</h3>
      <p>The Platform may take one or more of the following actions, case by case:</p>
      <table class="policy-table">
        <thead>
          <tr><th>Action</th><th>Effect</th></tr>
        </thead>
        <tbody>
          <tr><td>Clear listing</td><td>Integrity flags removed; listing may return to normal visibility if otherwise compliant.</td></tr>
          <tr><td>Suspend listing</td><td>Listing archived; integrity marked suspended; removed from browse/checkout.</td></tr>
          <tr><td>Confirm counterfeit / misrepresentation</td><td>Listing archived; integrity marked counterfeit confirmed; COA revoked if applicable; seller may be banned (Section 9).</td></tr>
          <tr><td>Permanent seller ban (authenticity)</td><td><code>seller_banned_at</code> set; seller may not complete new sales; published listings archived.</td></tr>
        </tbody>
      </table>

      <h2>5. Escrow and payouts</h2>
      <ul class="policy-ul">
        <li>Buyers should pay only through Platform Stripe checkout — not off-platform wires, Venmo, or similar.</li>
        <li>After payment, order status reflects funds <strong>held in escrow</strong> until the buyer confirms receipt (or other release rules apply).</li>
        <li>Sellers must ship as described and provide tracking when required. Dropship flows may split supplier and margin transfers per seller tools.</li>
        <li>Escrow release to the seller is blocked while an order or seller account is subject to an escrow freeze (Section 8).</li>
      </ul>

      <h2>6. Returns, refunds, and disputes (overview)</h2>
      <p>
        Refund outcomes depend on <strong>reason</strong> and <strong>fault</strong>. The Platform investigates disputes with
        evidence from both parties. This section summarizes standards; the Platform may apply discretion where facts are
        disputed, consistent with these policies.
      </p>
      <table class="policy-table">
        <thead>
          <tr><th>Situation</th><th>Typical fault</th><th>Refund to buyer</th><th>Shipping / fees</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Proven counterfeit or fake COA</td>
            <td>Seller</td>
            <td>Full item price + applicable tax</td>
            <td>Return shipping at seller&apos;s expense; Platform may advance refund (Section 7)</td>
          </tr>
          <tr>
            <td>Not as described / wrong item</td>
            <td>Seller</td>
            <td>Full item price + applicable tax</td>
            <td>Return shipping at seller&apos;s expense unless otherwise stated in resolution</td>
          </tr>
          <tr>
            <td>Dispute upheld in buyer&apos;s favor</td>
            <td>Seller (usually)</td>
            <td>Per resolution (often full item + tax)</td>
            <td>Per resolution; outbound shipping may be non-refundable to buyer if buyer-fault categories apply</td>
          </tr>
          <tr>
            <td>Changed mind / remorse</td>
            <td>Buyer</td>
            <td>Generally none, or item price only if seller voluntarily accepts return</td>
            <td>Buyer pays return; original outbound shipping typically not refunded</td>
          </tr>
          <tr>
            <td>Buyer abuse or false claim</td>
            <td>Buyer</td>
            <td>Denied</td>
            <td>Seller may be released from escrow; buyer may be restricted</td>
          </tr>
        </tbody>
      </table>
      <p class="text-muted small">
        Partial refunds may be used where appropriate. Sales tax treatment follows payment processor and tax law rules.
      </p>

      <h2>7. Seller refusal to refund (seller at fault)</h2>
      <p>
        When a buyer has a valid refund entitlement under Section 5 and the seller <strong>refuses</strong> or <strong>fails</strong>
        to process a refund within a reasonable time after Platform notice, the Platform may:
      </p>
      <ol class="policy-ol">
        <li>Issue a <strong>forced refund</strong> to the buyer via Stripe (from escrowed funds, transfer reversal, and/or the Protection Program).</li>
        <li>Record the reimbursed amount as <strong>platform debt</strong> owed by the seller.</li>
        <li>Immediately <strong>freeze the seller account</strong> (Section 9).</li>
        <li>Archive active listings and suspend integrity status as needed.</li>
        <li>After debt repayment, permanently <strong>ban</strong> the seller if policy violation severity warrants it (Section 9) — repayment does not guarantee reinstatement.</li>
      </ol>
      <p>
        Seller-at-fault refund reasons implemented in Platform operations include: counterfeit, not as described,
        dispute upheld, and seller failed to refund. Other ops-classified refunds may not trigger automatic freeze.
      </p>

      <h2>8. Funding buyer refunds (escrow, seller balance, reserve)</h2>
      <p>Refunds are sourced in this order where available:</p>
      <ol class="policy-ol">
        <li><strong>Escrowed sale funds</strong> on the same order (before release to seller).</li>
        <li><strong>Stripe reversal</strong> from the seller&apos;s connected balance or destination charge (Connect checkout).</li>
        <li><strong>Protection Program / reserve</strong> — discretionary, limited, not a promise of unlimited coverage.</li>
      </ol>
      <p>
        Marketing on <NuxtLink to="/protection">Protection</NuxtLink> describes goals; binding limits are in these policies and the Terms.
        The founder is not personally guaranteeing refunds.
      </p>

      <h2>9. Account freeze (platform debt recovery)</h2>
      <p>When platform debt is recorded under Section 6, the seller&apos;s account enters <strong>freeze</strong> until debt is paid or waived by the Platform. During freeze, the seller may not:</p>
      <ul class="policy-ul">
        <li>Create, edit, update, or delete listings (including descriptions, photos, price, or status).</li>
        <li>Buy items or place auction bids.</li>
        <li>Complete new sales as a seller (checkout blocked on their listings).</li>
        <li>Mark orders shipped or issue new Franks COAs.</li>
        <li>Receive escrow release or new seller payouts on held orders (orders may be flagged <code>escrow_frozen</code>).</li>
        <li>Use seller tools that circumvent these restrictions.</li>
      </ul>
      <p>
        The seller will see notice of the balance owed and must contact
        <a href="mailto:info@thefranksstandard.com">info@thefranksstandard.com</a> to arrange repayment to the Platform business entity.
      </p>
      <h3>9.1 After repayment</h3>
      <p>
        Operations may mark debt paid and lift the freeze, or mark debt paid and impose a <strong>permanent ban</strong> if the
        underlying violation (e.g., counterfeit) warrants removal regardless of payment. Reinstatement is never automatic.
      </p>

      <h2>10. Permanent bans and account closure</h2>
      <p>
        The Platform may permanently ban sellers for proven counterfeits, repeat misrepresentation, off-platform deal solicitation,
        prohibited items, chargeback abuse, or failure to repay platform debt. Banned sellers may not re-register without written
        Platform consent. The Platform may retain records for fraud prevention and legal compliance.
      </p>

      <h2>11. Chargebacks</h2>
      <p>
        Card network chargebacks are governed by issuer and Stripe rules. Sellers generally bear chargeback liability for
        transactions on their sales when funds were released. The Platform may offset future payouts, apply holds, or use
        reserves. Chargebacks on fraudulent buyer behavior may be contested with evidence.
      </p>

      <h2>12. Off-platform transactions</h2>
      <p>
        Soliciting payment or communication outside the Platform to avoid fees or escrow voids seller protections and may result
        in listing removal, freeze, or ban. The Platform is not responsible for off-platform deals.
      </p>

      <h2>13. Policy changes and notices</h2>
      <p>
        We may update these policies. Material changes will be reflected by the &quot;Last updated&quot; date. For registered users,
        we may provide additional notice (email or in-app banner) when practicable. Prior versions are not maintained on-site unless archived by request.
      </p>

      <h2>14. Contact and appeals</h2>
      <p>
        Policy questions, dispute appeals, and debt repayment arrangements:
        <NuxtLink to="/contact">Contact</NuxtLink> or
        <a href="mailto:info@thefranksstandard.com">info@thefranksstandard.com</a>.
        The Platform will review good-faith appeals but is not obligated to reverse enforcement actions where evidence supports seller fault.
      </p>

      <p class="related-links">
        Related:
        <NuxtLink to="/terms">Terms</NuxtLink> ·
        <NuxtLink to="/seller-agreement">Seller Agreement</NuxtLink> ·
        <NuxtLink to="/protection">Protection overview</NuxtLink> ·
        <NuxtLink to="/how-it-works">How it works</NuxtLink> ·
        <NuxtLink to="/prohibited-items">Prohibited items</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { POLICY_HIERARCHY, POLICY_LAST_UPDATED } from '~/utils/marketplacePolicyMeta.js'

useSeoMeta({
  title: 'Marketplace Policies & Enforcement | The Franks Standard',
  description: 'Platform operating policies: authenticity, escrow, refunds, account freeze, bans, and chargebacks.',
})
</script>

<style scoped>
.page { padding: 64px 0 100px; }
.legal { max-width: 820px; }
.legal h1 { font-size: 2rem; margin-bottom: 8px; }
.legal h2 { font-size: 1.15rem; color: var(--gold); margin: 28px 0 10px; }
.legal h3 { font-size: 1rem; color: #374151; margin: 16px 0 8px; }
.legal p { color: #374151; line-height: 1.7; font-size: 0.95rem; }
.updated { color: #4b5563; font-size: 0.86rem; margin-bottom: 16px; }
.policy-notice {
  padding: 14px 18px;
  margin-bottom: 24px;
  border-left: 4px solid #92400e;
  background: #fffbeb;
  border-radius: 4px;
}
.policy-notice p { margin: 0; font-size: 0.9rem; }
.policy-ol, .policy-ul { line-height: 1.65; color: #374151; font-size: 0.95rem; }
.policy-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
  margin: 12px 0 20px;
}
.policy-table th, .policy-table td {
  border: 1px solid #d1d5db;
  padding: 10px 12px;
  text-align: left;
  vertical-align: top;
}
.policy-table th { background: #f3f4f6; font-weight: 700; }
.related-links { margin-top: 32px; font-size: 0.9rem; }
code { font-size: 0.85em; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
</style>
