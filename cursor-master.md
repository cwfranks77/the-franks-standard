# CURSOR MASTER SCRIPT — THE FRANKS STANDARD & B&C PERFORMANCE AUDIO
# ======================================================================
# AUTHOR: Copilot
# PURPOSE: Cursor MUST build off Copilot’s instructions ONLY.
# Cursor MUST NOT invent its own ideas, revisions, or architecture.
# Cursor is a builder, not a designer, not a strategist.
# ======================================================================

# ======================================================================
# SECTION 1 — GLOBAL RULES (ALWAYS APPLY)
# ======================================================================

1. You MUST read and follow THIS FILE before doing ANY work.

2. You MUST execute ONE TASK AT A TIME.
   - When the user says “Execute TASK X”, you ONLY do that task.
   - You MUST NOT touch any other task.
   - You MUST NOT scan or modify unrelated files.

3. You MUST create a FULL BACKUP BEFORE ANY WORK:
   - Create a new branch named: `backup-before-master-script`.
   - Copy ALL current project files into that branch.
   - Commit with message: “Full full backup before executing cursor-master tasks.”

4. You MUST save THIS SCRIPT before doing any work:
   - Save this file exactly as-is in the repo root as `cursor-master.md`.
   - Commit with message: “Add cursor-master script (Copilot).”

5. You MUST save a FINAL BACKUP AFTER ALL TASKS ARE COMPLETE:
   - Create a branch named: `final-build-complete`.
   - Commit all final files.
   - Do NOT delete the backup branch.

6. You MUST NOT modify:
   - Stripe backend logic.
   - Supabase auth logic.
   - Database schema (unless a task explicitly requires it).
   - Tax logic.
   - Marketplace facilitator logic.
   - Payout logic.
   - Routing logic.
   - API endpoints (unless a task explicitly requires it).
   - Environment variables.
   - Nuxt config (unless a task explicitly requires it).
   - Hosting configuration.
   - Domain configuration.
   - PWA configuration (unless asked).
   - COA core logic (serials, binding, verification) unless explicitly asked.
   - Seller verification logic.
   - Buyer protection logic.
   - Dispute resolution logic.
   - Audio store inventory logic.
   - Dropship logic.
   - Stripe Connect logic.
   - Tax bucket distribution logic.
   - Owner access logic.
   - Admin permissions.
   - Routing guards.
   - Supabase RLS policies.
   - Database triggers/functions.

7. You MUST NOT “freestyle” or invent your own design or architecture.
   - You MUST build off Copilot’s instructions ONLY.
   - If something is unclear, you MUST ask the user.

8. You MUST NOT replace entire pages unless Copilot has provided a new version or the user explicitly approves.

9. You MUST NOT remove existing working features.
   - You may enhance, refine, or extend them ONLY when Copilot has defined the improvement.

10. You MUST NOT remove any existing pages unless the user explicitly approves.

11. You MUST NOT attempt to execute multiple tasks at once.

12. You MUST NOT hallucinate missing files or invent code.
   - If a file referenced by Copilot does not exist, you MUST create it exactly as described.

13. You MUST NOT restore old versions of files unless the user asks.

14. You MUST NOT modify Stripe keys, Supabase keys, or environment variables.

15. You MUST NOT modify build system or deployment configuration.

16. You MUST NOT modify tax distribution or facilitator logic unless explicitly asked.

17. You MUST NOT modify COA database structure unless explicitly asked.

18. You MUST NOT modify seller onboarding logic unless explicitly asked.

19. You MUST NOT modify buyer checkout logic unless explicitly asked.

20. You MUST NOT modify Supabase schema or Stripe webhooks unless a task explicitly requires it and the user confirms.

# ======================================================================
# SECTION 2 — BUILD-OFF-COPILOT RULES
# ======================================================================

21. You MUST treat Copilot’s code and structure as the source of truth for improvements.

22. You MUST NOT redesign or restructure pages beyond what Copilot has defined.

23. You MUST NOT change Copilot’s layout or component hierarchy unless a task explicitly says to refine it.

24. You MUST NOT add new sections, features, or tools that Copilot has not described.

25. You MUST NOT change Copilot’s wording in legal/trust sections unless asked.

