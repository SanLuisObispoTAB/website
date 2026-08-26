// The one place this site writes back to its own repository.
//
// WHY IT EXISTS
// The Board Hub needs an Accept button for the donor wall, and a volunteer
// board should not be copying JSON into a CMS to say "yes, list this donor"
// (#199). Vercel's filesystem is read-only, so the only way a button can change
// `donors.json` is to commit it — which means a repo-write credential living in
// a web-facing path.
//
// HOW THAT CREDENTIAL IS KEPT SMALL
// The token is the blast radius, so everything here is built to shrink it:
//   · `GITHUB_TOKEN` should be a FINE-GRAINED token scoped to this repository
//     only, with Contents: read and write and nothing else. Not a classic PAT,
//     which is account-wide.
//   · This module writes exactly one path, `ALLOWED_PATH`, and refuses any
//     other. A caller cannot ask it to rewrite a route handler.
//   · The caller (`/api/board/donor-wall`) checks the board session AND
//     re-derives the pending list from Square, refusing any name that is not
//     genuinely waiting. So the worst this token can do, in the hands of
//     someone who got past the board password, is list a donor who really did
//     consent — or mark one dismissed.
//   · Absent token means the buttons are disabled and say so. It never fails
//     halfway.

const ALLOWED_PATH = "src/app/data/donors.json";

export type CommitResult =
  | { ok: true; sha: string }
  | { ok: false; reason: string };

export function isRepoWriteConfigured(): boolean {
  return Boolean(process.env.GITHUB_TOKEN && repoSlug());
}

/** `owner/repo`. Defaults to this repository; overridable for a fork. */
function repoSlug(): string {
  return process.env.GITHUB_REPO || "SanLuisObispoTAB/website";
}

function branch(): string {
  return process.env.GITHUB_BRANCH || "main";
}

async function gh(path: string, init?: RequestInit) {
  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

/** Read the file's current contents and blob sha.
 *
 *  The sha matters: it is passed back on write so GitHub rejects the commit if
 *  the file changed in between. Two board members clicking Accept at the same
 *  moment then produces one commit and one honest error, rather than one of
 *  them silently overwriting the other. */
export async function readJsonFile(
  path: string,
): Promise<{ ok: true; json: unknown; sha: string } | { ok: false; reason: string }> {
  if (path !== ALLOWED_PATH) return { ok: false, reason: "path not allowed" };
  if (!isRepoWriteConfigured()) return { ok: false, reason: "GITHUB_TOKEN not set" };
  const res = await gh(
    `/repos/${repoSlug()}/contents/${encodeURIComponent(path)}?ref=${branch()}`,
  );
  if (!res.ok) return { ok: false, reason: `GitHub read failed ${res.status}` };
  const body = (await res.json()) as { content?: string; sha?: string };
  if (!body.content || !body.sha) return { ok: false, reason: "unexpected GitHub response" };
  try {
    return {
      ok: true,
      json: JSON.parse(Buffer.from(body.content, "base64").toString("utf8")),
      sha: body.sha,
    };
  } catch {
    return { ok: false, reason: "file on GitHub is not valid JSON" };
  }
}

/** Commit a replacement for the file. `sha` must be the one just read. */
export async function writeJsonFile(
  path: string,
  value: unknown,
  sha: string,
  message: string,
): Promise<CommitResult> {
  if (path !== ALLOWED_PATH) return { ok: false, reason: "path not allowed" };
  if (!isRepoWriteConfigured()) return { ok: false, reason: "GITHUB_TOKEN not set" };
  // Trailing newline so the committed file matches what an editor would write
  // and the diff stays one line rather than "\\ No newline at end of file".
  const content = Buffer.from(JSON.stringify(value, null, 2) + "\n", "utf8").toString(
    "base64",
  );
  const res = await gh(`/repos/${repoSlug()}/contents/${encodeURIComponent(path)}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content,
      sha,
      branch: branch(),
      committer: {
        name: "SLOTAB Board Hub",
        email: "slotabmembership@gmail.com",
      },
    }),
  });
  if (res.status === 409) {
    return { ok: false, reason: "someone else changed the wall — reload and retry" };
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return { ok: false, reason: `GitHub write failed ${res.status}: ${detail.slice(0, 200)}` };
  }
  const body = (await res.json()) as { commit?: { sha?: string } };
  return { ok: true, sha: body.commit?.sha ?? "" };
}
