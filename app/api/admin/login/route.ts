import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieValue, checkPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (!process.env.ADMIN_PASSWORD)
    return NextResponse.json({ error: "ADMIN_PASSWORD belum diatur di environment." }, { status: 500 });
  if (!checkPassword(String(password ?? ""))) return NextResponse.json({ error: "Password salah." }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminCookieValue()!, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
