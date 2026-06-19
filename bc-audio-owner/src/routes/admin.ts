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
