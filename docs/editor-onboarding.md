# Welcome to the new SLOTAB website editor team

Thanks for agreeing to help keep slotab.org current — these instructions
get you set up in about 10 minutes.

You don't need any tech background. The site uses a friendly browser
editor; no code, no terminals, nothing to install.

---

## First — about the email from GitHub

You should have received (or are about to receive) an email from GitHub
that looks something like this:

> **From:** notifications@github.com
> **Subject:** [GitHub] @eramberg has invited you to slo-tab-website

**This email is real. It's not spam.** Erik invited you to be a
collaborator on the website's content — that's how the editor signs you
in. Go ahead and open it. If you can't find it, check your spam folder
once, then ask Erik to resend.

(You may also see a similar notification when you next sign in to
GitHub — same thing, just delivered a different way.)

---

## Step 1 — Click "Accept invitation" in the email

The GitHub email has a green button labeled **"View invitation"** or
**"Accept invitation"**. Click it.

- **If you already have a GitHub account**, GitHub will ask you to sign
  in, then show a confirmation page. Click **Accept invitation**. You're
  done with this step.

- **If you don't have a GitHub account yet** (likely the case), the
  link takes you to GitHub's sign-up page. Create an account:

  - **Email**: use whatever email you want — work or personal, as long
    as you can check it. This is invisible on the site.
  - **Password**: anything you'll remember
  - **Username**: this is *visible* in the website's behind-the-scenes
    history. Pick something sensible — your name or initials are fine
    (e.g. `liz-moody`, `kashby`, `jblackburn`). You can change it later
    but it's annoying to do so.

  GitHub will email you a one-time verification code. Enter it.

  After you finish signing up, **come back to the original GitHub
  invitation email and click the green button again** — now that you
  have an account, it'll let you accept.

> ⚠️ **The invitation expires in 7 days.** If you wait too long, the
> link stops working and you'll need to ask Erik to re-invite you. Easy
> fix, but easier to just accept now.

---

## Step 2 — Open the editor

Once the invite is accepted, go to:

**<https://slo-tab-website.vercel.app/admin/>**

(Bookmark this URL — it's your editing dashboard.)

You'll see a black page with a single button:

> [ Login with GitHub ]

Click it.

---

## Step 3 — Authorize the editor (one-time, ~10 seconds)

A small popup window appears asking:

> **SLOTAB CMS — Vercel** wants to access your `slo-tab-website` account
>
> This will let it read and write to the website's content files.
>
> [ Authorize SLOTAB CMS — Vercel ]

Click **Authorize**. The popup closes by itself.

You only do this once per browser. Next time you visit the editor, it
signs you in automatically.

---

## Step 4 — You're in

You should now see the Decap editor with a list of collections on the
left side:

- **Business Sponsors** — the sponsor wall (logos, tiers)
- **Board Members** — names and roles on the Contact page
- **SLOTAB Events** — Spring Social, monthly meetings, fundraisers
- **Hall of Fame** — mission, ceremony info, Alumni Membership block
- **Hall of Fame — Inductees** — the list of past honorees
- **Impact Ledger** — what donations funded
- **Watch (Hudl)** — game stream cards
- **Teams Index** — the master list of CIF programs
- **Team — Football** — the Football team page (more teams coming)

Click any one to start editing. Don't worry about breaking things;
**every change is saved as a draft first** — nothing goes live until
you click "Publish now" on a draft.

---

## How editing works

1. **Open a collection** (e.g. *SLOTAB Events*) and click an existing
   entry, or **+ New** to create one.
2. **Make your edit** — text fields, dates, dropdowns, image uploads.
3. **Click Save** — saves it as a draft. You can come back and keep
   working on it.
4. **Click "Publish now"** when you're ready for the change to go live.

After you publish, the website re-deploys itself in about 60 seconds.
Refresh slotab.org (or the Vercel preview URL) and you'll see your edit.

If you accidentally publish something wrong, just edit it again and
re-publish. Or ask Erik or Kiwi to revert from the git history — every
edit is permanently logged.

---

## The "draft" safety net

Decap is configured so saving and publishing are **two separate steps**.
You can save a draft, walk away, come back, edit it more, and then
publish — or never publish, and discard the draft if you change your mind.

This means there's no "oh no I clicked the wrong thing and now it's
on the internet" scenario. Live changes only happen on **Publish now**.

---

## Uploading images (sponsor logos, photos)

Image fields have an **Upload** button. Click it, pick a file from your
computer, and Decap stores it inside the website's image library. The
image then renders in the right size and shape automatically — no need
to crop or resize beforehand.

Recommended sizes (any of these will work; the site rescales):

- Sponsor logos: any size, any format (PNG / JPG / SVG)
- Photos: 1200px wide or larger looks best

---

## What you should NOT touch

The collections in Decap are limited to safe content fields. You won't
see code, page layouts, or design files in there. If something you want
to edit isn't in the editor, that's intentional — ask Erik or Kiwi.

The editor will not let you delete the entire site or break the layout
even if you tried — your role only allows content edits, not structural
changes.

---

## Help / something feels off

- **Can't find the GitHub email** → check spam, then ask Erik to resend
  the invite.
- **The link to /admin shows a "404 Not Found"** → make sure the URL
  has `/admin/` (with the trailing slash). If still broken, message Erik.
- **Login with GitHub does nothing** → try in an incognito / private
  window first. If still stuck, ask Erik (probably a GitHub session
  conflict in your browser).
- **You hit "save" and nothing happened** → scroll up; there's usually
  a small red error message at the top explaining what's missing
  (e.g. a required field).
- **You accidentally published something wrong** → fix it and publish
  again, or message Erik / Kiwi to roll it back.

---

## What's next

Once you're comfortable poking around, we'll have a short kickoff call
to walk through the collections you'll own most often (e.g. for the
Membership VP, that's Business Sponsors + Board Members; for
Communications, that's SLOTAB Events + Hall of Fame).

In the meantime — feel free to make any small edit (try the Board
Members year label, or add yourself to a placeholder list) so you get a
feel for the save/publish cycle. Nothing you do can hurt anything.

Welcome aboard, and thank you.

— Erik
