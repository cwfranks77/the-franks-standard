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
