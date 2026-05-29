import { NextRequest, NextResponse } from "next/server";

// Stub API route for the "Become a Business Sponsor" form. Same design as
// /api/springly/member — sanitizes input, echoes back in stub mode when
// Springly env vars aren't set, or forwards to Springly's contacts endpoint
// when they are.

type SponsorPayload = {
  business?: unknown;
  contact?: unknown;
  email?: unknown;
  tier?: unknown;
  phone?: unknown;
  note?: unknown;
};

function sanitize(s: unknown): string {
  if (typeof s !== "string") return "";
  return s.replace(/<[^>]+>/g, "").slice(0, 500).trim();
}
function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: NextRequest) {
  let body: SponsorPayload;
  try {
    body = (await req.json()) as SponsorPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const business = sanitize(body.business);
  const contact = sanitize(body.contact);
  const email = sanitize(body.email);
  const tier = sanitize(body.tier);
  const phone = sanitize(body.phone);
  const note = sanitize(body.note);

  if (!business || !contact || !email || !tier) {
    return NextResponse.json(
      {
        ok: false,
        error: "business, contact, email, and tier are required.",
      },
      { status: 400 },
    );
  }
  if (!isEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const springlyBase = process.env.SPRINGLY_API_BASE;
  const springlyKey = process.env.SPRINGLY_API_KEY;

  if (!springlyBase || !springlyKey) {
    return NextResponse.json({
      ok: true,
      stubbed: true,
      message:
        "Accepted in stub mode. Springly isn't connected yet — when the API key is set, this request will create a real sponsor record automatically.",
      echo: { business, contact, email, tier, phone, note },
    });
  }

  try {
    const res = await fetch(`${springlyBase}/contacts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${springlyKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: business,
        email,
        custom: {
          sponsorship_tier: tier,
          primary_contact: contact,
          phone,
          note,
        },
        tags: ["website-sponsor", tier.toLowerCase()],
      }),
    });
    if (!res.ok) {
      // Log the upstream detail server-side; don't echo it to the public
      // client (it can leak Springly internals / API structure).
      const text = await res.text();
      console.error("Springly sponsor create rejected", res.status, text.slice(0, 400));
      return NextResponse.json(
        { ok: false, error: "Sponsorship couldn't be submitted. Please try again later." },
        { status: 502 },
      );
    }
    // Don't return the raw upstream record to the browser — the form only
    // needs to know it succeeded.
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Springly sponsor create failed", err);
    return NextResponse.json(
      { ok: false, error: "Unable to reach Springly. Please try again later." },
      { status: 502 },
    );
  }
}
