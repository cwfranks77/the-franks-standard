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
