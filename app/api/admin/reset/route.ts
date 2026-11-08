import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { resetElection } from "@/lib/store";

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const count = Math.min(Math.max(Number(body.count) || 20, 1), 500);
  const tokens = await resetElection(count);
  return NextResponse.json({ ok: true, count: tokens.length });
}
