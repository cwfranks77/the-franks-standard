#!/usr/bin/env bash
set -euo pipefail

# create_bc_audio_owner_tools.sh
# Purpose: create a self-contained bc-audio-owner folder in repo root with owner/admin tools.
# Usage:
#   chmod +x create_bc_audio_owner_tools.sh
#   ./create_bc_audio_owner_tools.sh
#
# Optional environment variables:
#   AUTO_COMMIT=true    -> create a git branch and commit the new files
#   GIT_BRANCH=bc-audio-owner-setup
#
# The script will:
#  - create bc-audio-owner/ with models, routes, jobs, utils, UI placeholders, docs
#  - create .env.example inside bc-audio-owner/
#  - optionally create a git branch and commit the new files

ROOT="$(pwd)"
TARGET_DIR="$ROOT/bc-audio-owner"
AUTO_COMMIT="${AUTO_COMMIT:-false}"
GIT_BRANCH="${GIT_BRANCH:-bc-audio-owner-setup-$(date +%Y%m%d%H%M%S)}"

echo "Creating BC Audio Owner Tools in: $TARGET_DIR"
mkdir -p "$TARGET_DIR"

# Create directories
mkdir -p "$TARGET_DIR/src/models"
mkdir -p "$TARGET_DIR/src/routes"
mkdir -p "$TARGET_DIR/src/jobs"
mkdir -p "$TARGET_DIR/src/utils"
mkdir -p "$TARGET_DIR/src/ui"
mkdir -p "$TARGET_DIR/docs"
mkdir -p "$TARGET_DIR/scripts"
mkdir -p "$TARGET_DIR/tests"

# 1) Models
if [ ! -f "$TARGET_DIR/src/models/Theme.ts" ]; then
cat > "$TARGET_DIR/src/models/Theme.ts" <<'TS'
import mongoose from "mongoose";

const ThemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  settings: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  active: { type: Boolean, default: false }
});

export default mongoose.models.Theme || mongoose.model("Theme", ThemeSchema);
TS
fi

if [ ! -f "$TARGET_DIR/src/models/Activity.ts" ]; then
cat > "$TARGET_DIR/src/models/Activity.ts" <<'TS'
import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ip: String,
  path: String,
  method: String,
  payload: mongoose.Schema.Types.Mixed,
  userAgent: String,
  createdAt: { type: Date, default: Date.now }
});

ActivitySchema.index({ createdAt: -1 });

export default mongoose.models.Activity || mongoose.model("Activity", ActivitySchema);
TS
fi

if [ ! -f "$TARGET_DIR/src/models/AuditLog.ts" ]; then
cat > "$TARGET_DIR/src/models/AuditLog.ts" <<'TS'
import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
  actorType: String,
  actorId: String,
  action: { type: String, required: true },
  targetType: String,
  targetId: String,
  details: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

AuditLogSchema.index({ createdAt: -1 });

export default mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
TS
fi

if [ ! -f "$TARGET_DIR/src/models/FeatureFlag.ts" ]; then
cat > "$TARGET_DIR/src/models/FeatureFlag.ts" <<'TS'
import mongoose from "mongoose";

const FeatureFlagSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  description: String,
  enabled: { type: Boolean, default: false },
  rolloutPercent: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.FeatureFlag || mongoose.model("FeatureFlag", FeatureFlagSchema);
TS
fi

# 2) Utils: activity recorder, requireAdmin, audit logger, email placeholder
if [ ! -f "$TARGET_DIR/src/utils/activityRecorder.ts" ]; then
cat > "$TARGET_DIR/src/utils/activityRecorder.ts" <<'TS'
import Activity from "../models/Activity";

/**
 * Express middleware to record activity for every request.
 */
export async function recordActivity(req: any, res: any, next: any) {
  try {
    const payload = {
      userId: req.user?.id || null,
      ip: req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress,
      path: req.originalUrl || req.url,
      method: req.method,
      payload: req.body,
      userAgent: req.headers["user-agent"]
    };
    Activity.create(payload).catch(e => console.error("Activity log failed", e));
  } catch (e) {
    console.error("Activity middleware error", e);
  } finally {
    next();
  }
}
TS
fi

