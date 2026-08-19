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

/** Set only by the secret preview page — see `credentialsUsableHere`. */
export type PaymentLinkOptions = { previewUnlock?: boolean };

/** The live public site, as opposed to a preview deployment or a local run.
 *  `VERCEL_ENV` is injected by the platform and is the only signal that
 *  distinguishes these — `NODE_ENV` is "production" for preview builds too. */
function isLiveSite(): boolean {
  return process.env.VERCEL_ENV === "production";
}

/** THE GUARD THIS FILE MOST NEEDS.
 *
 *  Sandbox credentials on the live site are more dangerous than no credentials
 *  at all. Nothing would error: the code would happily mint a link against
 *  `connect.squareupsandbox.com`, and a real parent would be handed a
 *  sandbox checkout that accepts only test cards and moves no money. They would
 *  reasonably believe they had donated. A silent failure on a fundraising
 *  site's primary conversion path is the worst outcome available, and it is
 *  exactly what a deploy made before the production token arrives would do.
 *
 *  So the live site refuses to run on sandbox credentials. `isSquareConfigured`
 *  reports false, the route answers 503, and the client falls back to the #140
 *  storefront handoff — which is unglamorous but takes real money. Shipping
 *  this ahead of the production token is therefore a no-op for donors rather
 *  than a trap, and the new flow switches itself on the moment the real
 *  credentials land. */
function credentialsUsableHere(previewUnlock = false): boolean {
  if (!process.env.SQUARE_ACCESS_TOKEN || !process.env.SQUARE_LOCATION_ID) {
    return false;
  }
  if (!isLiveSite()) return true;
  if (process.env.SQUARE_ENVIRONMENT === "production") return true;
  // The one sanctioned exception: a request that proved it came from the
  // secret preview page. Sandbox on the live site is safe there because the
  // page says so in the loudest terms available and only someone holding the
  // slug can reach it.
  return previewUnlock;
}

/** The secret path segment that unlocks the preview checkout, or undefined
 *  when the feature is switched off. Deliberately env-driven and absent from
 *  the repo: a slug committed to source control is not a secret. Unset means
 *  the preview route 404s, which is the correct default. */
export function squarePreviewSlug(): string | undefined {
  const slug = process.env.SQUARE_PREVIEW_SLUG?.trim();
  return slug && slug.length >= 8 ? slug : undefined;
}

/** Constant-time-ish comparison. The slug is a nuisance barrier rather than a
 *  credential — nothing behind it moves money — but there is no reason to leak
 *  its length or prefix through early-exit timing. */
