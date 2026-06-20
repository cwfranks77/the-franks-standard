# Owner Reporting Workflow — The Franks Standard

Backend reference for fraud and law-enforcement reporting. **Nothing in this workflow auto-sends.** Owner tools read `owner/reporting_links.json` for external URLs.

---

## Step-by-step workflow

### 1. Review evidence

- Open the fraud case in the owner safety console.
- Read violation scanner matches, messages, listings, and COA chain-of-custody.
- Export or view the law-enforcement report draft via `GET /api/reports/law-enforcement/:case_id` (owner auth required).
- Preserve timestamps — do not delete source records.

### 2. Confirm violation

- Verify the behavior matches platform policy (counterfeit, scam, threats, CSAM, stolen goods, etc.).
- Document your conclusion in the case notes before external filing.
- If uncertain, escalate internally before filing.

### 3. Open fraud case

- If no case exists, open one via ops `open_fraud_case` with severity and evidence JSON.
- Link related dispute IDs, order IDs, and authenticity report IDs to the case.

### 4. Prepare law enforcement report

- Run `prepare_law_enforcement_report` from the ops safety action.
- This gathers messages, listings, COA chain, disputes, activity logs, device fingerprints, IPs, and lawful contact info.
- Package saves to `law_enforcement_reports` and sets `fraud_cases.law_enforcement_prepared = true`.
- **Do not transmit automatically.**

### 5. Submit to authorities (owner manual action)

Choose all that apply:

| Situation | Where to file |
|-----------|----------------|
| General internet fraud / interstate crime | [FBI IC3](https://www.ic3.gov) |
| Counterfeit currency, goods, payment fraud | [U.S. Secret Service field office](https://www.secretservice.gov/contact/field-offices) nearest offender or shipment |
| Child exploitation / CSAM | [NCMEC CyberTipline](https://report.cybertip.org) — call **911** first if a child is in immediate danger |
| Local theft / local offender | Offender’s local police + your local police via [USA.gov local lookup](https://www.usa.gov/local-governments) |
| FBI general contact | [FBI contact](https://www.fbi.gov/contact-us) |

Attach the prepared JSON export and any screenshots you already stored in the case file.

### 6. Prepare industry alert

- Run `prepare_industry_alert` from ops.
- All personal data is stripped (no phone, email, address, payment, or identity fields).
- Package saves to `industry_alerts` and sets `fraud_cases.industry_alert_prepared = true`.

### 7. Send behavior-only alert to other platforms

- Review the industry alert JSON via `GET /api/reports/industry/:case_id`.
- Manually submit to peer marketplaces using links in `owner/reporting_links.json` (eBay, Etsy, Mercari, Facebook Marketplace, OfferUp, Craigslist).
- Share **behavior patterns and listing indicators only** — never include PII from the law-enforcement package.

### 8. Freeze account

- Apply `freeze_account` via ops if ongoing harm is possible.
- Messaging freeze for harassment; full safety freeze for fraud or CSAM.

### 9. Ban device / IP if necessary

- Use `ban_user` with optional `device_fingerprint` and `ip_address` from the LE report `device_data` / `ip_data` sections.
- Anti-rejoin fingerprinting blocks repeat signups.

### 10. Log final resolution

- Close the fraud case with `close_fraud_case` and resolution metadata.
- Record external report numbers (IC3 complaint ID, police report #, CyberTipline reference) in case notes only.
- Retain COA and order records per Louisiana marketplace facilitator requirements.

---

## API quick reference (owner auth: `x-ops-key` header)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/reports/law-enforcement/:case_id` | Fetch prepared LE report |
| `GET /api/reports/industry/:case_id` | Fetch redacted industry alert |

---

## Reminders

- Louisiana sales tax uses **shipping destination ZIP**, not billing address.
- Law-enforcement packages may include contact info allowed by law; industry alerts must never include PII.
- Owner approval is required before any external transmission.
