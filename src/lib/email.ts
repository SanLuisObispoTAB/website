// Minimal outbound email, over HTTP rather than SMTP.
//
// The club has no mail infrastructure and this repo has exactly two runtime
// dependencies (next, react), so this deliberately adds none: Resend's REST
// API over `fetch`. Swapping providers means changing `send()` and nothing
// else — every caller sees the same result shape.
//
// THE RULE HERE: never fail silently. A fulfilment email that vanishes is
// worse than one that was never built, because the board will believe the
// handoff is automated and stop asking. Every path returns a status the
// caller logs, and an unconfigured mailer logs the full message body so the
// content is recoverable from the Vercel logs.

export type EmailResult =
  | { status: "sent"; id?: string }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string };

export type EmailMessage = {
  /** One address, or several. An array is what a board report needs: the
   *  Treasurer owns the numbers, but a report only one person can see is one
   *  person's memory — #218 added a second recipient for exactly that reason.
   *  Every existing caller passes a single string and is unaffected. */
  to: string | string[];
  subject: string;
  text: string;
  /** Sent as Resend's `Idempotency-Key`. Two sends with the same key inside
   *  24 hours produce ONE email — Resend answers the second with the first's
   *  response and does not send again. The webhook keys on the Square payment
   *  id, so a retried or replayed delivery cannot double-mail the Membership
   *  VP (#251, from the independent review's SEC-06). Optional: the weekly
   *  report passes none, because a re-run of the cron *should* send again. */
  idempotencyKey?: string;
};

/** Normalized recipient list — one place, so the log line and the request
 *  body can never disagree about who a message went to. */
function recipients(to: string | string[]): string[] {
  return (Array.isArray(to) ? to : [to]).map((a) => a.trim()).filter(Boolean);
}

/** Whether outbound mail is wired up. Exposed so a caller can decide whether
 *  a feature is worth advertising, rather than discovering it at send time. */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(msg: EmailMessage): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = recipients(msg.to);

  // An empty recipient list is a caller bug, and Resend would reject it with a
  // 422 that reads like a From-domain problem — the one failure this file's
  // comments already warn is hard to diagnose. Name it here instead.
  if (to.length === 0) {
    console.error(`[email] no recipients for "${msg.subject}" — not sent`);
    return { status: "failed", reason: "no recipients" };
  }

  if (!apiKey || !from) {
    // Not an error — the club may genuinely not have set this up yet. Loud, so
    // nobody believes the handoff is running when it isn't.
    //
    // The body is withheld in production ON PURPOSE. It carries a named
    // person's email and phone number, and Vercel logs are readable by anyone
    // with project access and are retained well beyond the life of the
    // request — a worse place for a sponsor's contact details than the inbox
    // they were meant for. Nothing is lost by withholding it: the payment is
    // still in Square, and the handoff regenerates from it once a key is set.
    // In development the full text prints, because that is where the content
    // actually needs reading.
    const detail =
      process.env.NODE_ENV === "production"
        ? "  (body withheld — it contains the sponsor's contact details)"
        : `\n${msg.text}`;
    console.warn(
      "[email] not configured (RESEND_API_KEY / EMAIL_FROM unset) — message NOT sent:\n" +
        `  to: ${to.join(", ")}\n  subject: ${msg.subject}\n${detail}`,
    );
    return { status: "skipped", reason: "email not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(msg.idempotencyKey ? { "Idempotency-Key": msg.idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from,
        to,
        subject: msg.subject,
        text: msg.text,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      // Body included: a 422 from Resend usually means the From domain isn't
      // verified, and that is not deducible from the status code alone.
      console.error(
        `[email] send failed ${res.status}: ${detail.slice(0, 500)}`,
      );
      return { status: "failed", reason: `provider returned ${res.status}` };
    }

    // Resend's message id. Worth carrying: it is the only handle that ties a
    // send in our logs to the record in Resend's dashboard, which is where the
    // actual delivered content can be read back. Callers log it (#196).
    const json = (await res.json().catch(() => ({}))) as { id?: string };
    return { status: "sent", id: json.id };
  } catch (err) {
    console.error("[email] send threw:", err);
    return { status: "failed", reason: "network or provider error" };
  }
}
