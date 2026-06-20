# Fraud Alert Email Sequence

**Trigger:** Fraud case opened or severe violation (ops/system)  
**Do not auto-send until owner enables. Legal review recommended.**

---

## Email 1 — Account restricted

**Subject:** Important: activity on your The Franks Standard account  
**Preview:** Account restricted pending review.

**Body:**  
We detected activity that violates marketplace policies. Your account may be frozen or messaging-disabled.

If you believe this is an error, reply with verifiable information — do not create a new account (anti-rejoin applies).

**CTA:** Contact support → info@thefranksstandard.com

**Timing:** Immediate on freeze/major violation

---

## Email 2 — Fraud case opened (internal copy template)

**Subject:** [INTERNAL] Fraud case #[CASE_ID]  
**Preview:** Evidence package assembling.

**Body (owner/ops):**  
Case opened. Review violation_events, messages, orders, COA logs. Prepare LE draft if warranted — **do not auto-send**.

**CTA:** Owner console → /owner

**Timing:** Immediate (ops only)

---

## Email 3 — Permanent ban notice

**Subject:** Marketplace access ended  
**Preview:** Permanent ban applied per policy.

**Body:**  
After review, your access to The Franks Standard has been permanently ended for policy violations.

Banned identifiers may include device and network fingerprints per our anti-rejoin system.

**CTA:** None (ban notice)

**Timing:** On platform_banned_at set
