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
