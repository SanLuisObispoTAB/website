import { NextResponse } from "next/server";
import { boardCookieOptions, isSameOriginRequest } from "../../../../lib/board-auth";

// POST → clears the board session cookie and returns ok. The /board page
// wraps this in a tiny form.
//
// The cookie attributes come from lib/board-auth.ts, the same place the login
// route gets them: a logout that clears a cookie with a different name or
// path than the one login set would clear nothing and say it had (#240).
//
// Origin-checked like the other board POSTs (#248). Forcing a board member
// out is only a nuisance, but the rule is simpler with no exceptions.

export async function POST(req: Request) {
  if (!isSameOriginRequest(req)) {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ ...boardCookieOptions(), value: "", maxAge: 0 });
  return res;
}
