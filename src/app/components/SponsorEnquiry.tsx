"use client";

import { useRef, useState } from "react";

// A `mailto:` link is a request that the *operating system* do something, and
// it fails silently when it can't: no registered mail handler, webmail-only
// users, locked-down machines, and sandboxed browser contexts all produce a
// button that visibly does nothing. That is survivable on a "questions?" link
// and not survivable here — this is the enrolment path for $500-$10,000
// sponsorships, and a business that clicks and sees nothing is gone.
//
// So the click never depends on mailto. It opens a panel that shows the
// address and the message in copyable form, and *offers* the email app as one
// of three ways out. Whatever the machine is configured to do, the business
// can always complete the step.
export default function SponsorEnquiry({
  email,
  subject,
  body,
  buttonLabel = "Start your sponsorship",
  buttonClassName = "tiger-btn tiger-btn-primary tiger-btn-arrow",
}: {
  email: string;
  subject: string;
  body: string;
  buttonLabel?: string;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"none" | "ok" | "fail">("none");
  const textRef = useRef<HTMLTextAreaElement>(null);

  const mailto =
    `mailto:${email}?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;

  async function copy() {
    const text = `To: ${email}\nSubject: ${subject}\n\n${body}`;
    try {
      // Requires a secure context; throws on http:// origins and in some
      // embedded views, hence the selection fallback below.
      await navigator.clipboard.writeText(text);
      setCopied("ok");
    } catch {
      const el = textRef.current;
      if (el) {
        el.focus();
        el.select();
      }
      setCopied("fail");
    }
    window.setTimeout(() => setCopied("none"), 4000);
  }

  if (!open) {
    return (
      <button
        type="button"
        className={buttonClassName}
        onClick={() => setOpen(true)}
      >
        {buttonLabel}
      </button>
    );
  }

  return (
    <div className="slotab-enquiry" role="group" aria-label="Sponsorship enquiry">
      <p className="slotab-enquiry-lead">
        Send this to <a href={`mailto:${email}`}>{email}</a> and we&apos;ll take
        it from there.
      </p>

      <textarea
        ref={textRef}
        className="slotab-enquiry-text"
        readOnly
        rows={12}
        value={body}
        aria-label="Sponsorship enquiry message"
        onFocus={(e) => e.currentTarget.select()}
      />

      <div className="slotab-enquiry-actions">
        <a href={mailto} className="slotab-btn">
          Open in your email app
        </a>
        <button type="button" className="slotab-btn outline" onClick={copy}>
          {copied === "ok" ? "Copied ✓" : "Copy the message"}
        </button>
      </div>

      <p className="slotab-enquiry-note" aria-live="polite">
        {copied === "ok"
          ? "Copied. Paste it into an email to the address above."
          : copied === "fail"
            ? "We couldn't copy it automatically — the text is selected, so press ⌘C / Ctrl+C."
            : "No email app? Copy the message and send it from webmail instead."}
      </p>
    </div>
  );
}
