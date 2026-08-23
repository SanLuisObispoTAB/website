import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  composeFulfilmentEmail,
  type SponsorshipPayment,
} from "../../../../lib/sponsor-fulfilment";
import {
  composeDonationEmail,
  type DonationPayment,
} from "../../../../lib/donation-notification";
import { sendEmail } from "../../../../lib/email";
import { squareApiBase } from "../../../../lib/square";
import { notificationUrls } from "../../../../lib/square-webhook";

// Square -> SLOTAB. Fires when a payment completes, and tells the Membership VP
// what just happened — the perks a new business sponsorship owes, or the donor
// and designation behind a new donation.
//
// THE DONATION HALF EXISTS BECAUSE SQUARE'S OWN NOTIFICATION STOPPED SAYING IT
// Dannene, 2026-08-23: "I am not getting enough information now when someone
// donates." Correct, and it is our doing rather than Square's. Before #181 a
// donation was a Square Online storefront sale, which raises an ORDER
// notification naming the item and the buyer; a minted payment link raises a
// PAYMENT notification, which names an amount. Square offers no setting for the
// contents of either, so the detail has to come back from us — #187.
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

/** Where donation notifications go. Its own variable rather than a reuse of
 *  `SPONSOR_FULFILMENT_EMAIL`: today both are the Membership VP, but a
 *  sponsorship handoff is a work order and a donation notice is a heads-up, and
 *  the board may well want the second somewhere the first should not go — the
 *  Treasurer, or a shared board address. Splitting them now costs one line;
 *  splitting them later means changing a recipient someone already relies on. */
const DONATION_INBOX =
  process.env.DONATION_NOTIFICATION_EMAIL ?? "slotabmembership@gmail.com";

/** Square signs `notificationUrl + rawBody` with HMAC-SHA256, base64, where
 *  `notificationUrl` is the URL **as configured in the Square dashboard** —
 *  character for character. A trailing slash, a `www.`, or a different path all
 *  fail every signature.
 *
 *  Accepts SEVERAL candidate URLs, and that is the point (#191). This
 *  integration was dead for days because the dashboard said
 *  `https://slotab.org/api/webhook` while the code lived at
 *  `/api/square/webhook`, and the only symptom was silence. One env var that
 *  has to match a setting in someone else's dashboard is a single point of
 *  quiet failure; a small set of accepted URLs is not.
 *
 *  This does NOT weaken the check. Each candidate is compared against an HMAC
 *  computed with the secret key, so an attacker who cannot produce that HMAC
 *  gains nothing from there being more than one accepted URL — they still have
 *  to forge a signature, for any one of them.
 *
 *  Compared with `timingSafeEqual`, and length-checked first because
 *  `timingSafeEqual` throws on a length mismatch rather than returning false. */
