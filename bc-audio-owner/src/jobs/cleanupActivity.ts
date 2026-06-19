import Activity from "../models/Activity";

export async function cleanupActivity(retentionDays = 90) {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  await Activity.deleteMany({ createdAt: { $lt: cutoff } });
  console.log("Old activity cleaned up before", cutoff);
}
