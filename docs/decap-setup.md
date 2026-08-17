# Decap CMS setup for the SLOTAB website

The admin UI lives at:

```
https://slo-tab-website.vercel.app/admin/
```

(Editors on the SLOHS district network use the firewall-friendly CNAME
alias `https://slotab.ravens-peak-consulting.com/admin/` — same content,
different DNS path. Both are wired up in the OAuth flow.)

Decap lets anyone with GitHub Write access to the
`SanLuisObispoTAB/website` repo edit the site's content collections in a
browser — no code, no terminal. Saves become git commits, which Vercel
picks up and redeploys automatically (~60s).

Two pieces have to be in place for sign-in to work: a GitHub OAuth App
under the SanLuisObispoTAB org, and two env vars on Vercel. This is a
**one-time setup** that takes about five minutes.

---

## 1. Create the GitHub OAuth App

1. Sign in to GitHub as an org admin of `SanLuisObispoTAB`.
2. Open <https://github.com/organizations/SanLuisObispoTAB/settings/applications>
   → **OAuth Apps** → **New OAuth App**.
3. Fill in:
   - **Application name:** `SLOTAB Decap CMS`
   - **Homepage URL:** `https://slo-tab-website.vercel.app`
   - **Authorization callback URL:**
     `https://slo-tab-website.vercel.app/api/decap/callback`
4. Click **Register application**.
5. On the next page, click **Generate a new client secret** and copy
   both values somewhere safe for the next step:
   - **Client ID** — public, starts with `Ov23...` or similar
   - **Client secret** — sensitive, shown exactly once

> GitHub OAuth Apps only allow one callback URL at a time. When
> slotab.org cuts over, either update the callback URL on this same
> OAuth App or create a second one for the slotab.org callback and use
> different env vars for that environment.
>
> Sign-in already works from BOTH `slo-tab-website.vercel.app` and the
> CNAME alias `slotab.ravens-peak-consulting.com` — the postMessage
> target origin is host-aware (see `src/app/api/decap/origin-allowlist.ts`)
> even though the OAuth callback host is fixed.

## 2. Add the secrets to Vercel

1. Open the project in Vercel → **Settings** → **Environment Variables**.
2. Add these two variables, checking **Production**, **Preview**, and **Development**:
   - `DECAP_GITHUB_CLIENT_ID` = the Client ID from step 1
   - `DECAP_GITHUB_CLIENT_SECRET` = the Client secret from step 1
3. Click **Save**.
4. Trigger a redeploy (Vercel → **Deployments** → **…** → **Redeploy**
   on the latest main deployment) so the new env vars are baked in.

## 3. Grant editors access to the repo

Decap commits as the logged-in user, so every board member who will be
editing content needs **Write** (or higher) access to the
`SanLuisObispoTAB/website` GitHub repo.

1. GitHub → repo → **Settings** → **Collaborators and teams**.
2. Click **Add people** and invite each editor by GitHub username or
   email. Role: **Write**.
3. They accept the invite in their email / GitHub notifications.

Editors **do not need to install anything locally**. They sign in to
GitHub once in the browser and then everything happens at `/admin/`.

The non-technical version of this — written for board members who've
never used GitHub — lives at [editor-onboarding.md](editor-onboarding.md)
and is also rendered (board-only) at
[/board/cms-access](https://slo-tab-website.vercel.app/board/cms-access).

## 4. Test the flow

1. Go to `https://slo-tab-website.vercel.app/admin/`.
2. Click **Login with GitHub**.
3. A popup asks you to authorize the "SLOTAB Decap CMS" app — click
   **Authorize**.
4. The popup closes and you land in the Decap UI with the editable
   collections in the left sidebar.
5. Make a trivial edit (e.g. flip a board roster year label), click
   **Save**, then **Publish now**. Within ~60 seconds Vercel will
   redeploy and the change is live.

---

## How the auth works (reference)

Decap's "github" backend opens a popup pointed at `/api/decap/auth`,
which redirects to GitHub's authorize URL. After the user authorizes
the app, GitHub redirects back to `/api/decap/callback` with a
temporary `?code=...`. The callback exchanges the code for an access
token server-side (keeping the client secret private) and posts the
token back to the opener window using Decap's documented
`window.postMessage` protocol. Decap then talks directly to the GitHub
API with that token for all subsequent read/write operations.

The postMessage `targetOrigin` is computed from the original `Referer`
at the start of the flow and validated against
`src/app/api/decap/origin-allowlist.ts` (vercel.app, the ravens-peak
CNAME alias, slotab.org, localhost). This is what makes login work
from both the `*.vercel.app` host and the firewall-friendly alias.

Both routes live in `src/app/api/decap/` and only depend on
`DECAP_GITHUB_CLIENT_ID` and `DECAP_GITHUB_CLIENT_SECRET`.

---

## Troubleshooting

**"DECAP_GITHUB_CLIENT_ID not set" on sign-in**
The env vars aren't deployed. Go back to step 2 and redeploy.

**"The redirect URI in the request does not match" from GitHub**
The callback URL on the OAuth App doesn't exactly match
`https://slo-tab-website.vercel.app/api/decap/callback`. It's case-
and slash-sensitive.

**"Login with GitHub" popup hangs / never closes**
Usually one of two things:
1. The user is hitting `/admin` from an origin that isn't in
   `origin-allowlist.ts` — add it.
2. A previous incognito/private-window OAuth session is stuck. Try a
   fresh incognito window.

**Save button greyed out**
The user's GitHub account doesn't have Write access to the repo. See
step 3.

**Changes don't appear on the live site**
Check Vercel → **Deployments**. Each Decap save should trigger a new
deployment tagged with the commit Decap made.
