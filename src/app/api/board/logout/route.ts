import { NextResponse } from "next/server";
import { boardCookieOptions } from "../../../../lib/board-auth";

// POST → clears the board session cookie and returns ok. The /board page
// wraps this in a tiny form.
//
// The cookie attributes come from lib/board-auth.ts, the same place the login
// route gets them: a logout that clears a cookie with a different name or
// path than the one login set would clear nothing and say it had (#240).

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ ...boardCookieOptions(), value: "", maxAge: 0 });
  return res;
}
