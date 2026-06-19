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
