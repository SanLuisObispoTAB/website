import { NextRequest, NextResponse } from "next/server";

// Decap CMS "github" backend OAuth handshake — step 2 of 2.
//
// GitHub redirects the popup here with ?code=... after the user
// authorizes the OAuth app. We exchange the code for an access token,
// then render a tiny HTML page that uses window.opener.postMessage to
// hand the token back to the Decap admin in the parent window, matching
// the protocol documented at:
//   https://decapcms.org/docs/external-oauth-clients/

function htmlResponse(
  siteOrigin: string,
  status: "success" | "error",
  payload: { token?: string; provider?: string; error?: string },
) {
  const body =
    status === "success"
      ? `authorization:${payload.provider}:success:${JSON.stringify({ token: payload.token, provider: payload.provider })}`
      : `authorization:github:error:${JSON.stringify({ error: payload.error ?? "unknown" })}`;

  // SECURITY: postMessage is targeted to the known site origin (not "*")
  // so the GitHub access token cannot leak to a cross-origin opener.
  const html = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Decap OAuth</title></head>
<body>
<p>Finishing GitHub sign-in…</p>
<script>
(function () {
  var ORIGIN = ${JSON.stringify(siteOrigin)};
  var message = ${JSON.stringify(body)};
  function receive(e) {
    if (e.origin !== ORIGIN) return;
    if (!e.data || typeof e.data !== 'string') return;
    if (e.data !== 'authorizing:github') return;
    window.removeEventListener('message', receive, false);
    (e.source || window.opener).postMessage(message, ORIGIN);
  }
  window.addEventListener('message', receive, false);
  if (window.opener) {
    window.opener.postMessage('authorizing:github', ORIGIN);
  }
})();
</script>
</body>
</html>`;

  return new NextResponse(html, {
    status: status === "success" ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(req: NextRequest) {
  const clientId = process.env.DECAP_GITHUB_CLIENT_ID;
  const clientSecret = process.env.DECAP_GITHUB_CLIENT_SECRET;
  const origin = new URL(req.url).origin;

  if (!clientId || !clientSecret) {
    return htmlResponse(origin, "error", {
      error: "OAuth configuration incomplete. Contact the site administrator.",
    });
  }

  // CSRF validation: verify the state nonce matches the httpOnly cookie
  // that was set in /api/decap/auth before the GitHub redirect.
  const savedNonce = req.cookies.get("decap_oauth_nonce")?.value;
  const returnedState = req.nextUrl.searchParams.get("state") ?? "";
  const [returnedNonce] = returnedState.split(":", 2);

  if (!savedNonce || !returnedNonce || savedNonce !== returnedNonce) {
    return htmlResponse(origin, "error", {
      error: "OAuth state mismatch — possible CSRF. Please try logging in again.",
    });
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return htmlResponse(origin, "error", {
      error: "Missing authorization code.",
    });
  }

  try {
    const resp = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const data = (await resp.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!data.access_token) {
      return htmlResponse(origin, "error", {
        error: "GitHub authorization failed. Please try again.",
      });
    }

    return htmlResponse(origin, "success", {
      token: data.access_token,
      provider: "github",
    });
  } catch {
    return htmlResponse(origin, "error", {
      error: "Unable to complete GitHub sign-in. Please try again.",
    });
  }
}
