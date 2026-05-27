const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const CRED_DIR = path.join(__dirname, "..", "..", "franks-standard-credentials");
const EMAIL_ENV = path.join(CRED_DIR, "email.env");
const PASS_NOTE = path.join(CRED_DIR, "MAILBOX-PASSWORD.txt");
const pass = process.argv[2] || "FranksMail26!";
const envBody = [
  "# Namecheap Private Email - info@thefranksstandard.com",
  "EMAIL_USER=info@thefranksstandard.com",
  "EMAIL_PASS=" + pass,
  "",
].join("\n");
fs.mkdirSync(CRED_DIR, { recursive: true });
fs.writeFileSync(EMAIL_ENV, envBody, "utf8");
fs.writeFileSync(PASS_NOTE, "info@thefranksstandard.com\nPassword: " + pass + "\n", "utf8");
console.log("Wrote email.env");
const r = spawnSync(process.execPath, [path.join(__dirname, "test-mailbox.cjs")], { stdio: "inherit", cwd: path.join(__dirname, "..") });
process.exit(r.status ?? 1);