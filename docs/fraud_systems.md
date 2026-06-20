# Fraud Systems

How The Franks Standard detects, triages, and resolves fraud and authenticity threats.

---

## Objectives

- Protect buyers from counterfeits and off-platform scams
- Protect honest sellers from chargeback abuse and bad actors
- Escalate severe cases to **owner review**
- Maintain audit trail for disputes and optional law enforcement packages

---

## Intake Channels

| Channel | Examples |
|---------|----------|
| User reports | Report authenticity button, support tickets |
| Disputes | INAD / authenticity claims with evidence |
| Messaging NLP | Off-platform payment language, harassment |
| Automated signals | Device fingerprint, IP velocity, multi-account patterns |
| AI phone/chat | Fraud intake scripts route structured data |

---

## Fraud Case Lifecycle

```
Signal → Triage (auto) → Case opened → Evidence collection
    → Owner manual review → Resolution → Account action + logs
```

Resolutions may include:

- Listing removal
- Order refund (via dispute/stripe)
- Seller/buyer warning
- Account freeze or ban
- IP/device ban (severe)

**Law enforcement:** reports prepared manually; never auto-sent.

---

## Monitored Behaviors

- Counterfeit and misrepresentation claims
- Off-platform payment requests (Venmo, Zelle, wire, F&F)
- COA serial reuse or document hash mismatch
- Suspicious messaging (threats, phishing links)
- Device and IP risk scoring
- Review manipulation rings

---

## COA Integrity

- Upload hashing detects replaced files
- Serial uniqueness enforced at issue
- Order linkage prevents post-hoc certificate swapping without audit

---

## Owner Tools

- `GET owner/status/fraud` — queue depth, recent cases
- `GET owner/logs/fraud` — historical fraud log stream
- `backend/owner/manual_fraud_review.js` — review workflow script
- Financial freeze coordination with payouts

---

## AI Boundaries

AI agents:

- Can explain how to report fraud
- Cannot promise prosecution, refunds, or ban outcomes
- Escalate when user describes active scam or requests LE contact

Phone script: `backend/ai_phone_agent/scripts/fraud_intake_script.txt`

---

## Seller & Buyer Responsibilities

Documented in onboarding—off-platform pay is a critical violation; buyers should not confront scammers.

---

## Metrics (Owner)

Track for post-launch monitor:

- Reports per 1k orders
- Time-to-first owner touch on escalated cases
- Repeat offender account linkage rate
- COA verification failure rate by category

---

## Related

- [disputes.md](disputes.md)
- [security.md](security.md)
- `docs/api/fraud.md`