if [ ! -f "$TARGET_DIR/src/utils/requireAdmin.ts" ]; then
cat > "$TARGET_DIR/src/utils/requireAdmin.ts" <<'TS'
import { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.role !== "owner" && req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
}
TS
fi

if [ ! -f "$TARGET_DIR/src/utils/audit.ts" ]; then
cat > "$TARGET_DIR/src/utils/audit.ts" <<'TS'
import AuditLog from "../models/AuditLog";

export async function logAudit(actorType: string, actorId: string | null, action: string, targetType: string | null, targetId: string | null, details: any = {}) {
  try {
    await AuditLog.create({ actorType, actorId, action, targetType, targetId, details });
  } catch (err) {
    console.error("Audit log failed", err);
  }
}
TS
fi

if [ ! -f "$TARGET_DIR/src/utils/emailSender.ts" ]; then
cat > "$TARGET_DIR/src/utils/emailSender.ts" <<'TS'
/**
 * Placeholder email sender. Replace with real provider integration.
 */
export async function sendEmail(to: string, subject: string, body: string) {
  console.log("Sending email", { to, subject });
  // TODO: integrate with SendGrid, SES, Postmark, etc.
}
TS
fi

# 3) API routes: theme, flags, activity, admin/refund
if [ ! -f "$TARGET_DIR/src/routes/theme.ts" ]; then
cat > "$TARGET_DIR/src/routes/theme.ts" <<'TS'
import { Router } from "express";
import Theme from "../models/Theme";
import { requireAdmin } from "../utils/requireAdmin";

const router = Router();

router.post("/save", requireAdmin, async (req, res) => {
  const { name, slug, settings, active } = req.body;
  let theme = await Theme.findOne({ slug });
  if (theme) {
    theme.settings = settings;
    theme.name = name;
    theme.updatedAt = new Date();
    theme.active = !!active;
    await theme.save();
  } else {
    theme = await Theme.create({ name, slug, settings, active: !!active, createdBy: req.user._id });
  }
  if (active) {
    await Theme.updateMany({ _id: { $ne: theme._id } }, { active: false });
  }
  res.json({ success: true, theme });
});

router.get("/active", async (req, res) => {
  const theme = await Theme.findOne({ active: true });
  res.json({ theme });
});

router.get("/", requireAdmin, async (req, res) => {
  const themes = await Theme.find().sort({ createdAt: -1 });
  res.json({ themes });
});

export default router;
TS
fi

if [ ! -f "$TARGET_DIR/src/routes/flags.ts" ]; then
cat > "$TARGET_DIR/src/routes/flags.ts" <<'TS'
import { Router } from "express";
import FeatureFlag from "../models/FeatureFlag";
import { requireAdmin } from "../utils/requireAdmin";

const router = Router();

router.get("/", requireAdmin, async (req, res) => {
  const flags = await FeatureFlag.find();
  res.json({ flags });
});

router.post("/set", requireAdmin, async (req, res) => {
  const { key, enabled, rolloutPercent } = req.body;
  let f = await FeatureFlag.findOne({ key });
  if (!f) f = await FeatureFlag.create({ key, enabled: !!enabled, rolloutPercent: rolloutPercent || 100 });
  else { f.enabled = !!enabled; f.rolloutPercent = rolloutPercent || 100; await f.save(); }
  res.json({ success: true, flag: f });
});

export default router;
TS
fi

if [ ! -f "$TARGET_DIR/src/routes/activity.ts" ]; then
cat > "$TARGET_DIR/src/routes/activity.ts" <<'TS'
import { Router } from "express";
import Activity from "../models/Activity";
import AuditLog from "../models/AuditLog";
import { requireAdmin } from "../utils/requireAdmin";

const router = Router();

router.get("/recent", requireAdmin, async (req, res) => {
  const items = await Activity.find().sort({ createdAt: -1 }).limit(200);
  res.json({ items });
});

