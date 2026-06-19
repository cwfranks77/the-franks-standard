/**
 * Placeholder email sender. Replace with real provider integration.
 */
export async function sendEmail(to: string, subject: string, body: string) {
  console.log("Sending email", { to, subject });
  // TODO: integrate with SendGrid, SES, Postmark, etc.
}
