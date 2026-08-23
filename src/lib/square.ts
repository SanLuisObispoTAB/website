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

/** Shown on Square's hosted checkout as the seller contact. Same address
 *  the membership and sponsorship flows use, so a donor who writes in
 *  reaches the people who can actually answer. */
const SUPPORT_EMAIL = "slotabmembership@gmail.com";

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
  /** Prefills the buyer's details on the checkout form. All optional and all
   *  defensive — see `createPaymentLink`. The donor has already typed these on
   *  our page; making them type them again on Square's is friction we control
   *  and should not be spending. */
  buyerEmail?: string;
  buyerPhone?: string;
  /** Carried in `buyer_address.first_name` / `last_name` — Square has no
   *  top-level name field, and the Address object is where it documents the
   *  recipient's name. No street address is sent; `ask_for_shipping_address`
   *  is off and a donation has nothing to ship. */
  buyerFirstName?: string;
  buyerLastName?: string;
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

/** Which Square to talk to. Exported because the webhook route needs the same
 *  answer, and this string was already written out twice in this file — a
 *  third copy is how sandbox and production drift apart. */
export function squareApiBase(): string {
  return (process.env.SQUARE_ENVIRONMENT ?? "sandbox") === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

function config(previewUnlock = false) {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
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
  return { token, locationId, base: squareApiBase() };
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

/** Square's hard cap on order metadata pairs. Exceed it and Square rejects the
 *  whole request, which would fail the gift — so keys are dropped here instead.
 *
 *  This used to be comfortable headroom and is not any more: a Hall of Fame
 *  gift with a level, a tribute and the donor block added in #186 lands on
 *  exactly ten. The next key added anywhere in the donation path will silently
 *  push one off the end, and the ones at risk are the ones added last, which is
 *  the donor block the Membership VP's notification is built from. Hence the
 *  log below — a dropped key must never be discovered by a volunteer noticing
 *  a blank line in an email. */
const METADATA_MAX_KEYS = 10;

function sanitizeMetadata(md: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  const dropped: string[] = [];
  for (const [k, v] of Object.entries(md)) {
    if (!/^[A-Za-z0-9_-]{1,60}$/.test(k)) continue; // Square's allowed key charset
    if (Object.keys(out).length >= METADATA_MAX_KEYS) {
      dropped.push(k);
      continue;
    }
    out[k] = String(v).slice(0, 255);
  }
  if (dropped.length) {
    console.error(
      `[square] order metadata over Square's ${METADATA_MAX_KEYS}-key cap — ` +
        `DROPPED: ${dropped.join(", ")}. The gift still goes through, but ` +
        "anything keyed on those fields (the Treasurer's report, the " +
        "membership notification) is now missing them.",
    );
  }
  return out;
}

function buildBody(input: PaymentLinkInput, locationId: string, idempotencyKey: string) {
  return {
    idempotency_key: idempotencyKey,
    // A long shot at Square's own notification, and worth the one line either
    // way. Dannene's 2026-08-23 screenshots show the payment notification
    // rendering the literal words "Payment Link" where the storefront's order
    // notification named the item — so the line item name below is evidently
    // NOT what that email reads. `description` is the payment link's own name
    // and the next most likely candidate.
    //
    // UNVERIFIED against the notification email: proving it needs a real
    // payment through a real link, which is a live charge in the club's
    // account. What it definitely does do is name the link in the Square
    // dashboard's payment-link list, where every entry currently reads the
    // same. Square caps this at 250 characters.
    //
    // This is a bonus, not the fix. The fix is the webhook email (#186), which
    // does not depend on Square rendering anything.
    description: input.lineItemName.slice(0, 250),
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
      // Square's hosted checkout is built for retail, and it shows retail
      // furniture by default that reads as nonsense on a donation:
      //   enable_coupon  — an "Add coupon" box. SLOTAB has never issued a
      //     discount code and cannot; a donor who sees the field wonders
      //     whether they are missing one, or whether they are buying
      //     something rather than giving.
      //   enable_loyalty — a REWARDS opt-in. A booster club has no loyalty
      //     programme, and inviting someone to earn points on a charitable
      //     gift is the wrong note entirely.
      // Both off. Neither is a payment control, so nothing is lost.
      enable_coupon: false,
      enable_loyalty: false,
      // Square's page is the one screen in this flow that isn't ours, so it
      // is also the one place a confused donor has nowhere to turn. This puts
      // a real SLOTAB address in front of them without their having to
      // navigate back.
      merchant_support_email: SUPPORT_EMAIL,
    },
    ...(input.note ? { payment_note: input.note.slice(0, 500) } : {}),
  };
}

/** Creates a Square-hosted checkout link with the amount and designation
 *  already baked in.
 *
 *  Buyer details are prefilled on a best-effort basis — see the retry below
 *  for why "best-effort" is doing real work in that sentence. */
export async function createPaymentLink(
  input: PaymentLinkInput,
  options: PaymentLinkOptions = {},
): Promise<PaymentLinkResult> {
  const { token, locationId, base } = config(options.previewUnlock ?? false);
  const idempotencyKey = crypto.randomUUID();

  const post = async (withPrefill: boolean) => {
    const body = buildBody(input, locationId, idempotencyKey) as Record<string, unknown>;
    if (withPrefill) {
      const prefill: Record<string, unknown> = {};
      if (input.buyerEmail) prefill.buyer_email = input.buyerEmail;
      if (input.buyerPhone) prefill.buyer_phone_number = input.buyerPhone;
      if (input.buyerFirstName || input.buyerLastName) {
        prefill.buyer_address = {
          ...(input.buyerFirstName ? { first_name: input.buyerFirstName } : {}),
          ...(input.buyerLastName ? { last_name: input.buyerLastName } : {}),
        };
      }
      if (Object.keys(prefill).length > 0) body.pre_populated_data = prefill;
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

  if (!res.ok && isPrefillRejection(json)) {
    // Square validates these server-side and is stricter than we can usefully
    // be — a real INVALID_EMAIL_ADDRESS on an example.com address is what
    // surfaced this. Any prefill field it dislikes takes down the whole
    // request, so the retry drops the prefill entirely rather than trying to
    // guess which field offended. Losing prefilled fields is a far smaller
    // harm than losing the gift.
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

function isPrefillRejection(json: SquareResponse): boolean {
  return Boolean(
    json.errors?.some(
      (e) =>
        e.code === "INVALID_EMAIL_ADDRESS" ||
        e.code === "INVALID_PHONE_NUMBER" ||
        e.field?.startsWith("pre_populated_data"),
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
  /** Whether Square will actually take a card here. BOTH conditions are
   *  required and the first cost us a wrong diagnosis: the location must be
   *  **ACTIVE**, and its capabilities must include CREDIT_CARD_PROCESSING.
   *
   *  An INACTIVE location keeps its capabilities — SLOTAB's own account has
   *  one listing CREDIT_CARD_PROCESSING while INACTIVE — so checking
   *  capabilities alone reports a healthy location that Square refuses at the
   *  checkout page with "This business is currently not accepting payments".
   *  Either fault produces that same message, and neither is visible until a
   *  buyer hits it. */
  canTakePayments: boolean;
  /** Kept separate so the panel can distinguish "deactivated" (reactivate it)
   *  from "never had card processing" (an account-level problem). */
  hasCardCapability: boolean;
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
  const base = squareApiBase();

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

    const locations: SquareLocationInfo[] = (json.locations ?? []).map((l) => {
      const hasCardCapability = (l.capabilities ?? []).includes(
        "CREDIT_CARD_PROCESSING",
      );
      const status = l.status ?? "UNKNOWN";
      return {
        id: l.id,
        name: l.name ?? "(unnamed)",
        status,
        hasCardCapability,
        canTakePayments: hasCardCapability && status === "ACTIVE",
      };
    });

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
        : match.hasCardCapability
          ? `Location "${match.name}" is ${match.status}, not ACTIVE. It has card processing but Square will not take payments at a deactivated location — this is the cause of "This business is currently not accepting payments". Reactivate it in the Square dashboard (Account & Settings → Business → Locations), or point SQUARE_LOCATION_ID at an ACTIVE location below.`
          : `Location "${match.name}" has no CREDIT_CARD_PROCESSING capability, so Square will not take cards there.`,
    };
  } catch (err) {
    return {
      ok: false,
      ...empty,
      error: err instanceof Error ? err.message : "Could not reach Square",
    };
  }
}
