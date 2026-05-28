import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (
    !process.env.APP_PASSWORD ||
    !process.env.SESSION_SECRET ||
    password !== process.env.APP_PASSWORD
  ) {
    return NextResponse.json({ error: "Password incorreta" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("cr_session", process.env.SESSION_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    path: "/",
  });
  return res;
}
