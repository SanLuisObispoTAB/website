// Minimal Square Checkout API client.
//
// Deliberately plain `fetch` rather than the Square SDK: this needs exactly one
// endpoint, and a hand-rolled call is easier to audit than a dependency in the
// path of every donation. Swap it for the SDK if the surface grows.
//
// See decision #144 for why payment links are the rail. The short version: the
// designation has to ride in the **line item name**, because Square's order
// metadata is capped at 10 pairs, is private to the calling application, and
// never reaches a QuickBooks report. Metadata is still attached here, but only
// for our own future reconciliation sidetool — never treat it as the record.

const SQUARE_VERSION = "2025-06-18";

export type Money = { amount: number; currency: "USD" };

export type PaymentLinkInput = {
  /** Shown to the buyer as the checkout heading, and the string that lands in
   *  Square's item reporting. This is the durable record of what the gift was
   *  for, so it is built server-side from trusted data — never from the client. */
  lineItemName: string;
  /** Whole cents. Validated by the caller before it reaches here. */
  amountCents: number;
  /** Attached to the resulting Payment. Max 500 chars, truncated below. */
  note?: string;
  /** Our own bookkeeping. Max 10 keys, values max 255 chars — Square rejects
   *  the whole request if either is exceeded, so both are enforced here. */
  metadata?: Record<string, string>;
  /** Prefills the buyer's email on the checkout form. Optional and defensive —
   *  see `createPaymentLink`. */
  buyerEmail?: string;
  /** Where Square returns the buyer after payment. */
  redirectUrl: string;
};

export type PaymentLinkResult = { url: string; orderId: string };

function config() {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  const environment = process.env.SQUARE_ENVIRONMENT ?? "sandbox";
  if (!token || !locationId) {
    throw new Error(
      "Square is not configured — SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID must be set",
    );
  }
  const base =
    environment === "production"
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";
  return { token, locationId, base };
}

/** True when Square is configured at all. Lets callers degrade to the old
 *  storefront handoff rather than showing a donor an error. */
export function isSquareConfigured(): boolean {
  return Boolean(
    process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID,
  );
}

function sanitizeMetadata(md: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(md)) {
    if (Object.keys(out).length >= 10) break; // Square's hard cap
    if (!/^[A-Za-z0-9_-]{1,60}$/.test(k)) continue; // Square's allowed key charset
    out[k] = String(v).slice(0, 255);
  }
  return out;
}

function buildBody(input: PaymentLinkInput, locationId: string, idempotencyKey: string) {
  return {
    idempotency_key: idempotencyKey,
    order: {
      location_id: locationId,
      line_items: [
        {
          name: input.lineItemName.slice(0, 500),
          quantity: "1",
          base_price_money: { amount: input.amountCents, currency: "USD" },
        },
      ],
      ...(input.metadata ? { metadata: sanitizeMetadata(input.metadata) } : {}),
    },
    checkout_options: {
      redirect_url: input.redirectUrl,
      ask_for_shipping_address: false,
    },
    ...(input.note ? { payment_note: input.note.slice(0, 500) } : {}),
  };
}

/** Creates a Square-hosted checkout link with the amount and designation
 *  already baked in.
 *
 *  The buyer email is prefilled on a best-effort basis. Square validates it
 *  server-side and rejects addresses it dislikes with a hard `400` — a real
 *  `INVALID_EMAIL_ADDRESS` on `test.parent@example.com` is what surfaced this.
 *  A donor whose address Square won't accept must still be able to give, so a
 *  rejection retries once without the prefill instead of failing the donation.
 *  Losing a prefilled field is a far smaller harm than losing the gift. */
export async function createPaymentLink(
  input: PaymentLinkInput,
): Promise<PaymentLinkResult> {
  const { token, locationId, base } = config();
  const idempotencyKey = crypto.randomUUID();

  const post = async (withEmail: boolean) => {
    const body = buildBody(input, locationId, idempotencyKey) as Record<string, unknown>;
    if (withEmail && input.buyerEmail) {
      body.pre_populated_data = { buyer_email: input.buyerEmail };
    }
    const res = await fetch(`${base}/v2/online-checkout/payment-links`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Square-Version": SQUARE_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    return { res, json: (await res.json()) as SquareResponse };
  };

  let { res, json } = await post(true);

  if (!res.ok && isEmailRejection(json)) {
    // Same idempotency key on purpose: the first attempt created nothing.
    ({ res, json } = await post(false));
  }

  if (!res.ok || !json.payment_link?.url) {
    throw new SquareError(
      json.errors?.map((e) => `${e.code}: ${e.detail ?? ""}`).join("; ") ||
        `Square returned ${res.status}`,
      res.status,
    );
  }

  return {
    url: json.payment_link.url,
    orderId: json.payment_link.order_id ?? "",
  };
}

type SquareResponse = {
  payment_link?: { url?: string; order_id?: string };
  errors?: Array<{ code?: string; detail?: string; field?: string }>;
};

function isEmailRejection(json: SquareResponse): boolean {
  return Boolean(
    json.errors?.some(
      (e) =>
        e.code === "INVALID_EMAIL_ADDRESS" ||
        e.field === "pre_populated_data.buyer_email",
    ),
  );
}

export class SquareError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "SquareError";
    this.status = status;
  }
}