router.get("/audit", requireAdmin, async (req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(500);
  res.json({ logs });
});

export default router;
TS
fi

if [ ! -f "$TARGET_DIR/src/routes/admin.ts" ]; then
cat > "$TARGET_DIR/src/routes/admin.ts" <<'TS'
import { Router } from "express";
import { requireAdmin } from "../utils/requireAdmin";
import AuditLog from "../models/AuditLog";
import Order from "../../server/models/Order"; // adjust path if needed
import Stripe from "stripe";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-11-15" });

router.post("/refund", requireAdmin, async (req, res) => {
  const { orderId, reason } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ error: "Order not found" });

  await AuditLog.create({ actorType: "admin", actorId: req.user._id.toString(), action: "refund_initiated", targetType: "order", targetId: orderId, details: { reason } });

  try {
    if (process.env.STRIPE_SECRET_KEY && order.paymentIntentId) {
      const refund = await stripe.refunds.create({ payment_intent: order.paymentIntentId, metadata: { orderId } });
      order.status = "cancelled";
      await order.save();
      await AuditLog.create({ actorType: "system", action: "refund_completed", targetType: "order", targetId: orderId, details: { refund } });
      return res.json({ success: true, refund });
    } else {
      order.status = "cancelled";
      await order.save();
      await AuditLog.create({ actorType: "system", action: "refund_marked_manual", targetType: "order", targetId: orderId, details: { reason } });
      return res.json({ success: true, message: "Refund marked; manual processing required" });
    }
  } catch (err: any) {
    console.error("Refund error", err);
    await AuditLog.create({ actorType: "system", action: "refund_failed", targetType: "order", targetId: orderId, details: { error: err.message } });
    return res.status(500).json({ error: "Refund failed", details: err.message });
  }
});

export default router;
TS
fi

# 4) Jobs: backup and cleanup
if [ ! -f "$TARGET_DIR/src/jobs/backupDb.ts" ]; then
cat > "$TARGET_DIR/src/jobs/backupDb.ts" <<'TS'
import { exec } from "child_process";
import util from "util";
const run = util.promisify(exec);

export async function backupDb() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI not set");
    const filename = `backups/mongo-backup-${Date.now()}.gz`;
    await run(`mkdir -p backups && mongodump --uri="${uri}" --archive=${filename} --gzip`);
    console.log("Backup created:", filename);
  } catch (err) {
    console.error("Backup failed", err);
  }
}
TS
fi

if [ ! -f "$TARGET_DIR/src/jobs/cleanupActivity.ts" ]; then
cat > "$TARGET_DIR/src/jobs/cleanupActivity.ts" <<'TS'
import Activity from "../models/Activity";

export async function cleanupActivity(retentionDays = 90) {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  await Activity.deleteMany({ createdAt: { $lt: cutoff } });
  console.log("Old activity cleaned up before", cutoff);
}
TS
fi

# 5) UI placeholders (Vue single-file components)
if [ ! -f "$TARGET_DIR/src/ui/ThemeEditor.vue" ]; then
cat > "$TARGET_DIR/src/ui/ThemeEditor.vue" <<'VUE'
<template>
  <div class="theme-editor">
    <h2>Theme Editor</h2>
    <label>Name <input v-model="theme.name" /></label>
    <label>Slug <input v-model="theme.slug" /></label>
    <label>Primary Color <input v-model="theme.settings.primaryColor" type="color" /></label>
    <label>Accent Color <input v-model="theme.settings.accentColor" type="color" /></label>
    <button @click="save">Save Theme</button>
    <button @click="activate">Activate</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const theme = ref({ name: '', slug: '', settings: { primaryColor: '#000000', accentColor: '#ff0000' } });

