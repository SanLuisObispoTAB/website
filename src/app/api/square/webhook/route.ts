import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  composeFulfilmentEmail,
  type SponsorshipPayment,
} from "../../../../lib/sponsor-fulfilment";
import { sendEmail } from "../../../../lib/email";
import { squareApiBase } from "../../../../lib/square";

// Square -> SLOTAB. Fires when a payment completes, and hands a new business
// sponsorship to the Membership VP with everything she needs to start
// fulfilling the perks.
//
// WHY A WEBHOOK AND NOT THE THANK-YOU PAGE
// `/thank-you` only renders if the buyer comes back to the site after paying.
// Plenty don't — they close the tab, or Square's redirect is eaten by a
// corporate mail client's link handling. A sponsorship that never generated a
// handoff because someone closed a tab is exactly the silent failure this is
// meant to remove. A webhook is server-to-server and Square retries it.
//
// SETUP (Square Dashboard -> Developers -> Webhooks):
//   URL:            https://slotab.org/api/square/webhook
//   Event:          payment.updated
//   Signature key:  copy into SQUARE_WEBHOOK_SIGNATURE_KEY
// Then set SQUARE_WEBHOOK_URL to that exact URL — Square signs the URL string
// as configured, so it has to match character for character, and
// RESEND_API_KEY + EMAIL_FROM for the mail itself.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Where the handoff goes. The Membership VP owns sponsor fulfilment. */
const FULFILMENT_INBOX =
  process.env.SPONSOR_FULFILMENT_EMAIL ?? "slotabmembership@gmail.com";

/** Square signs `notificationUrl + rawBody` with HMAC-SHA256, base64.
 *
 *  Compared with `timingSafeEqual`, and length-checked first because
 *  `timingSafeEqual` throws on a length mismatch rather than returning false. */
function signatureValid(
  rawBody: string,
  headerSignature: string | null,
  signatureKey: string,
  notificationUrl: string,
): boolean {
  if (!headerSignature) return false;
  const expected = createHmac("sha256", signatureKey)
    .update(notificationUrl + rawBody)
    .digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(headerSignature);
  return a.length === b.length && timingSafeEqual(a, b);
}

type SquarePayment = {
  id?: string;
  status?: string;
  created_at?: string;
  order_id?: string;
  note?: string;
  amount_money?: { amount?: number; currency?: string };
  buyer_email_address?: string;
  shipping_address?: { first_name?: string; last_name?: string };
  billing_address?: { first_name?: string; last_name?: string };
};

function buyerName(p: SquarePayment): string | undefined {
  const addr = p.billing_address ?? p.shipping_address;
  const name = [addr?.first_name, addr?.last_name].filter(Boolean).join(" ");
  return name || undefined;
}

export async function POST(req: Request) {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const notificationUrl = process.env.SQUARE_WEBHOOK_URL;

  // Refuse to process anything unverifiable. An unauthenticated endpoint that
  // sends mail on request is a spam relay pointed at a volunteer's inbox.
  if (!signatureKey || !notificationUrl) {
    console.error(
      "[square-webhook] refusing: SQUARE_WEBHOOK_SIGNATURE_KEY and SQUARE_WEBHOOK_URL must both be set",
    );
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const rawBody = await req.text();
  if (
    !signatureValid(
      rawBody,
      req.headers.get("x-square-hmacsha256-signature"),
      signatureKey,
      notificationUrl,
    )
  ) {
    console.warn("[square-webhook] bad signature — rejected");
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }

  let event: {
    type?: string;
    data?: { object?: { payment?: SquarePayment } };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "malformed body" }, { status: 400 });
  }

  const payment = event.data?.object?.payment;

  // Square retries, and `payment.updated` fires on every state change. Only a
  // COMPLETED payment is money in the account, and acknowledging everything
  // else with a 200 stops Square retrying events we deliberately ignore.
  if (event.type !== "payment.updated" || payment?.status !== "COMPLETED") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Order metadata is where the sponsorship details live — see the
  // payment-link route, which sets kind/tier/business/sports/test.
  const metadata = await fetchOrderMetadata(payment.order_id);
  if (metadata.kind !== "sponsorship") {
    // Donations go through the same rail but owe no perks, so there is nothing
    // to hand off. If the club ever wants a donation notification too, this is
    // the branch to extend.
    return NextResponse.json({ ok: true, ignored: "not a sponsorship" });
  }

  const sponsorship: SponsorshipPayment = {
    businessName: metadata.business,
    tierId: metadata.tier ?? "",
    amountCents: payment.amount_money?.amount ?? 0,
    sportSlugs: metadata.sports ? metadata.sports.split(",").filter(Boolean) : [],
    buyerName: buyerName(payment),
    buyerEmail: payment.buyer_email_address,
    paymentId: payment.id,
    orderId: payment.order_id,
    paidAt: payment.created_at,
    isTest: metadata.test === "true",
  };

  const email = composeFulfilmentEmail(sponsorship);
  if (!email) {
    console.error(
      `[square-webhook] unknown tier "${sponsorship.tierId}" on payment ${payment.id} — no email sent`,
    );
    return NextResponse.json({ ok: true, ignored: "unknown tier" });
  }

  const result = await sendEmail({
    to: FULFILMENT_INBOX,
    subject: email.subject,
    text: email.text,
  });
  console.log(
    `[square-webhook] fulfilment email for ${payment.id}: ${result.status}`,
  );

  // 200 regardless of the mail result: the payment is real either way, and a
  // non-2xx makes Square retry, which would re-send a mail that may well have
  // gone out. Send failures are logged (and `sendEmail` logs the whole body
  // when unconfigured), so nothing is lost.
  return NextResponse.json({ ok: true, email: result.status });
}

/** Square's payment webhook carries no order metadata, so fetch the order.
 *  Returns an empty object on any failure — the caller treats "no metadata"
 *  as "not a sponsorship", which is the safe direction to fail. */
async function fetchOrderMetadata(
  orderId?: string,
): Promise<Record<string, string>> {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!orderId || !token) return {};
  try {
    const res = await fetch(`${squareApiBase()}/v2/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Square-Version": "2025-06-18",
      },
    });
    if (!res.ok) {
      console.error(`[square-webhook] order fetch failed ${res.status}`);
      return {};
    }
    const json = (await res.json()) as {
      order?: { metadata?: Record<string, string> };
    };
    return json.order?.metadata ?? {};
  } catch (err) {
    console.error("[square-webhook] order fetch threw:", err);
    return {};
  }
}
