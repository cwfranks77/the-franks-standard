import { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.role !== "owner" && req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
}
