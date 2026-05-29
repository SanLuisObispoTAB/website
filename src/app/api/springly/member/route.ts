import { NextRequest, NextResponse } from "next/server";

// Stub API route for the SLOTAB "Join Online" form on the Membership page.
//
// When SPRINGLY_API_BASE and SPRINGLY_API_KEY are set as Vercel env vars,
// this route POSTs the payload to Springly's contact/member endpoint.
// Without them it returns a clear 200 response that the form can render
// so the board can demo the flow without real Springly credentials.

type JoinPayload = {
  name?: unknown;
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
  let body: JoinPayload;
  try {
    body = (await req.json()) as JoinPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const name = sanitize(body.name);
  const email = sanitize(body.email);
  const tier = sanitize(body.tier);
  const phone = sanitize(body.phone);
  const note = sanitize(body.note);

  if (!name || !email || !tier) {
    return NextResponse.json(
      { ok: false, error: "name, email, and tier are required." },
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
    // Not yet configured — respond with a clear stub message so the
    // form can show what a successful flow will look like.
    return NextResponse.json({
      ok: true,
      stubbed: true,
      message:
        "Accepted in stub mode. Springly isn't connected yet — when the API key is set, this request will create a real member record automatically.",
      echo: { name, email, tier, phone, note },
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
        name,
        email,
        custom: { membership_tier: tier, phone, note },
        tags: ["website-join", tier.toLowerCase().replace(/\s+/g, "-")],
      }),
    });
    if (!res.ok) {
      // Log the upstream detail server-side; don't echo it to the public
      // client (it can leak Springly internals / API structure).
      const text = await res.text();
      console.error("Springly member create rejected", res.status, text.slice(0, 400));
      return NextResponse.json(
        { ok: false, error: "Membership couldn't be submitted. Please try again later." },
        { status: 502 },
      );
    }
    // Don't return the raw upstream record to the browser — the form only
    // needs to know it succeeded.
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Springly member create failed", err);
    return NextResponse.json(
      { ok: false, error: "Unable to reach Springly. Please try again later." },
      { status: 502 },
    );
  }
}
