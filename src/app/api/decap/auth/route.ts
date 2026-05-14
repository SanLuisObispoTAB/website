import { NextRequest, NextResponse } from "next/server";
import {
  extractOrigin,
  isAllowedAdminOrigin,
} from "../origin-allowlist";

// Decap CMS "github" backend OAuth handshake — step 1 of 2.
//
// Decap opens this endpoint in a popup when the user clicks "Login with
// GitHub" in /admin. We generate a CSRF-prevention nonce,
// store it in an httpOnly cookie, forward it as the OAuth state parameter
// to GitHub, and verify it in /api/decap/callback before exchanging the
// authorization code.
//
// We also capture the *parent admin window's origin* from the Referer
// header (this popup was just opened from the Decap admin), so the
// callback knows which origin to postMessage the token back to. Decap's
// base_url is hardcoded to vercel.app in config.yml, but board members
// access /admin via the slotab.ravens-peak-consulting.com CNAME alias —
// the callback's postMessage targetOrigin must match the parent's actual
// origin or the browser silently drops the message and login hangs.

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

  // Capture the parent admin origin from Referer. Falls back to the
  // request origin (vercel.app) if Referer is missing or not allowlisted.
  const refererOrigin = extractOrigin(req.headers.get("referer"));
  const parentOrigin =
    refererOrigin && isAllowedAdminOrigin(refererOrigin)
      ? refererOrigin
      : origin;

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
  response.cookies.set("decap_parent_origin", parentOrigin, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/api/decap",
    maxAge: 600,
  });
  return response;
}
