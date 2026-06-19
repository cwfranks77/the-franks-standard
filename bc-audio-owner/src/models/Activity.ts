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
