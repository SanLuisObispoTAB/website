// Allowlist of parent-window origins permitted to receive the Decap OAuth
// postMessage. The GitHub OAuth App is registered with a single callback
// URL (vercel.app), so OAuth must always round-trip through vercel.app,
// but the *postMessage targetOrigin* must match the actual parent admin
// window's origin — which may differ when board members hit Decap via
// the SLOHS-firewall-friendly CNAME alias.
//
// Only origins explicitly listed here can receive the access token. An
// attacker hosting a page that opens our OAuth flow with a spoofed
// Referer will fail this check and the token won't leak.

export const ALLOWED_ADMIN_ORIGINS: ReadonlySet<string> = new Set([
  "https://slo-tab-website.vercel.app",
  "https://slotab.ravens-peak-consulting.com",
  "https://slotab.org",
  "http://localhost:3000",
]);

export function isAllowedAdminOrigin(origin: string | null | undefined): boolean {
  if (!origin) return false;
  return ALLOWED_ADMIN_ORIGINS.has(origin);
}

export function extractOrigin(urlString: string | null | undefined): string | null {
  if (!urlString) return null;
  try {
    return new URL(urlString).origin;
  } catch {
    return null;
  }
}
