import mongoose from "mongoose";

const FeatureFlagSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  description: String,
  enabled: { type: Boolean, default: false },
  rolloutPercent: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.FeatureFlag || mongoose.model("FeatureFlag", FeatureFlagSchema);