async function save() {
  await fetch('/api/owner/theme/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(theme.value) });
  alert('Saved');
}
async function activate() {
  await fetch('/api/owner/theme/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...theme.value, active: true }) });
  alert('Activated');
}
</script>
VUE
fi

if [ ! -f "$TARGET_DIR/src/ui/ActivityViewer.vue" ]; then
cat > "$TARGET_DIR/src/ui/ActivityViewer.vue" <<'VUE'
<template>
  <div>
    <h2>Recent Activity</h2>
    <ul>
      <li v-for="a in activities" :key="a._id">{{ a.createdAt }} - {{ a.userId }} - {{ a.path }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const activities = ref([]);
onMounted(async () => {
  const res = await fetch('/api/owner/activity/recent');
  const data = await res.json();
  activities.value = data.items || [];
});
</script>
VUE
fi

# 6) Scripts: job runner and README
if [ ! -f "$TARGET_DIR/scripts/run_owner_jobs.sh" ]; then
cat > "$TARGET_DIR/scripts/run_owner_jobs.sh" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
node -e "require('../bc-audio-owner/src/jobs/backupDb').backupDb().catch(e=>console.error(e)); require('../bc-audio-owner/src/jobs/cleanupActivity').cleanupActivity(90).catch(e=>console.error(e));"
SH
chmod +x "$TARGET_DIR/scripts/run_owner_jobs.sh"
fi

if [ ! -f "$TARGET_DIR/docs/README.md" ]; then
cat > "$TARGET_DIR/docs/README.md" <<'MD'
# BC Audio Owner Tools

This folder contains owner/admin tools:
- Theme editor (themes stored in DB)
- Activity recorder and audit logs
- Refund processing endpoint (Stripe integration placeholder)
- Feature flags and admin actions
- Background jobs: backups and activity cleanup

Environment variables:
- MONGO_URI
- JWT_SECRET
- STRIPE_SECRET_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- APP_URL
- AUTO_REFUND_ENABLED
- AUTO_REFUND_MAX_AMOUNT

Run background jobs via bc-audio-owner/scripts/run_owner_jobs.sh (cron).

**Note:** The live B&C website runs on Nuxt 3 + Supabase. Operational owner tools are wired in `bc-performance-audio/`. This folder is a reference scaffold for Express/Mongo integrations.
MD
fi

# 7) .env.example
if [ ! -f "$TARGET_DIR/.env.example" ]; then
cat > "$TARGET_DIR/.env.example" <<'ENV'
# BC Audio Owner Tools .env example
MONGO_URI=
JWT_SECRET=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
APP_URL=
AUTO_REFUND_ENABLED=true
AUTO_REFUND_MAX_AMOUNT=200
ENV
fi

# 8) Basic test placeholder
if [ ! -f "$TARGET_DIR/tests/smoke.test.js" ]; then
cat > "$TARGET_DIR/tests/smoke.test.js" <<'JS'
test("owner tools smoke", () => {
  expect(true).toBe(true);
});
JS
fi

echo "All files created under $TARGET_DIR"

# 9) Optional git commit
if [ "$AUTO_COMMIT" = "true" ]; then
  if git rev-parse --git-dir >/dev/null 2>&1; then
    echo "Creating git branch: $GIT_BRANCH and committing new files"
    git checkout -b "$GIT_BRANCH"
    git add "$(realpath --relative-to="$ROOT" "$TARGET_DIR")"
    git commit -m "Add bc-audio-owner owner tools scaffold"
    echo "Committed to branch $GIT_BRANCH"
  else
    echo "Not a git repo; skipping commit"
  fi
else
  echo "AUTO_COMMIT not enabled; skipping git commit. To auto-commit set AUTO_COMMIT=true and re-run."
fi

echo
echo "NEXT STEPS:"
echo "1) Inspect files in $TARGET_DIR and adapt import paths to your project structure."
echo "2) Copy or mount routes into your main server (or import bc-audio-owner routes)."
echo "3) Install dependencies if needed: npm install mongoose stripe"
echo "4) Set environment variables from $TARGET_DIR/.env.example"
echo "5) Start your server and integrate owner UI into your app routing or open the Vue components in your admin area."
echo "6) Replace email and payment placeholders with your providers and test refunds in sandbox mode."
echo
echo "If you want, I can now generate a git patch that stages these changes on a new branch and opens a commit message for you. To enable that automatically, re-run with AUTO_COMMIT=true."
exit 0