function signatureValid(
  rawBody: string,
  headerSignature: string | null,
  signatureKey: string,
  notificationUrls: string[],
): boolean {
  if (!headerSignature) return false;
  const received = Buffer.from(headerSignature);
  return notificationUrls.some((url) => {
    const expected = Buffer.from(
      createHmac("sha256", signatureKey)
        .update(url + rawBody)
        .digest("base64"),
    );
    return (
      expected.length === received.length && timingSafeEqual(expected, received)
    );
  });
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
  const urls = notificationUrls();

  // Refuse to process anything unverifiable. An unauthenticated endpoint that
  // sends mail on request is a spam relay pointed at a volunteer's inbox.
  if (!signatureKey || urls.length === 0) {
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
      urls,
    )
  ) {
    // The URL is in the log line on purpose. Square signs
    // `notificationUrl + rawBody`, so the single most likely cause of a
    // rejection is that SQUARE_WEBHOOK_URL and the URL configured in the
    // Square dashboard are not the same string — a trailing slash, a `www.`,
    // or the wrong path. "bad signature" alone sends you looking at the key,
    // which is almost never it. Neither value here is secret: one is a public
    // endpoint, the other is the URL the caller asked for. The signature key
    // is NOT logged.
    console.warn(
      "[square-webhook] bad signature — rejected. Tried " +
        `${urls.length} notification URL(s): ${urls.join(" , ")} ; ` +
        `request arrived at ${req.url}. Square signs the URL exactly as the ` +
        "dashboard has it, so if none of those match it character for " +
        "character, fix that before suspecting the key.",
    );
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

  if (metadata.kind === "donation") {
    return handleDonation(payment, metadata);
  }
  if (metadata.kind !== "sponsorship") {
    // Money taken at this location outside the website — an invoice, a card
    // reader at a game. Nothing on our side knows what it was for, so there is
    // nothing to say about it.
    return NextResponse.json({ ok: true, ignored: "not from the website" });
  }

  const sponsorship: SponsorshipPayment = {
    businessName: metadata.business,
    tierId: metadata.tier ?? "",
    amountCents: payment.amount_money?.amount ?? 0,
    sportSlugs: metadata.sports ? metadata.sports.split(",").filter(Boolean) : [],
    buyerName: metadata.donor || buyerName(payment),
    buyerEmail: payment.buyer_email_address,
    // Was always "not provided" until #187 put it in order metadata: Square's
    // Payment object has no phone field, and the number the sponsor typed only
    // ever existed as checkout prefill.
    buyerPhone: metadata.phone,
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

/** Tell the Membership VP a donation landed, with the fields Square's payment
 *  notification cannot carry: who gave, what they designated it to, how it
 *  splits, and whether they may be named on the donor wall. */
async function handleDonation(
  payment: SquarePayment,
  metadata: Record<string, string>,
): Promise<Response> {
  // Designation is the one field this email exists to deliver, so a payment
  // without one is not worth sending: it would say "New donation: $75 — " and
  // send the reader to the dashboard anyway. It also should not happen — the
  // form refuses to hand off an undesignated gift — so it is logged, not
  // swallowed.
  if (!metadata.designation) {
    console.error(
      `[square-webhook] donation ${payment.id} has no metadata.designation — no email sent`,
    );
    return NextResponse.json({ ok: true, ignored: "no designation" });
  }

  const gift: DonationPayment = {
    designation: metadata.designation,
    amountCents: payment.amount_money?.amount ?? 0,
    level: metadata.level,
    tribute: metadata.tribute,
    // The name the donor typed on our form, which is the one they meant. The
    // Square billing name is the cardholder and is shown separately when the
    // two differ.
    donorName: metadata.donor,
    donorEmail: payment.buyer_email_address,
    donorPhone: metadata.phone,
    cardholderName: buyerName(payment),
    // `wall` is written ONLY when the donor opted out — an always-present "yes"
    // would spend one of Square's ten metadata slots to say "behave normally",
    // and a Hall of Fame gift already fills all ten. So absence is read as
    // consent, which is what the checked-by-default box means.
    //
    // The composer keeps a third state for "genuinely unknown" and this
    // deliberately does not use it. The only payments that reach here carry
    // metadata this route wrote, and every build that writes `kind: "donation"`
    // from #187 onward also writes the opt-out. The narrow exception is a
    // checkout link minted before this deploy and paid after it — those would
    // read as consent, and the mitigation is that the donation email does not
    // exist until this deploy either, so there is no window in which a stale
    // link produces a wrong-headed one.
    displayOnWall: metadata.wall !== "no",
    paymentId: payment.id,
    orderId: payment.order_id,
    paidAt: payment.created_at,
    isTest: metadata.test === "true",
  };

  const email = composeDonationEmail(gift);
  const result = await sendEmail({
    to: DONATION_INBOX,
    subject: email.subject,
    text: email.text,
  });
  console.log(
    `[square-webhook] donation email for ${payment.id}: ${result.status}`,
  );
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
