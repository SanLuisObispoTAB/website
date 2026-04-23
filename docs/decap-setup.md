# Decap CMS setup for the SLOTAB preview

The admin UI lives at:

```
https://www.ravens-peak-consulting.com/admin/
```

It lets anyone with GitHub access to the `eramberg/ravens-peak-consulting`
repo edit three collections in a browser — sponsors, the board roster, and
the SLOTAB event list — without touching the code. Saves become git commits,
which Vercel picks up and redeploys automatically.

Before it can sign users in, a GitHub OAuth app has to be created and two
environment variables have to be added to Vercel. This is a **one-time
setup** that takes about five minutes.

---

## 1. Create a GitHub OAuth App

1. Sign in to GitHub as the owner of `eramberg/ravens-peak-consulting`.
2. Open <https://github.com/settings/developers> → **OAuth Apps** → **New OAuth App**.
3. Fill in:
   - **Application name:** `SLOTAB Decap CMS`
   - **Homepage URL:** `https://www.ravens-peak-consulting.com/slotab-preview`
   - **Authorization callback URL:**
     `https://www.ravens-peak-consulting.com/api/decap/callback`
4. Click **Register application**.
5. On the next page, click **Generate a new client secret** and copy both
   values somewhere safe for the next step:
   - **Client ID** — public, starts with `Ov23...` or similar
   - **Client secret** — sensitive, shown exactly once

> When you later promote this to production on `slotab.org`, either update
> the callback URL on the same OAuth App or create a second OAuth App with
> the slotab.org callback and use different env vars for that project.
> GitHub OAuth Apps only allow one callback URL at a time.

## 2. Add the secrets to Vercel

1. Open the Raven's Peak project in Vercel → **Settings** → **Environment Variables**.
2. Add these two variables, checking **Production**, **Preview**, and **Development**:
   - `DECAP_GITHUB_CLIENT_ID` = the Client ID from step 1
   - `DECAP_GITHUB_CLIENT_SECRET` = the Client secret from step 1
3. Click **Save**.
4. Trigger a redeploy (Vercel → **Deployments** → **...** → **Redeploy** on
   the latest main deployment) so the new env vars are baked in.

## 3. Grant editors access to the repo

Decap commits as the logged-in user, so every board member who will be
editing content needs **Write** (or higher) access to the
`eramberg/ravens-peak-consulting` GitHub repo.

1. GitHub → repo → **Settings** → **Collaborators**.
2. Invite each editor by GitHub username or email.
3. They accept the invite in their email / GitHub notifications.

Editors **do not need to install anything locally**. They sign in to GitHub
once in the browser and then everything happens at `/admin/`.

## 4. Test the flow

1. Go to `https://www.ravens-peak-consulting.com/admin/`.
2. Click **Login with GitHub**.
3. A popup asks you to authorize the "SLOTAB Decap CMS" app — click
   **Authorize**.
4. The popup closes and you land in the Decap UI with three collections:
   **Business Sponsors**, **Board Members**, **SLOTAB Events**.
5. Make a trivial edit (e.g. change the board roster year label), click
   **Save**, then **Publish now**. Within ~60 seconds Vercel will redeploy
   and the change is live.

---

## What's editable today

### Business Sponsors (`data/sponsors.json`)
- Add, remove, reorder sponsors within each tier
- Upload a new logo (goes to `public/uploads/`)
- Promote or demote sponsors between Platinum/Gold/Silver/Bronze

### Board Members (`data/board.json`)
- Change the school-year label ("2025-26")
- Add, remove, reorder board members
- Update names, roles, and public email addresses

### SLOTAB Events (`data/slotab-events.json`)
- Add non-sport events: Spring Social, monthly meetings, Physical Night, fundraisers
- Edit dates, times, and venue detail lines
- Sport events (baseball, softball, etc.) are NOT edited here — they come
  from the SLOHS athletic department weekly sheet via the scheduled GitHub
  Action, and Decap won't overwrite them.

## What's NOT editable yet (could be added)

- Free-form pages (About, Volunteer, Membership intro text) are still in
  React components. Converting them to markdown + a Decap collection is a
  half-day of work — ask me when you want it done.
- The homepage hero carousel photos
- Navigation / footer text
- Merch tile labels

---

## How the auth works (reference)

Decap's "github" backend opens a popup pointed at
`/api/decap/auth`, which redirects to GitHub's authorize URL. After the
user authorizes the app, GitHub redirects back to `/api/decap/callback`
with a temporary `?code=...`. The callback exchanges the code for an
access token server-side (keeping the client secret private) and posts
the token back to the opener window using Decap's documented
`window.postMessage` protocol. Decap then talks directly to the GitHub
API with that token for all subsequent read/write operations.

Both routes live in `src/app/api/decap/` and only depend on
`DECAP_GITHUB_CLIENT_ID` and `DECAP_GITHUB_CLIENT_SECRET`.

---

## Troubleshooting

**"DECAP_GITHUB_CLIENT_ID not set" on sign-in**
The env vars aren't deployed. Go back to step 2 and redeploy.

**"The redirect URI in the request does not match" from GitHub**
The callback URL on the OAuth App doesn't exactly match
`https://www.ravens-peak-consulting.com/api/decap/callback`. It's case-
and slash-sensitive.

**Save button greyed out**
The user's GitHub account doesn't have Write access to the repo. See
step 3.

**Changes don't appear on the live site**
Check Vercel → **Deployments**. Each Decap save should trigger a new
deployment tagged with the commit that Decap made.
