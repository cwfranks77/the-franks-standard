# Dispute Resolution Email Sequence

**Trigger:** Dispute opened or status change  
**Do not auto-send until owner enables.**

---

## Email 1 — Dispute opened (buyer)

**Subject:** Dispute received — case #[ORDER_ID]  
**Preview:** We notified the seller. Here's what happens next.

**Body:**  
Your dispute is logged. The seller can respond with evidence. If unresolved, TFS reviews.

Upload clear photos and messages. Do not ship returns until instructed.

**CTA:** View dispute status → /orders

**Timing:** Immediate on open

---

## Email 2 — Awaiting seller (seller)

**Subject:** Action required — buyer dispute on order #[ORDER_ID]  
**Preview:** Respond with evidence within the policy window.

**Body:**  
A buyer opened a dispute. Review order details and respond factually.

Seller-at-fault refunds may create platform debt and account restrictions.

**CTA:** Respond in dashboard → /sell

**Timing:** Immediate on open (seller)

---

## Email 3 — Resolved (both parties)

**Subject:** Dispute closed — case #[ORDER_ID]  
**Preview:** Ruling recorded. Tell us how we did.

**Body:**  
Your dispute is resolved. Ruling is stored on the case record.

You'll receive a separate follow-up survey (1–5 stars, resolved yes/no/partial). Owner reviews low scores.

**CTA:** Optional — rate support via survey link in follow-up email

**Timing:** On status = resolved (pairs with support_followup_emails)
