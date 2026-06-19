import { exec } from "child_process";
import util from "util";
const run = util.promisify(exec);

export async function backupDb() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI not set");
    const filename = `backups/mongo-backup-${Date.now()}.gz`;
    await run(`mkdir -p backups && mongodump --uri="${uri}" --archive=${filename} --gzip`);
    console.log("Backup created:", filename);
  } catch (err) {
    console.error("Backup failed", err);
  }
}