export function isPreviewUnlock(token: unknown): boolean {
  const slug = squarePreviewSlug();
  if (!slug || typeof token !== "string" || token.length !== slug.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < slug.length; i++) {
    diff |= slug.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return diff === 0;
}

function config(previewUnlock = false) {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  const environment = process.env.SQUARE_ENVIRONMENT ?? "sandbox";
  if (!token || !locationId) {
    throw new Error(
      "Square is not configured — SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID must be set",
    );
  }
  // Defence in depth: the route gates on `isSquareConfigured`, but this is the
  // function that actually chooses which Square to talk to, so it refuses too.
  if (!credentialsUsableHere(previewUnlock)) {
    throw new Error(
      "Refusing to use sandbox Square credentials on the live site — set SQUARE_ENVIRONMENT=production with a production token",
    );
  }
  const base =
    environment === "production"
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";
  return { token, locationId, base };
}

/** True when Square is configured *and* those credentials are safe to use in
 *  this environment. Callers degrade to the old storefront handoff rather than
 *  showing a donor an error — see `credentialsUsableHere`. */
export function isSquareConfigured(previewUnlock = false): boolean {
  return credentialsUsableHere(previewUnlock);
}

/** Whether the **public** /donate and /membership pages should use the new
 *  checkout, as opposed to the preview route.
 *
 *  Separate from `isSquareConfigured` on purpose, and the distinction is the
 *  whole point: without it, putting a production token in Vercel is an
 *  all-or-nothing switch that makes the new flow live for every donor the
 *  instant it is saved. There would be no way to look at the real production
 *  checkout before real people are using it — and "deploy it and watch" is a
 *  poor plan for the page that takes the money.
 *
 *  With this flag, a production token can go in while the public site stays on
 *  the storefront: the board reviews the genuine production checkout through
 *  `/donate/preview/<slug>`, and flipping SQUARE_LIVE_DONATE to "true" is a
 *  deliberate, separate, instantly reversible act.
 *
 *  Defaults to off. Anything other than the exact string "true" is off, so a
 *  typo fails safe rather than launching. */
export function isPublicCheckoutEnabled(): boolean {
  return credentialsUsableHere() && process.env.SQUARE_LIVE_DONATE === "true";
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
  options: PaymentLinkOptions = {},
): Promise<PaymentLinkResult> {
  const { token, locationId, base } = config(options.previewUnlock ?? false);
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


// ---------------------------------------------------------------------------
// CREDENTIAL SELF-CHECK
//
// Swapping in a production token is a three-variable change, and getting one
// of the three wrong fails in ways the donate page cannot report: the public
// endpoint answers a flat 503 whether the credentials are perfect, absent, or
// mismatched, because the launch flag gates it either way. That leaves no way
// to tell "correctly configured and waiting" from "quietly broken".
//
// The two mistakes this is built to catch, because they are the ones the swap
// invites:
//   1. SQUARE_ENVIRONMENT left on "sandbox" — a production token sent to the
//      sandbox host, which returns UNAUTHORIZED.
//   2. SQUARE_LOCATION_ID left as the sandbox location — the token
//      authenticates fine, and every payment link then fails because that
//      location does not exist in the production account.
//
// Deliberately reports names and ids only, never the token. Rendered on the
// slug-gated preview page, and it goes when that route goes.

export type SquareLocationInfo = {
  id: string;
  name: string;
  status: string;
  /** Square only takes card payments at a location whose capabilities include
   *  CREDIT_CARD_PROCESSING. A location can be ACTIVE and still lack it, which
   *  is what produces the checkout page reading "This business is currently
   *  not accepting payments" — the link is created happily, and only the buyer
   *  ever sees the refusal. */
  canTakePayments: boolean;
};

export type SquareCredentialCheck = {
  ok: boolean;
  environment: string;
  /** Whether SQUARE_LOCATION_ID was found in the account the token belongs to. */
  locationMatches: boolean;
  locationName?: string;
  /** False when the matched location cannot process cards — the specific
   *  cause of "This business is currently not accepting payments". */
  locationCanTakePayments: boolean;
  locationStatus?: string;
  merchantId?: string;
  locations: SquareLocationInfo[];
  error?: string;
};

export async function verifySquareCredentials(): Promise<SquareCredentialCheck> {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  const environment = process.env.SQUARE_ENVIRONMENT ?? "sandbox";
  const base =
    environment === "production"
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";

  const empty = {
    environment,
    locationMatches: false,
    locationCanTakePayments: false,
    locations: [] as SquareLocationInfo[],
  };

  if (!token || !locationId) {
    return {
      ok: false,
      ...empty,
      error: "SQUARE_ACCESS_TOKEN or SQUARE_LOCATION_ID is not set",
    };
  }

  try {
    const res = await fetch(`${base}/v2/locations`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Square-Version": SQUARE_VERSION,
      },
      cache: "no-store",
    });
    const json = (await res.json()) as {
      locations?: Array<{
        id: string;
        name?: string;
        status?: string;
        merchant_id?: string;
        capabilities?: string[];
      }>;
      errors?: Array<{ code?: string; detail?: string }>;
    };

    if (!res.ok) {
      const detail =
        json.errors?.map((e) => `${e.code}: ${e.detail ?? ""}`).join("; ") ??
        `HTTP ${res.status}`;
      return {
        ok: false,
        ...empty,
        error:
          res.status === 401
            ? `${detail} — this usually means SQUARE_ENVIRONMENT ("${environment}") doesn't match the token you set.`
            : detail,
      };
    }

    const locations: SquareLocationInfo[] = (json.locations ?? []).map((l) => ({
      id: l.id,
      name: l.name ?? "(unnamed)",
      status: l.status ?? "UNKNOWN",
      canTakePayments: (l.capabilities ?? []).includes("CREDIT_CARD_PROCESSING"),
    }));

    const raw = (json.locations ?? []).find((l) => l.id === locationId);
    const match = locations.find((l) => l.id === locationId);

    if (!match) {
      return {
        ok: false,
        ...empty,
        locations,
        merchantId: (json.locations ?? [])[0]?.merchant_id,
        error:
          "SQUARE_LOCATION_ID is not a location in this account — check you used the Live Location ID, not the sandbox one.",
      };
    }

    return {
      ok: match.canTakePayments,
      environment,
      locationMatches: true,
      locationName: match.name,
      locationStatus: match.status,
      locationCanTakePayments: match.canTakePayments,
      merchantId: raw?.merchant_id,
      locations,
      error: match.canTakePayments
        ? undefined
        : `Location "${match.name}" cannot process card payments (status ${match.status}). This is the cause of "This business is currently not accepting payments" — the payment link is created fine and Square refuses at the checkout page.`,
    };
  } catch (err) {
    return {
      ok: false,
      ...empty,
      error: err instanceof Error ? err.message : "Could not reach Square",
    };
  }
}