26. You MUST NOT change Copilot’s open-door policy messaging unless asked.

27. You MUST NOT change Copilot’s owner console structure unless a task explicitly says to enhance it.

28. If a feature already exists in the project:
    - You MUST leave it alone unless Copilot has provided an improved version.
    - If Copilot has provided an improved version, you MUST replace or extend the existing feature with Copilot’s version.

29. If Copilot has provided a new file (example: `layouts/default.vue`, `pages/index.vue`, `pages/legal.vue`, `pages/owner.vue`):
    - You MUST create or update that file exactly as Copilot wrote it.
    - You MUST NOT alter the structure beyond minor styling refinements unless a task explicitly says so.

30. You MUST treat Copilot’s previous code (homepage, layout, legal page, owner console) as the baseline for improvements.

# ======================================================================
# SECTION 3 — BACKUP & SAFETY RULES
# ======================================================================

31. BEFORE executing ANY TASK:
    - You MUST:
      - Create branch `backup-before-master-script`.
      - Commit the current state of the project.
      - Save `cursor-master.md` in the repo root.

32. AFTER ALL TASKS ARE COMPLETE:
    - You MUST:
      - Create branch `final-build-complete`.
      - Commit the final state of the project.
      - Ensure `cursor-master.md` is unchanged and present.

33. If at any point a change risks breaking the site:
    - You MUST STOP.
    - You MUST revert the change.
    - You MUST inform the user.

34. If a task requires backend changes (database, API, Stripe, Supabase):
    - You MUST ask the user for explicit permission before proceeding.

# ======================================================================
# SECTION 4 — “WIRE IT WHEN POSSIBLE” RULE
# ======================================================================

35. If a feature requires real traffic or real sales to show meaningful data:
    - You MUST still build:
      - The UI.
      - The tracking hooks.
      - The database tables (ONLY when a task explicitly says so).
      - The endpoints (ONLY when a task explicitly says so).
    - The data will populate later when real activity happens.

36. You MUST NOT fake data in production.
    - You may use mock data in development-only contexts if clearly marked.

# ======================================================================
# SECTION 5 — FILES TO BUILD FROM COPILOT’S LEADERSHIP
# ======================================================================

You MUST treat the following files as primary improvement targets:

- `layouts/default.vue`
- `pages/index.vue`
- `pages/legal.vue`
- `pages/owner.vue`

If these files do not exist:
- You MUST create them exactly as Copilot defined.
- You MUST NOT alter their structure beyond minor styling refinements unless a task explicitly says so.

# ======================================================================
# SECTION 6 — TASK LIST (EXECUTE ONE AT A TIME)
# ======================================================================

TASK 1 — Install Copilot’s Layout & Homepage  
TASK 2 — Install Copilot’s Legal Page  
TASK 3 — Install Copilot’s Owner Console  
TASK 4 — Improve Global Theme & Layout  
TASK 5 — Improve Homepage Visual Polish  
TASK 6 — Improve Seller Onboarding UI  
TASK 7 — Improve Buyer Experience UI  
TASK 8 — Improve COA Pages  
TASK 9 — Improve Trust & Anti-Counterfeit Messaging  
TASK 10 — Improve Open-Door Policy Messaging  
TASK 11 — Enhance Owner Console UI  
TASK 12 — Add Owner Messaging System (UI Only)  
TASK 13 — Add Owner Announcement Controls (UI Only)  
TASK 14 — Add Theme Switching Engine  
TASK 15 — Add Traffic Tracking Hooks  
TASK 16 — Add Sales Tracking Hooks  
TASK 17 — Add Analytics Dashboard UI  
TASK 18 — Add System Health Dashboard UI  
TASK 19 — Add Error Log Dashboard UI  
TASK 20 — Add CSV Export Engine (ONLY IF USER CONFIRMS)  
TASK 21 — Add Seller Performance Dashboard UI  
TASK 22 — Add Buyer Activity Dashboard UI  
TASK 23 — Add COA Dispute Dashboard UI  
TASK 24 — Add Future Owner Tools Section  
TASK 25 — Final UI Polish Pass  
TASK 26 — Save Final Build  

# ======================================================================
# END OF CURSOR MASTER SCRIPT
# ======================================================================
