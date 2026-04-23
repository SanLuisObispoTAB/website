import { NextRequest, NextResponse } from "next/server";

// Decap CMS "github" backend OAuth handshake — step 1 of 2.
//
// Decap opens this endpoint in a popup when the user clicks "Login with
// GitHub" in /admin. We generate a CSRF-prevention nonce,
// store it in an httpOnly cookie, forward it as the OAuth state parameter
// to GitHub, and verify it in /api/decap/callback before exchanging the
// authorization code.

function generateNonce(length = 32): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => chars[b % chars.length]).join("");
}

export async function GET(req: NextRequest) {
  const clientId = process.env.DECAP_GITHUB_CLIENT_ID;
  if (!clientId) {
    return new NextResponse(
      "OAuth configuration incomplete. Contact the site administrator.",
      { status: 500 },
    );
  }

  const origin = new URL(req.url).origin;
  const callback = `${origin}/api/decap/callback`;

  // Generate a CSRF nonce and store it in an httpOnly cookie so
  // the callback can verify it. We prepend any state Decap sent
  // with our nonce, separated by a colon.
  const nonce = generateNonce();
  const decapState = req.nextUrl.searchParams.get("state") ?? "";
  const combinedState = `${nonce}:${decapState}`;

  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", callback);
  authorizeUrl.searchParams.set("scope", "repo,user");
  authorizeUrl.searchParams.set("state", combinedState);

  const response = NextResponse.redirect(authorizeUrl.toString());
  response.cookies.set("decap_oauth_nonce", nonce, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/api/decap",
    maxAge: 600, // 10 minutes — generous for a popup login flow
  });
  return response;
}
