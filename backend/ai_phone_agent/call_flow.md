# AI Phone Agent — Call Flow (Backend Only)

This document describes the **backend routing logic** for The Franks Standard phone agent. No telephony provider is wired automatically.

## Flow

1. **Greeting** — `scripts/greeting_script.txt`
2. **Intent detection** — `router.js` classifies: `order_status`, `dispute`, `fraud`, `general_support`
3. **Escalation check** — threats, child safety, legal, or financial advice requests → immediate escalation
4. **Script selection** — intent-specific script or verification script
5. **Logging** — every turn written to `phone_call_logs` with transcript JSON

## Escalation (always)

- Threats or violence
- Child-related content
- Fraud reports requiring human review
- Legal or financial advice requests

## Never

- Provide legal advice
- Provide tax or investment advice
- Promise refunds or dispute outcomes
- Override owner decisions

## Integration note

Wire `handleCallTurn(admin, { utterance, call_sid, caller_number, transcript })` from your telephony webhook when ready. Until then, this module is logic and content only.
