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
