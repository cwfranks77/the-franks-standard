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
