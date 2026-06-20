# Safety Principles — The Franks Standard

How we protect buyers, sellers, and the operator on an owner-run multi-vendor marketplace.

---

## Foundation

Safety on TFS is **platform-first commerce**: money, messages, disputes, and evidence stay on-system unless a documented exception applies. Safety is shared—buyers, sellers, and staff each have obligations.

---

## Core Principles

### 1. On-Platform Payments Only

All purchases use TFS checkout (Stripe). Off-platform payment requests are a critical violation—buyers lose protection; sellers expose themselves to fraud and bans.

### 2. Do Not Confront Scammers

Buyers and sellers should not threaten, dox, or meet bad actors to "settle" disputes. Use **Report**, **Open dispute**, and support escalation.

### 3. Privacy Minimization

Share only what's needed to complete a sale. Messages are monitored for risk signals; do not send passwords, full SSN, or unrelated financial accounts.

### 4. Device & Session Hygiene

Unusual login locations, shared accounts, and velocity spikes feed security monitoring. Sellers with team access should use individual accounts where possible.

### 5. Fraud Escalation Path

Automated signals flag cases; **owner review** resolves high-severity fraud. Law enforcement packages are prepared manually—never auto-transmitted.

### 6. Dispute Safety

Disputes are evidence-based. Harassment in dispute threads violates policy. Outcomes follow published rules—not chat pressure.

### 7. PII Handling

Export and owner tools access sensitive data under audit logging. API keys and owner endpoints require strongest authentication available.

### 8. AI Boundaries

AI chat and phone agents answer FAQs and intake—they do not promise refunds, legal outcomes, or policy overrides. Escalation prompts route to humans for edge cases.

### 9. Lockdown & Emergency Controls

Owner may force logout, freeze accounts, ban IPs/devices, and run lockdown checks during active incidents. These are safety valves, not daily tools.

### 10. Physical Safety

TFS does not supervise in-person handoffs. If local pickup is ever supported, users meet in public places and treat cash/off-platform requests as violations.

---

## Buyer Safety Summary

| Do | Don't |
|----|-------|
| Pay through checkout | Send Venmo/Zelle/wire to "save fees" |
| Save order confirmations | Trust "email me your card" |
| Attach evidence to disputes | Publicly accuse without reporting |
| Report off-platform asks | Confront suspected scammers |

---

## Seller Safety Summary

| Do | Don't |
|----|-------|
| Ship with tracking | Share personal banking for "direct deposit" |
| Document condition in listings | Pressure buyers off-platform |
| Respond to disputes on time | Retaliate in messages or reviews |
| Use Stripe Connect as provided | Store buyer card data yourself |

---

## Operator Safety

- Audit exports for financial and security events
- Manual fraud and dispute review for severe cases
- Post-launch monitoring cron and alert endpoints
- No silent policy changes on tax or fee handling—document and communicate

---

## Louisiana Tax Safety (Compliance)

Calculating sales tax from **billing address** instead of **shipping ZIP** exposes the business and sellers to facilitator non-compliance. Checkout must use shipping destination for tax determination.

---

## B&C Lane

Competition-audio communities historically use informal sales channels. B&C marketing promotes **same safety principles** as TFS—lower fees never mean weaker payment rules.

---

## Incident Response (High Level)

1. Detect (automated + user reports)
2. Contain (freeze, lockdown, message blocks)
3. Review (owner fraud/dispute tools)
4. Resolve (refund, ban, restore)
5. Log (audit, violations, optional LE package)

Details: `docs/security.md`, `docs/fraud_systems.md`.
