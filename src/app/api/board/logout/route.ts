import { NextResponse } from "next/server";

// POST → clears the board session cookie and returns ok. The /board/logout
// page wraps this in a tiny client-side form.

const COOKIE_NAME = "slotab_board";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
