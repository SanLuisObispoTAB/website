import { isEmailConfigured } from "./email";

export type NotificationStatus = {
  /** One line, safe to render on its own. */
  summary: string;
  /** What to do about it, or what it means that it is working. */
  detail: string;
};

/** Whether the two automatic emails will actually send, and if not, which
 *  variable is missing.
 *
 *  WHY THIS IS ON A PAGE AT ALL
 *  Both mails are gated on environment variables nobody can see. The
 *  sponsorship handoff (#177) and the donation checklist (#186) fail *safe* —
 *  they log loudly and send nothing — which means the failure mode is silence,
 *  and silence is indistinguishable from "no donations this week". The board
 *  was told twice that these were blocked on four variables when two of them
 *  had in fact been set for the Monday report to Trina (#180). Nobody was
 *  wrong; there was simply no way to look.
 *
 *  Same reasoning as the Square config panel in #150: a 503 that means "not
 *  configured" and a 503 that means "misconfigured" are the same 503, and
 *  guessing between them costs a working day.
 *
 *  Names variables, never values. This page is behind the board password, but
 *  a signature key is a signature key. */
export function notificationConfig(): NotificationStatus {
  const mailer = isEmailConfigured();
  const webhook = Boolean(
    process.env.SQUARE_WEBHOOK_SIGNATURE_KEY && process.env.SQUARE_WEBHOOK_URL,
  );

  const missing: string[] = [];
  if (!process.env.RESEND_API_KEY) missing.push("RESEND_API_KEY");
  if (!process.env.EMAIL_FROM) missing.push("EMAIL_FROM");
  if (!process.env.SQUARE_WEBHOOK_SIGNATURE_KEY) {
    missing.push("SQUARE_WEBHOOK_SIGNATURE_KEY");
  }
  if (!process.env.SQUARE_WEBHOOK_URL) missing.push("SQUARE_WEBHOOK_URL");

  if (mailer && webhook) {
    return {
      summary: "✅ on — a new donation or sponsorship emails the Membership VP",
      detail:
        "Trina's Monday report is on too. If one stops arriving, that is a " +
        "fault to chase, not a quiet week.",
    };
  }
  if (mailer && !webhook) {
    return {
      summary: "🟡 half on — Trina's Monday report will send; the per-payment emails will not",
      detail:
        `Missing: ${missing.join(", ")}. Square Dashboard → Developers → ` +
        "Webhooks: subscribe to payment.updated at " +
        "https://slotab.org/api/square/webhook, then set the signature key " +
        "and that exact URL in Vercel. Nothing else is needed.",
    };
  }
  return {
    summary: "🔴 off — no automatic email will send, and none will error either",
    detail: `Missing in Vercel: ${missing.join(", ")}.`,
  };
}
